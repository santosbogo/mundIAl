from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog import catalog_repository
from app.modules.catalog.catalog_shared import (
    catalog_teams_from_db,
    country_options,
    load_seed_teams,
    timezone_options,
)
from app.modules.setup.setup_schemas import Step1OptionsResponse, Step4OptionsResponse


async def get_step1_options(db: AsyncSession) -> Step1OptionsResponse:
    db_teams = await catalog_repository.get_all_teams(db)
    teams = catalog_teams_from_db(db_teams) if db_teams else load_seed_teams()
    return Step1OptionsResponse(teams=teams)


async def get_step4_options() -> Step4OptionsResponse:
    return Step4OptionsResponse(countries=country_options(), timezones=timezone_options())
