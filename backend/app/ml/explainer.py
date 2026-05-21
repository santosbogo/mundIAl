"""
Generates a short explanation string for each recommendation
based on the top-scoring feature dimensions.
"""

from __future__ import annotations

import numpy as np

from app.ml.feature_engineering import FEATURE_NAMES
from app.modules.recommendations.recommendations_schemas import MatchData, UserProfile

_FEATURE_TEMPLATES: dict[str, str] = {
    "team_affinity": "one of your favorite teams is playing",
    "rival_affinity": "a rival of your favorite team is playing",
    "star_player_playing": "one of your favorite players is in this match",
    "availability_score": "this match fits your schedule perfectly",
    "rivalry_index": "this is a high-intensity historical rivalry",
    "star_power": "both squads are packed with world-class talent",
    "group_stakes": "the group qualification stakes are very high",
    "expected_competitiveness": "these teams are very evenly matched",
    "narrative_score": "this match has major tournament narrative significance",
    "regional_affinity": "a team from your region is competing",
}

_PENALTY_TEMPLATES: dict[str, str] = {
    "timezone_penalty": "the kickoff time is inconvenient for your timezone",
    "availability_score": "this match falls outside your available hours",
}

_CATEGORY_INTROS: dict[str, str] = {
    "imperdible": "Must-watch",
    "vale_la_pena": "Worth watching",
    "para_el_resumen": "Catch the highlights",
}


def explain(
    profile: UserProfile,
    match: MatchData,
    category: str,
    features: np.ndarray,
) -> str:
    intro = _CATEGORY_INTROS.get(category, "Match")

    # Identify top positive driver
    positive_indices = [i for i, n in enumerate(FEATURE_NAMES) if n != "timezone_penalty"]
    top_idx = max(positive_indices, key=lambda i: features[i])
    top_feature = FEATURE_NAMES[top_idx]
    reason = _FEATURE_TEMPLATES.get(top_feature, "this is an interesting match")

    # Identify main obstacle (if any)
    has_penalty = features[4] > 0.5  # timezone_penalty index
    no_availability = features[3] < 0.3  # availability_score index
    obstacle = ""
    if category in ("vale_la_pena", "para_el_resumen"):
        if has_penalty:
            obstacle = ", though the kickoff is at an awkward hour for you"
        elif no_availability:
            obstacle = ", though it falls outside your available time slots"

    return f"{intro}: {reason}{obstacle}."
