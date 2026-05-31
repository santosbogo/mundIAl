from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy.ext.asyncio import AsyncSession

from app.ml import classifier, explainer, feature_engineering, ics_parser
from app.modules.recommendations import recommendations_repository
from app.modules.recommendations.recommendations_schemas import (
    GetRecommendationsInput,
    GetRecommendationsOutput,
    MatchRecommendation,
    RecommendationResponse,
    ScoreBreakdown,
)


def _local_datetime(utc_dt: datetime, tz_name: str) -> datetime | None:
    try:
        tz = ZoneInfo(tz_name)
        return utc_dt.astimezone(tz)
    except (ZoneInfoNotFoundError, KeyError):
        return None


async def get_recommendations(
    input_data: GetRecommendationsInput,
    db: AsyncSession,
) -> GetRecommendationsOutput:
    profile = input_data.profile
    matches = await recommendations_repository.get_all_matches(db)

    # Parse the ICS once and pass the Calendar object to the ML pipeline.
    # _availability_score queries it per-match using recurring_ical_events,
    # so a one-off event only affects that specific match datetime.
    cal = ics_parser.parse_calendar(profile.ics_content)

    feature_matrix = feature_engineering.compute_batch(profile, matches, cal)
    categories, scores, features = classifier.predict(feature_matrix)

    result: dict[str, list[MatchRecommendation]] = {
        "imperdible": [],
        "vale_la_pena": [],
        "para_el_resumen": [],
    }

    for match, category, score, feat_row in zip(  # noqa: B905
        matches, categories, scores, features
    ):
        explanation = explainer.explain(profile, match, category, feat_row)
        local_dt = _local_datetime(match.utc_datetime, profile.timezone)

        breakdown = ScoreBreakdown(
            team_affinity=round(feat_row[0], 3),
            rival_affinity=round(feat_row[1], 3),
            star_player_playing=round(feat_row[2], 3),
            availability_score=round(feat_row[3], 3),
            timezone_penalty=round(feat_row[4], 3),
            rivalry_index=round(feat_row[5], 3),
            star_power=round(feat_row[6], 3),
            group_stakes=round(feat_row[7], 3),
            expected_competitiveness=round(feat_row[8], 3),
            narrative_score=round(feat_row[9], 3),
            regional_affinity=round(feat_row[10], 3),
        )

        rec = MatchRecommendation(
            match_id=match.match_id,
            group=match.group,
            team_a=match.team_a.name,
            team_b=match.team_b.name,
            utc_datetime=match.utc_datetime,
            local_datetime=local_dt,
            venue=match.venue,
            city=match.city,
            score=round(float(score), 4),
            category=category,
            explanation=explanation,
            score_breakdown=breakdown,
        )
        result[category].append(rec)

    # Sort each bucket by score descending
    for bucket in result.values():
        bucket.sort(key=lambda r: r.score, reverse=True)

    return GetRecommendationsOutput(
        response=RecommendationResponse(
            imperdible=result["imperdible"],
            vale_la_pena=result["vale_la_pena"],
            para_el_resumen=result["para_el_resumen"],
        )
    )
