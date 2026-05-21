import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Match(Base, TimestampMixin):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    group: Mapped[str] = mapped_column(String(2), nullable=False, index=True)
    team_a_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    team_b_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    round_in_group: Mapped[int] = mapped_column(Integer, nullable=False)
    utc_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    venue: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    venue_country: Mapped[str] = mapped_column(String(50), nullable=False)
    narrative_score: Mapped[float] = mapped_column(Float, nullable=False, default=5.0)
    rivalry_index: Mapped[float] = mapped_column(Float, nullable=False, default=3.0)

    team_a: Mapped["Team"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Team", foreign_keys=[team_a_id], back_populates="home_matches"
    )
    team_b: Mapped["Team"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Team", foreign_keys=[team_b_id], back_populates="away_matches"
    )
