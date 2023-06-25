import os
import unittest

from config import config, get_config


class AppConfigTestCase(unittest.TestCase):
    def setUp(self):
        self.flask_env_backup = os.getenv('FLASK_ENV')
        os.environ['FLASK_ENV'] = ''

    def tearDown(self):
        os.environ['FLASK_ENV'] = self.flask_env_backup

    def test_config_default(self):
        self.assertEqual(get_config('unknown'), get_config('default'))

    def _test_config_by_name(self, app_config):
        config_class = get_config(app_config)
        self.assertEqual(config_class, config[app_config])
        # Check if Exception occurs when reading class properties (@property)
        for key in dir(config_class):
            if key.isupper():
                self.assertIsNotNone(getattr(config_class(), key))

    def test_config_development(self):
        self._test_config_by_name('development')

    def test_config_production(self):
        self._test_config_by_name('production')

    def test_config_testing(self):
        self._test_config_by_name('testing')
