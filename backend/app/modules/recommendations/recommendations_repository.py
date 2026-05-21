from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.match import Match
from app.modules.recommendations.recommendations_schemas import MatchData


async def get_all_matches(db: AsyncSession) -> list[MatchData]:
    result = await db.execute(
        select(Match).options(selectinload(Match.team_a), selectinload(Match.team_b))
    )
    matches = list(result.scalars().all())

    return [
        MatchData(
            match_id=m.match_id,
            group=m.group,
            team_a=MatchData.TeamInfo(
                name=m.team_a.name,
                fifa_ranking=m.team_a.fifa_ranking,
                confederation=m.team_a.confederation,
                rival_team_names=m.team_a.rival_team_names,
                key_players=m.team_a.key_players,
                star_power=m.team_a.star_power,
            ),
            team_b=MatchData.TeamInfo(
                name=m.team_b.name,
                fifa_ranking=m.team_b.fifa_ranking,
                confederation=m.team_b.confederation,
                rival_team_names=m.team_b.rival_team_names,
                key_players=m.team_b.key_players,
                star_power=m.team_b.star_power,
            ),
            round_in_group=m.round_in_group,
            utc_datetime=m.utc_datetime,
            venue=m.venue,
            city=m.city,
            venue_country=m.venue_country,
            narrative_score=m.narrative_score,
            rivalry_index=m.rivalry_index,
        )
        for m in matches
    ]
