"""
Computes an 11-dimensional feature vector for each (UserProfile, Match) pair.

Features:
  0  team_affinity          — favorite team is playing (0/1)
  1  rival_affinity         — rival of favorite team is playing (0–1)
  2  star_player_playing    — user's favorite player is in this squad (0/1)
  3  availability_score     — fraction of match time in user's free slots (0–1)
  4  timezone_penalty       — local hour inconvenience (0–1, late night = 1)
  5  rivalry_index          — H2H rivalry intensity from match data (0–10) → normalized /10
  6  star_power             — combined star power of both teams, normalized (0–1)
  7  group_stakes           — importance by round_in_group (0–1)
  8  expected_competitiveness — closeness of FIFA rankings (0–1, equal = 1)
  9  narrative_score        — pre-computed match narrative value (0–10) → normalized /10
  10 regional_affinity      — user country shares confederation with a team (0/1)
"""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import numpy as np

from app.modules.recommendations.recommendations_schemas import MatchData, TimeSlot, UserProfile

FEATURE_NAMES = [
    "team_affinity",
    "rival_affinity",
    "star_player_playing",
    "availability_score",
    "timezone_penalty",
    "rivalry_index",
    "star_power",
    "group_stakes",
    "expected_competitiveness",
    "narrative_score",
    "regional_affinity",
]

# Map confederation → set of country codes (ISO 3166-1 alpha-2)
_CONFEDERATION_COUNTRIES: dict[str, set[str]] = {
    "CONMEBOL": {"AR", "BR", "UY", "CO", "EC", "PY", "PE", "BO", "VE", "CL"},
    "UEFA": {
        "FR",
        "ES",
        "GB",
        "DE",
        "PT",
        "NL",
        "BE",
        "HR",
        "CH",
        "SE",
        "NO",
        "AT",
        "CZ",
        "SC",
        "TR",
        "BA",
        "RS",
        "IT",
        "PL",
        "RO",
        "HU",
    },
    "CAF": {
        "MA",
        "SN",
        "EG",
        "TN",
        "ZA",
        "DZ",
        "CV",
        "CI",
        "GH",
        "CD",
        "CM",
        "NG",
        "ZW",
        "KE",
        "ET",
    },
    "CONCACAF": {"US", "MX", "CA", "PA", "HT", "CW", "JM", "CR", "GT", "HN", "SV"},
    "AFC": {"JP", "KR", "IR", "SA", "AU", "QA", "IQ", "JO", "UZ", "KZ", "CN", "IN"},
    "OFC": {"NZ", "FJ", "PG"},
}

_GROUP_STAKES: dict[int, float] = {1: 0.55, 2: 0.75, 3: 0.95}
_MAX_FIFA_RANK = 210


def _normalize_names(names: list[str]) -> set[str]:
    return {n.lower().strip() for n in names}


def _user_confederation(country_code: str) -> str | None:
    for conf, codes in _CONFEDERATION_COUNTRIES.items():
        if country_code.upper() in codes:
            return conf
    return None


