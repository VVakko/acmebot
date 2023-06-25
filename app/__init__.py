from importlib import import_module
from flask import Flask
from werkzeug.exceptions import default_exceptions

from app import cli
from config import get_config


def register_extensions(app):  # pylint: disable=unused-argument
    '''Register all Extensions of the specified Flask application.

    :param app: Flask application.
    :type app: :class:`flask.Flask`
    '''


def register_blueprints(app):
    '''Register all Blueprint instances on the specified Flask application.

    :param app: Flask application.
    :type app: :class:`flask.Flask`
    '''
    for module_name in ('base',):
        module = import_module(f'app.{module_name}.routes')
        app.register_blueprint(module.blueprint)


def register_exceptions(app):
    '''Method used to register all werkzeug exceptions.

    :param app: Flask application.
    :type app: :class:`flask.Flask`
    '''
    for code in default_exceptions:
        for name, _ in app.blueprints.items():
            # get the handler for 'code' error registered by the blueprint
            handler = app.error_handler_spec.get(name, {}).get(code)

            for _, value in (handler or {}).items():
                app.register_error_handler(code, value)


def create_app(app_config=None):
    '''
    Create Flask application.
    '''
    app = Flask(__name__, static_folder='base/static')
    config = get_config(app_config)
    app.config.from_object(config(app))

    # Initialization CLI (Command Line Interface).
    cli.init_app(app)

    # Register extensions, blueprints and exceptions.
    register_extensions(app)
    register_blueprints(app)
    register_exceptions(app)

    return app
