from __future__ import annotations

import base64
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class UserProfile(BaseModel):
    favorite_teams: list[str] = Field(default_factory=list)
    favorite_players: list[str] = Field(default_factory=list)
    # ICS file (base64-encoded) — the backend parses busy events directly
    # from the calendar to compute per-match availability.
    ics_content: str = Field(..., description="Base64-encoded .ics calendar file")
    timezone: str = Field(default="UTC", examples=["America/Argentina/Buenos_Aires"])
    country: str = Field(default="", examples=["AR"], description="ISO 3166-1 alpha-2")

    @field_validator("ics_content")
    @classmethod
    def validate_base64(cls, v: str) -> str:
        try:
            base64.b64decode(v, validate=True)
        except Exception as exc:
            raise ValueError("ics_content must be valid base64") from exc
        return v


class MatchData(BaseModel):
    """Internal DTO carrying match + team data for the ML pipeline."""

    class TeamInfo(BaseModel):
        name: str
        fifa_ranking: int
        confederation: str
        rival_team_names: list[str]
        key_players: list[str]
        star_power: float

    match_id: str
    group: str
    team_a: TeamInfo
    team_b: TeamInfo
    round_in_group: int
    utc_datetime: datetime
    venue: str
    city: str
    venue_country: str
    narrative_score: float
    rivalry_index: float


class ScoreBreakdown(BaseModel):
    team_affinity: float
    rival_affinity: float
    star_player_playing: float
    availability_score: float
    timezone_penalty: float
    rivalry_index: float
    star_power: float
    group_stakes: float
    expected_competitiveness: float
    narrative_score: float
    regional_affinity: float


class MatchRecommendation(BaseModel):
    match_id: str
    group: str
    team_a: str
    team_b: str
    utc_datetime: datetime
    local_datetime: datetime | None
    venue: str
    city: str
    score: float
    category: str
    explanation: str
    score_breakdown: ScoreBreakdown


class RecommendationResponse(BaseModel):
    imperdible: list[MatchRecommendation]
    vale_la_pena: list[MatchRecommendation]
    para_el_resumen: list[MatchRecommendation]


class GetRecommendationsInput(BaseModel):
    profile: UserProfile


class GetRecommendationsOutput(BaseModel):
    response: RecommendationResponse
