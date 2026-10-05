from flask import Flask, request
from flask_login import LoginManager, current_user
from flask_migrate import Migrate
from flask_socketio import join_room, emit
from db import db
from extensions import ma, socketio
from models import User
from routes.auth import blp as auth_blp
from routes.organisations import blp as organisations_blp
from routes.channels import blp as channels_blp
from routes.direct_messages import blp as direct_messages_blp
from flask_cors import CORS

from utils.channel_helpers import get_channel_membership_or_none

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config["SECRET_KEY"] = "dev-secret"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db.init_app(app)
migrate = Migrate(app, db)
login = LoginManager(app)
ma.init_app(app)
socketio.init_app(
    app,
    cors_allowed_origins="http://localhost:5173",
    manage_session=False,
)

app.register_blueprint(auth_blp, url_prefix="/auth")
app.register_blueprint(organisations_blp, url_prefix="/organisations")
app.register_blueprint(channels_blp, url_prefix="/channels")
app.register_blueprint(direct_messages_blp)


@login.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@app.route("/")
def home():
    return {"message": "HTTP route is working"}


@socketio.on("hello")
def handle_hello():
    print("Hello")


@socketio.on("typing")
def handle_typing(data):
    channel_id = data["channel_id"]
    print("SERVER RECEIVED TYPING")
    print(data)
    print(current_user.username)
    print("SERVER EMITTING user_typing")
    emit(
        "user_typing",
        {
            "user_id": current_user.id,
            "username": current_user.username,
            "channel_id": channel_id,
        },
        to=f"channel:{channel_id}",
        include_self=False,
    )


@socketio.on("join_room")
def handle_join_room(data):
    channel_id = data["channel_id"]

    print("current_user:", current_user)
    print("authenticated:", current_user.is_authenticated)
    print("channel_id:", channel_id)

    channel_membership = get_channel_membership_or_none(channel_id)

    if channel_membership is None:
        print(f"DENIED join channel:{channel_id}")
        return

    join_room(f"channel:{channel_id}")
    print(f"JOINED channel:{channel_id}")


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)
