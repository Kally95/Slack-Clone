from flask_login import current_user


def get_membership_or_none(org_id):
    for membership in current_user.organisation_memberships:
        if membership.organisation.id == org_id:
            return membership
    return None
