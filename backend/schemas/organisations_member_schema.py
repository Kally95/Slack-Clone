from marshmallow import fields
from extensions import ma


class UserBasicSchema(ma.Schema):
    id = fields.Int()
    username = fields.Str()
    email = fields.Email()


class OrganisationMemberSchema(ma.Schema):
    user_id = fields.Int()
    organisation_id = fields.Int()
    admin = fields.Bool()

    user = fields.Nested(UserBasicSchema)


organisation_member_schema = OrganisationMemberSchema()
