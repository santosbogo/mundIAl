from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.recommendations import recommendations_service
from app.modules.recommendations.recommendations_schemas import (
    GetRecommendationsInput,
    RecommendationResponse,
    UserProfile,
)

router = APIRouter(prefix="/api/v1", tags=["recommendations"])


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend(
    profile: UserProfile,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RecommendationResponse:
    output = await recommendations_service.get_recommendations(
        GetRecommendationsInput(profile=profile),
        db=db,
    )
    return output.response
