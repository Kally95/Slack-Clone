from flask import Blueprint, request, session
from flask_login import current_user, login_user, logout_user, login_required
from marshmallow import ValidationError
from db import db
from models import User
from schemas.user_schema import user_schema
from schemas.login import login_schema
from schemas.register_schema import register_schema

blp = Blueprint("auth", __name__)


@blp.route("/register", methods=["POST"])
def register():

    if current_user.is_authenticated:
        return {"error": "User is already authenticated."}, 409

    try:
        data = register_schema.load(request.get_json())
    except ValidationError as err:
        return {"errors": err.messages}, 400

    username = data["username"]
    email = data["email"]

    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()

    if existing_user:
        return {"error": "Username or email already exists."}, 409

    user = User(username=username, email=email)
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    login_user(user)

    return {
        "message": "User created successfully",
        "user": user_schema.dump(user),
    }, 201


@blp.route("/login", methods=["POST"])
def login():

    if current_user.is_authenticated:
        return {"error": "User is already authenticated."}, 409

    try:
        data = login_schema.load(request.get_json())
    except ValidationError as err:
        return {"errors": err.messages}, 400

    user = User.query.filter(User.email == data["email"]).first()

    if user is None or not user.check_password(data["password"]):
        return {"error": "Invalid username or password"}, 401

    login_user(user)

    return {
        "message": "Successfully logged in.",
        "user": user_schema.dump(user),
    }, 200


@blp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    session.clear()
    return {"message": "Successfully logged out."}, 200


@blp.route("/me", methods=["GET"])
def me():
    if not current_user.is_authenticated:
        return {"user": None}, 401

    return {"user": user_schema.dump(current_user)}, 200
