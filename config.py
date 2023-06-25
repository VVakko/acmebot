import os
from pathlib import Path
from dotenv import load_dotenv

basedir = Path(__file__).parent.resolve()

for _ in ('.env', '.flaskenv'):
    dotenv_path = basedir / _
    if dotenv_path.exists():
        load_dotenv(dotenv_path, override=True)


class Config():
    DISABLE_USER_REGISTRATION = True
    SECRET_KEY = os.getenv('SECRET_KEY') or 'mega secret key'
    SEND_FILE_MAX_AGE_DEFAULT = 0

    # "Private" variables, will be available via properties

    # All filenames in app.root_path / static / images / favicons folder
    static_root_favicon_names = []

    @property
    def STATIC_ROOT_FAVICON_NAMES(self):  # pylint: disable=invalid-name
        return self.static_root_favicon_names

    def __init__(self, app=None):
        if app is not None:
            filepath = Path(app.root_path) / 'base' / 'static' / 'images' / 'favicons'
            self.static_root_favicon_names = [
                x.name for x in filepath.glob('**/*') if x.is_file()
            ]
            self.init_app(app)

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    WTF_CSRF_ENABLED = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,

    'default': DevelopmentConfig
}


def get_config(app_config=None):
    """Returns Flask configuration class.

    :param app_config: the name of the configuration class to be loaded.

    If set, the :envvar:`FLASK_ENV` environment variable will override
    :attr:`config_name`.
    """

    # One by one, we try to load the configuration class.
    for cfg in (app_config, os.getenv('FLASK_ENV')):
        if config.get(cfg):
            return config[cfg]

    return config['default']
