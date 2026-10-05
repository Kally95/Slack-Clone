from flask import Blueprint, request
from flask_login import login_required
from marshmallow import ValidationError
from sqlalchemy.sql.functions import current_user

from db import db
from models import Message
from schemas.messages_schema import message_schema
from utils.auth_helpers import get_membership_or_none

blp = Blueprint("messages", __name__)


@blp.route("/<int:message_id>", methods=["PUT"])
@login_required
def edit_message(message_id):
    message = Message.query.filter_by(id=message_id).first()

    if not message:
        return {"error": "Message not found."}, 404

    membership = get_membership_or_none(message.channel.organisation_id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if current_user.id != message.user_id:
        return {"error": "You do not have permission to update this message."}, 403

    try:
        valid_data = message_schema.load(request.get_json())
    except ValidationError as err:
        return {"errors": err.messages}, 400

    message.body = valid_data["body"]

    db.session.commit()

    return {
        "message": "Message successfully updated.",
        "message_data": message_schema.dump(message),
    }, 200


@blp.route("/<int:message_id>", methods=["DELETE"])
@login_required
def delete_message(message_id):
    message = Message.query.filter_by(id=message_id).first()

    if not message:
        return {"error": "Message not found."}, 404

    membership = get_membership_or_none(message.channel.organisation_id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if current_user.id != message.user_id and not membership.admin:
        return {"error": "You do not have permission to delete this message."}, 403

    db.session.delete(message)
    db.session.commit()

    return {
        "message": "Message successfully deleted.",
    }, 200