def _availability_score(match_utc: datetime, slots: list[TimeSlot], tz_name: str) -> float:
    """Fraction of a 2-hour match window overlapping the user's available slots."""
    try:
        tz = ZoneInfo(tz_name)
    except (ZoneInfoNotFoundError, KeyError):
        tz = ZoneInfo("UTC")

    match_local = match_utc.astimezone(tz)
    match_end = match_local + timedelta(hours=2)

    day_name = match_local.strftime("%A").lower()

    total_overlap = 0.0
    for slot in slots:
        if slot.day_of_week.lower() != day_name:
            continue
        slot_start = match_local.replace(
            hour=min(slot.start_hour, 23), minute=0, second=0, microsecond=0
        )
        if slot.end_hour == 24:
            slot_end = (match_local + timedelta(days=1)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
        else:
            slot_end = match_local.replace(hour=slot.end_hour, minute=0, second=0, microsecond=0)
        overlap_start = max(match_local, slot_start)
        overlap_end = min(match_end, slot_end)
        if overlap_end > overlap_start:
            total_overlap += (overlap_end - overlap_start).total_seconds()

    return min(total_overlap / 7200.0, 1.0)


def _timezone_penalty(match_utc: datetime, tz_name: str) -> float:
    """Penalty for antisocial local kickoff hours. 0 = ideal, 1 = worst."""
    try:
        tz = ZoneInfo(tz_name)
    except (ZoneInfoNotFoundError, KeyError):
        tz = ZoneInfo("UTC")

    local_hour = match_utc.astimezone(tz).hour
    # Ideal window: 14–22. Penalty rises for hours outside it.
    if 14 <= local_hour <= 22:
        return 0.0
    elif local_hour < 6 or local_hour > 23:
        return 1.0
    elif local_hour < 14:
        return (14 - local_hour) / 14.0
    else:
        return (local_hour - 22) / 2.0


def _expected_competitiveness(rank_a: int, rank_b: int) -> float:
    """1.0 when ranks are equal, 0.0 when gap is maximum."""
    gap = abs(rank_a - rank_b)
    return max(0.0, 1.0 - gap / _MAX_FIFA_RANK)


# available_slots is passed explicitly (parsed from ICS upstream in the service layer)
# instead of being read from profile, which no longer carries that field.
def compute(profile: UserProfile, match: MatchData, available_slots: list[TimeSlot]) -> np.ndarray:
    fav_teams = _normalize_names(profile.favorite_teams)
    fav_players = _normalize_names(profile.favorite_players)

    team_a_name = match.team_a.name.lower()
    team_b_name = match.team_b.name.lower()
    team_a_players = _normalize_names(match.team_a.key_players)
    team_b_players = _normalize_names(match.team_b.key_players)
    team_a_rivals = _normalize_names(match.team_a.rival_team_names)
    team_b_rivals = _normalize_names(match.team_b.rival_team_names)

    # 0 — team_affinity
    team_affinity = 1.0 if (team_a_name in fav_teams or team_b_name in fav_teams) else 0.0

    # 1 — rival_affinity (0.5 if one rival, 1.0 if both teams are rivals of each other)
    a_is_rival = any(t in team_a_rivals for t in fav_teams)
    b_is_rival = any(t in team_b_rivals for t in fav_teams)
    rival_affinity = min(float(a_is_rival) + float(b_is_rival), 1.0) * 0.6

    # 2 — star_player_playing
    all_players = team_a_players | team_b_players
    star_player_playing = 1.0 if fav_players & all_players else 0.0

    # 3 — availability_score
    avail = _availability_score(match.utc_datetime, available_slots, profile.timezone)

    # 4 — timezone_penalty
    tz_penalty = _timezone_penalty(match.utc_datetime, profile.timezone)

    # 5 — rivalry_index (normalized)
    rivalry = match.rivalry_index / 10.0

    # 6 — star_power (average of both teams, normalized 0–1)
    star_power = (match.team_a.star_power + match.team_b.star_power) / 20.0

    # 7 — group_stakes
    stakes = _GROUP_STAKES.get(match.round_in_group, 0.5)

    # 8 — expected_competitiveness
    competitiveness = _expected_competitiveness(
        match.team_a.fifa_ranking, match.team_b.fifa_ranking
    )

    # 9 — narrative_score (normalized)
    narrative = match.narrative_score / 10.0

    # 10 — regional_affinity
    user_conf = _user_confederation(profile.country)
    team_a_conf = match.team_a.confederation
    team_b_conf = match.team_b.confederation
    regional_affinity = 1.0 if user_conf and user_conf in (team_a_conf, team_b_conf) else 0.0

    return np.array(
        [
            team_affinity,
            rival_affinity,
            star_player_playing,
            avail,
            tz_penalty,
            rivalry,
            star_power,
            stakes,
            competitiveness,
            narrative,
            regional_affinity,
        ],
        dtype=np.float64,
    )


def compute_batch(
    profile: UserProfile, matches: list[MatchData], available_slots: list[TimeSlot]
) -> np.ndarray:
    """Return shape (n_matches, 11) feature matrix."""
    return np.vstack([compute(profile, m, available_slots) for m in matches])
