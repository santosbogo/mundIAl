"""
Seed script: populate teams and matches tables from JSON files.

Usage:
    cd backend && uv run python -m app.seed.seed
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.models.match import Match
from app.db.models.team import Team

SEED_DIR = Path(__file__).parent


async def seed_teams(session: AsyncSession) -> dict[str, Team]:
    raw = json.loads((SEED_DIR / "teams.json").read_text())
    team_map: dict[str, Team] = {}

    for item in raw:
        result = await session.execute(select(Team).where(Team.name == item["name"]))
        existing = result.scalar_one_or_none()
        if existing:
            team_map[item["name"]] = existing
            continue

        team = Team(
            name=item["name"],
            fifa_ranking=item["fifa_ranking"],
            confederation=item["confederation"],
            rival_team_names=item["rivals"],
            key_players=item["key_players"],
            star_power=item["star_power"],
            narrative_flags=item["narrative_flags"],
        )
        session.add(team)
        team_map[item["name"]] = team

    await session.flush()
    return team_map


async def seed_matches(session: AsyncSession, team_map: dict[str, Team]) -> None:
    raw = json.loads((SEED_DIR / "matches.json").read_text())

    for item in raw:
        result = await session.execute(select(Match).where(Match.match_id == item["match_id"]))
        if result.scalar_one_or_none():
            continue

        team_a = team_map[item["team_a"]]
        team_b = team_map[item["team_b"]]
        utc_dt = datetime.fromisoformat(item["utc_datetime"].replace("Z", "+00:00"))

        match = Match(
            match_id=item["match_id"],
            group=item["group"],
            team_a_id=team_a.id,
            team_b_id=team_b.id,
            round_in_group=item["round_in_group"],
            utc_datetime=utc_dt,
            venue=item["venue"],
            city=item["city"],
            venue_country=item["venue_country"],
            narrative_score=item["narrative_score"],
            rivalry_index=item["rivalry_index"],
        )
        session.add(match)


async def main() -> None:
    engine = create_async_engine(settings.database_url)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async with factory() as session, session.begin():
        print("Seeding teams...")
        team_map = await seed_teams(session)
        print(f"  {len(team_map)} teams ready")

        print("Seeding matches...")
        await seed_matches(session, team_map)
        print("  72 matches ready")

    await engine.dispose()
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(main())
