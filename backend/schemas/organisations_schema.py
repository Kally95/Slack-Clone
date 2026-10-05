from marshmallow import fields, validate

from extensions import ma


class OrganisationSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(validate=validate.Length(max=100), required=True)
    description = fields.Str(allow_none=True)
    image_url = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


organisation_schema = OrganisationSchema()
organisations_schema = OrganisationSchema(many=True)
