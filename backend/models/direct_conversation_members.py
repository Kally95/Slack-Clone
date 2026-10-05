from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import mapped_column, Mapped, relationship

from db import db


class DirectConversationMember(db.Model):
    __tablename__ = "direct_conversation_members"

    direct_conversation_id: Mapped[int] = mapped_column(
        ForeignKey(
            "direct_conversations.id",
            name="fk_direct_conversation_members_direct_conversation_id",
        ),
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            name="fk_direct_conversation_members_user_id",
        ),
        primary_key=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    conversation = relationship(
        "DirectConversation",
        back_populates="members",
    )

    user = relationship("User")
