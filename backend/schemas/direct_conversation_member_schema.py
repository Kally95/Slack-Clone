from marshmallow import fields
from extensions import ma


class DirectConversationMemberSchema(ma.Schema):
    direct_conversation_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

    user = fields.Nested("UserSchema")


direct_conversation_member_schema = DirectConversationMemberSchema()
direct_conversation_members_schema = DirectConversationMemberSchema(many=True)
