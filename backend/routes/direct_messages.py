from flask import Blueprint
from flask_login import login_required, current_user
from models import (
    Organisation,
    DirectConversation,
    DirectConversationMember,
    direct_conversation_members,
    OrganisationMember,
)
from schemas.direct_conversation_schema import (
    DirectConversationSchema,
    direct_conversations_schema,
)
from utils.auth_helpers import get_membership_or_none
from db import db

blp = Blueprint("direct_conversations", __name__)


@blp.route("/organisations/<int:organisation_id>/direct-conversations", methods=["GET"])
@login_required
def get_direct_conversations(organisation_id):
    organisation = Organisation.query.filter_by(id=organisation_id).first()

    if organisation is None:
        return {"error": "Organisation not found."}, 404

    membership = get_membership_or_none(organisation_id)

    if membership is None:
        return {"error": "You are not a member of this organisation."}, 403

    conversations = (
        DirectConversation.query.join(DirectConversationMember)
        .filter(
            DirectConversation.organisation_id == organisation_id,
            DirectConversationMember.user_id == current_user.id,
        )
        .all()
    )

    return {"conversations": direct_conversations_schema.dump(conversations)}, 200


@blp.route(
    "/organisations/<int:organisation_id>/direct-conversations/<int:organisation_member_id>",
    methods=["POST"],
)
@login_required
def create_direct_conversation(organisation_id, recipient_user_id):
    organisation = db.session.get(Organisation, organisation_id)

    if organisation is None:
        return {"error": "Organisation not found."}, 404

    membership = get_membership_or_none(organisation_id)

    if membership is None:
        return {"error": "You are not a member of this organisation."}, 403

    if recipient_user_id == current_user.id:
        return {"error": "You cannot start a conversation with yourself."}, 400

    recipient_membership = OrganisationMember.query.filter_by(
        user_id=recipient_user_id,
        organisation_id=organisation_id,
    ).first()

    if recipient_membership is None:
        return {"error": "The recipient is not a member of this organisation."}, 404

    existing_conversation = (
        DirectConversation.query.join(DirectConversationMember)
        .filter(
            DirectConversation.organisation_id == organisation_id,
            DirectConversationMember.user_id.in_([current_user.id, recipient_user_id]),
        )
        .group_by(DirectConversation.id)
        .having(db.func.count(db.distinct(DirectConversationMember.user_id)) == 2)
        .first()
    )

    if existing_conversation is not None:
        return {
            "id": existing_conversation.id,
            "created": False,
        }, 200

    direct_conversation = DirectConversation(
        organisation_id=organisation_id,
    )

    direct_conversation.members = [
        DirectConversationMember(user_id=current_user.id),
        DirectConversationMember(user_id=recipient_user_id),
    ]

    db.session.add(direct_conversation)
    db.session.commit()

    return {
        "id": direct_conversation.id,
        "created": True,
    }, 201
