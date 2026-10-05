from socket import socket

from flask import Blueprint, request
from flask_login import login_required, current_user
from marshmallow import ValidationError
from db import db
from extensions import socketio
from models import Channel, Message
from schemas.channel_schema import channel_schema
from schemas.messages_schema import messages_schema, message_schema
from utils.auth_helpers import get_membership_or_none

blp = Blueprint("channels", __name__)


@blp.route("/<int:channel_id>", methods=["GET"])
@login_required
def get_channel_by_id(channel_id):
    channel = Channel.query.filter_by(id=channel_id).first()

    if not channel:
        return {"error": "Channel not found."}, 404

    membership = get_membership_or_none(channel.organisation_id)

    if membership is None:
        return {"error": "Channel not found or you do not have access."}, 404

    return {"channel": channel_schema.dump(channel)}, 200


@blp.route("/<int:channel_id>", methods=["PUT"])
@login_required
def update_channel_by_id(channel_id):
    channel = Channel.query.filter_by(id=channel_id).first()

    if not channel:
        return {"error": "Channel not found."}, 404

    membership = get_membership_or_none(channel.organisation_id)

    if membership is None:
        return {"error": "Channel not found or you do not have access."}, 404

    if not membership.admin:
        return {"error": "You do not have permission to edit this channel."}, 403

    try:
        valid_data = channel_schema.load(request.get_json())
    except ValidationError as err:
        return {"errors": err.messages}, 400

    duplicate = Channel.query.filter_by(
        name=valid_data["name"],
        organisation_id=channel.organisation_id,
    ).first()

    if duplicate and duplicate.id != channel.id:
        return {
            "error": "A channel with this name already exists in this organisation."
        }, 409

    channel.name = valid_data["name"]

    db.session.commit()

    return {
        "message": "Channel name has been updated successfully",
        "channel": channel_schema.dump(channel),
    }, 200


@blp.route("/<int:channel_id>", methods=["DELETE"])
@login_required
def delete_channel_by_id(channel_id):
    channel = Channel.query.filter_by(id=channel_id).first()

    if not channel:
        return {"error": "Channel not found."}, 404

    membership = get_membership_or_none(channel.organisation_id)

    if membership is None:
        return {"error": "Channel not found or you do not have access."}, 404

    if not membership.admin:
        return {"error": "You do not have permission to delete this channel."}, 403

    db.session.delete(channel)
    db.session.commit()

    return {
        "message": "Channel has been successfully deleted.",
    }, 200


@blp.route("/<int:channel_id>/messages", methods=["GET"])
@login_required
def get_channel_messages(channel_id):
    channel = Channel.query.filter_by(id=channel_id).first()
    if not channel:
        return {"error": "Channel not found."}, 404

    membership = get_membership_or_none(channel.organisation_id)

    if membership is None:
        return {"error": "Channel not found or you do not have access."}, 404

    messages = channel.messages

    return {"messages": messages_schema.dump(messages)}, 200


@blp.route("/<int:channel_id>/messages", methods=["POST"])
@login_required
def create_channel_message(channel_id):
    channel = Channel.query.filter_by(id=channel_id).first()
    if not channel:
        return {"error": "Channel not found."}, 404
    membership = get_membership_or_none(channel.organisation_id)

    if membership is None:
        return {"error": "Channel not found or you do not have access."}, 404

    try:
        valid_data = message_schema.load(request.get_json())
    except ValidationError as err:
        return {"errors": err.messages}, 400

    message = Message(
        user_id=current_user.id, channel_id=channel.id, body=valid_data["body"]
    )

    db.session.add(message)
    db.session.commit()

    socketio.emit(
        "message_created",
        {"message": message_schema.dump(message)},
        to=f"channel:{channel_id}",
    )

    print(f"EMITTED message_created to channel:{channel_id}")

    return {
        "message": "Message sent successfully.",
        "message_data": message_schema.dump(message),
    }, 201
