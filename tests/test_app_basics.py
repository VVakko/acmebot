from flask import current_app

from tests.base_test_case import BaseTestCase


class AppBasicsTestCase(BaseTestCase):
    def test_app_is_exists(self):
        self.assertFalse(current_app is None)

    def test_app_is_testing_environment(self):
        self.assertTrue(current_app.config['TESTING'])

    def test_cli_is_working(self):
        runner = current_app.test_cli_runner()
        result = runner.invoke(args=['test'])
        self.assertEqual(result.exit_code, 0)
        result = runner.invoke(args=['test', '--coverage'])
        self.assertEqual(result.exit_code, 0)
