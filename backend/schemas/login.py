from marshmallow import fields

from extensions import ma


class LoginSchema(ma.Schema):

    email = fields.Str(
        required=True,
        error_messages={"required": "Email is required."},
    )

    password = fields.Str(
        required=True,
        load_only=True,
        error_messages={"required": "Password is required."},
    )


login_schema = LoginSchema()
