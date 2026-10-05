from marshmallow import Schema, fields
from schemas.user_schema import UserSchema


class MessageSchema(Schema):
    id = fields.Int(dump_only=True)

    body = fields.Str(required=True)

    user_id = fields.Int(dump_only=True)
    channel_id = fields.Int(dump_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    user = fields.Nested(UserSchema, dump_only=True)


message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)
