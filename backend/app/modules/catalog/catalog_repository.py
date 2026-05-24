from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.team import Team


async def get_all_teams(db: AsyncSession) -> list[Team]:
    result = await db.execute(
        select(Team).order_by(Team.confederation, Team.fifa_ranking, Team.name)
    )
    return list(result.scalars().all())
