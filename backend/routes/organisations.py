from flask import Blueprint, request
from flask_login import login_required, current_user
from marshmallow import ValidationError
from db import db
from models import Organisation, OrganisationMember, User, Channel
from schemas.channel_schema import channel_schema
from schemas.organisations_member_schema import organisation_member_schema
from schemas.organisations_schema import organisation_schema
from utils.auth_helpers import get_membership_or_none

blp = Blueprint("organisations", __name__)


@blp.route("/", methods=["GET"])
@login_required
def get_organisations():
    memberships = current_user.organisation_memberships

    organisations = [member.organisation for member in memberships]

    return {"organisations": organisation_schema.dump(organisations, many=True)}, 200


@blp.route("/", methods=["POST"])
@login_required
def create_organisation():
    try:
        valid_data = organisation_schema.load(request.get_json())
    except ValidationError as err:
        return {"errors": err.messages}, 400

    organisation = Organisation(
        name=valid_data["name"],
        description=valid_data.get("description"),
        image_url=valid_data.get("image_url"),
    )

    db.session.add(organisation)
    db.session.flush()

    member = OrganisationMember(
        user_id=current_user.id,
        organisation_id=organisation.id,
        admin=True,
    )

    db.session.add(member)
    db.session.commit()

    return {
        "message": "Organisation created successfully.",
        "organisation": organisation_schema.dump(organisation),
    }, 201


@blp.route("/<int:id>", methods=["GET"])
@login_required
def get_organisation(id):
    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    organisation = membership.organisation

    return {
        "organisation": organisation_schema.dump(organisation),
        "current_user_membership": {
            "user_id": membership.user_id,
            "organisation_id": membership.organisation_id,
            "admin": membership.admin,
        },
    }, 200


@blp.route("/<int:id>", methods=["PATCH"])
@login_required
def edit_organisation(id):
    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if not membership.admin:
        return {"error": "You do not have permission to edit this organisation."}, 403

    try:
        valid_data = organisation_schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return {"errors": err.messages}, 400

    if "name" in valid_data:
        existing_organisation = Organisation.query.filter_by(
            name=valid_data["name"]
        ).first()

        if (
            existing_organisation
            and existing_organisation.id != membership.organisation.id
        ):
            return {"error": "Organisation already exists."}, 409

        membership.organisation.name = valid_data["name"]

    if "description" in valid_data:
        membership.organisation.description = valid_data["description"]

    if "image_url" in valid_data:
        membership.organisation.image_url = valid_data["image_url"]

    db.session.commit()

    return {
        "message": "Organisation has successfully been updated.",
        "organisation": organisation_schema.dump(membership.organisation),
    }, 200


@blp.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_organisation(id):
    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if not membership.admin:
        return {"error": "You do not have permission to delete this organisation."}, 403

    db.session.delete(membership.organisation)
    db.session.commit()

    return {"message": "Organisation has successfully been deleted."}, 200


############################ MEMBER ACTIONS ############################


@blp.route("/<int:id>/members", methods=["POST"])
@login_required
def add_member(id):
    data = request.get_json()

    if not data or "email" not in data:
        return {"error": "Email is required."}, 400

    email = data["email"].strip().lower()
    user = User.query.filter_by(email=email).first()

    if not user:
        return {"error": "A user with this email does not exist."}, 404

    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if not membership.admin:
        return {
            "error": "You do not have permission to add users to this organisation."
        }, 403

    existing_member = OrganisationMember.query.filter_by(
        user_id=user.id,
        organisation_id=membership.organisation.id,
    ).first()

    if existing_member:
        return {"error": "User is already a member of this organisation."}, 409

    new_member = OrganisationMember(
        user_id=user.id,
        organisation_id=membership.organisation.id,
        admin=False,
    )

    db.session.add(new_member)
    db.session.commit()

    return {
        "message": "User added successfully",
        "member": organisation_member_schema.dump(new_member),
    }, 201


@blp.route("/<int:id>/members", methods=["GET"])
@login_required
def get_members(id):
    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    members = membership.organisation.memberships

    return {"members": organisation_member_schema.dump(members, many=True)}, 200


@blp.route("/<int:id>/members/<int:user_id>", methods=["DELETE"])
@login_required
def delete_member(id, user_id):
    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if user_id == current_user.id:
        return {"error": "You cannot remove yourself from the organisation."}, 400

    if not membership.admin:
        return {"error": "You do not have permission to delete this member."}, 403

    member = OrganisationMember.query.filter_by(
        user_id=user_id, organisation_id=id
    ).first()

    if not member:
        return {"error": "User not found in organisation."}, 404

    db.session.delete(member)
    db.session.commit()

    return {"message": "User removed successfully."}, 200


@blp.route("/<int:id>/members/<int:user_id>", methods=["PATCH"])
@login_required
def update_member_role(id, user_id):
    data = request.get_json()
    if not data or "admin" not in data:
        return {"error": "Admin property in request body missing."}, 400

    if type(data["admin"]) != bool:
        return {"error": "Admin value in request body must be a boolean."}, 400

    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if not membership.admin:
        return {"error": "You do not have permission to update this member."}, 403

    member = OrganisationMember.query.filter_by(
        user_id=user_id, organisation_id=id
    ).first()

    if not member:
        return {"error": "User not found in organisation."}, 404

    member.admin = data["admin"]

    db.session.commit()

    return {
        "message": "Member role updated successfully.",
        "member": organisation_member_schema.dump(member),
    }, 200


@blp.route("/<int:organisation_id>/members", methods=["GET"])
@login_required
def get_organisation_members(organisation_id):
    membership = get_membership_or_none(organisation_id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    organisation_members = OrganisationMember.query.filter_by(
        organisation_id=organisation_id
    ).all()

    print(organisation_members)


############################ CHANNEL ACTIONS ############################


@blp.route("/<int:id>/channels", methods=["GET"])
@login_required
def get_channels(id):
    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    channels = membership.organisation.channels

    return {"channels": channel_schema.dump(channels, many=True)}, 200


@blp.route("/<int:id>/channels", methods=["POST"])
@login_required
def create_channel(id):
    try:
        valid_data = channel_schema.load(request.get_json())
    except ValidationError as err:
        return {"errors": err.messages}, 400

    membership = get_membership_or_none(id)

    if membership is None:
        return {"error": "Organisation not found or you do not have access."}, 404

    if not membership.admin:
        return {"error": "You do not have permission to update this member."}, 403

    existing_channel = Channel.query.filter_by(
        name=valid_data["name"],
        organisation_id=id,
    ).first()

    if existing_channel:
        return {
            "error": "A channel with this name already exists in this organisation."
        }, 409

    channel = Channel(name=valid_data["name"], organisation_id=id)

    db.session.add(channel)
    db.session.commit()

    return {
        "message": "Channel created successfully",
        "channel": channel_schema.dump(channel),
    }, 201


############################ DIRECT MESSAGES ############################
