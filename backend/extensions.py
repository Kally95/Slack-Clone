from flask_marshmallow import Marshmallow
from flask_socketio import SocketIO, emit

ma = Marshmallow()
socketio = SocketIO(
    cors_allowed_origins="http://localhost:5173",
    manage_session=False,
)
