from pathlib import Path
import os
from dotenv import load_dotenv

from app import create_app, socketio


basedir = Path(__file__).parent.resolve()
basedir_dotenv = basedir / '.flaskenv'
if basedir_dotenv.exists():
    load_dotenv(basedir_dotenv, override=True)


if __name__ == '__main__':
    flask_env = os.environ.get('FLASK_ENV', 'development')
    flask_run_host = os.environ.get('FLASK_RUN_HOST', '0.0.0.0')
    flask_run_port = int(os.environ.get('FLASK_RUN_PORT') or 5000)

    app = create_app(flask_env)
    socketio.run(app, host=flask_run_host, port=flask_run_port)
