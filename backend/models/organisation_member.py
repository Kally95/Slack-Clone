from sqlalchemy import String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import mapped_column, Mapped, relationship
from db import db
from datetime import datetime, timezone


class OrganisationMember(db.Model):

    __tablename__ = "organisation_members"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True,
    )

    organisation_id: Mapped[int] = mapped_column(
        ForeignKey("organisations.id"),
        primary_key=True,
    )

    admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    organisation = relationship(
        "Organisation",
        back_populates="memberships",
    )

    user = relationship(
        "User",
        back_populates="organisation_memberships",
    )
