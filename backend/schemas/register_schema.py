from extensions import ma
from marshmallow import fields, validate


class UserSchema(ma.Schema):
    username = fields.Str(
        required=True,
        error_messages={"required": "Username is required."},
    )

    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required."},
    )

    password = fields.Str(
        required=True,
        error_messages={"required": "Password is required."},
        validate=validate.Length(
            min=8, error="Password must be a minimum of 8 characters."
        ),
        load_only=True,
    )


register_schema = UserSchema()
