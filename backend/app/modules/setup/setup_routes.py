from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.setup import setup_service
from app.modules.setup.setup_schemas import Step1OptionsResponse, Step4OptionsResponse

router = APIRouter(prefix="/api/v1/setup", tags=["setup"])


@router.get("/step-1-options", response_model=Step1OptionsResponse)
async def get_step1_options(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Step1OptionsResponse:
    return await setup_service.get_step1_options(db)


@router.get("/step-4-options", response_model=Step4OptionsResponse)
async def get_step4_options() -> Step4OptionsResponse:
    return await setup_service.get_step4_options()
