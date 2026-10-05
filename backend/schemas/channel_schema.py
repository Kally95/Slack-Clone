from extensions import ma
from marshmallow import fields


class ChannelSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    organisation_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


channel_schema = ChannelSchema()
channels_schema = ChannelSchema(many=True)
