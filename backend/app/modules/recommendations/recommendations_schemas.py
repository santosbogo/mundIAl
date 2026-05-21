from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    class TimeSlot(BaseModel):
        day_of_week: str = Field(..., examples=["saturday"])
        start_hour: int = Field(..., ge=0, le=23)
        end_hour: int = Field(..., ge=1, le=24)

    favorite_teams: list[str] = Field(default_factory=list)
    favorite_players: list[str] = Field(default_factory=list)
    available_slots: list[TimeSlot] = Field(default_factory=list)
    timezone: str = Field(default="UTC", examples=["America/Argentina/Buenos_Aires"])
    country: str = Field(default="", examples=["AR"], description="ISO 3166-1 alpha-2")


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
