from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from db import db
from datetime import datetime, timezone


class Organisation(db.Model):

    __tablename__ = "organisations"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    memberships = relationship(
        "OrganisationMember",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )

    channels = relationship(
        "Channel",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"organisation_id = {self.id}, organisation_name = {self.name}, organisation_description = {self.description}, created_at = {self.created_at}"
