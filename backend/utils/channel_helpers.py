from models import Channel, OrganisationMember
from flask_login import current_user


def get_channel_membership_or_none(channel_id):
    channel_id = int(channel_id)

    channel = Channel.query.get(channel_id)

    if channel is None:
        return None

    return OrganisationMember.query.filter_by(
        user_id=current_user.id, organisation_id=channel.organisation_id
    ).first()
