from datetime import datetime, timezone
from sqlalchemy import ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db import db


class Message(db.Model):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    channel_id: Mapped[int | None] = mapped_column(
        ForeignKey("channels.id"),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="messages",
    )

    direct_conversation_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "direct_conversations.id",
            name="fk_messages_direct_conversation_id_direct_conversations",
        ),
        nullable=True,
    )

    body: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    parent_message_id: Mapped[int | None] = mapped_column(
        ForeignKey("messages.id"),
        nullable=True,
    )

    channel = relationship(
        "Channel",
        back_populates="messages",
    )

    direct_conversation = relationship(
        "DirectConversation",
        back_populates="messages",
    )
