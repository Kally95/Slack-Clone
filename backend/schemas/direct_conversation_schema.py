from marshmallow import fields
from extensions import ma


class DirectConversationSchema(ma.Schema):

    id = fields.Int(dump_only=True)
    organisation_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    members = fields.Nested("DirectConversationMemberSchema", many=True)


direct_conversation_schema = DirectConversationSchema()
direct_conversations_schema = DirectConversationSchema(many=True)
