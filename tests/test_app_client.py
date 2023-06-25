from werkzeug.exceptions import Forbidden, InternalServerError

from tests.base_test_case import BaseTestCase


class AppClientTestCase(BaseTestCase):
    def test_client_static_root_favicons(self):
        for _ in self.app.config.get('STATIC_ROOT_FAVICON_NAMES'):
            #self.app.logger.warning(_)  # pylint: disable=no-member
            response = self.client.get('/' + _)
            self.assertEqual(response.status_code, 200)
            response.close()

    def test_client_index_page(self):
        # Checking index page for anonymous.
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue('xPanelMiddle' in response.get_data(as_text=True))
        # Checking 404 error handler for anonymous.
        response = self.client.get('/directory-not-found/')
        self.assertEqual(response.status_code, 404)

    def test_errorhandler_403(self):
        @self.app.route('/page_that_returns_403')
        def errorhandler_403():
            raise Forbidden('error')

        response = self.client.get('/page_that_returns_403')
        self.assertEqual(response.status_code, 403)

    def test_errorhandler_500(self):
        @self.app.route('/page_that_returns_500')
        def errorhandler_500():
            raise InternalServerError('error')

        response = self.client.get('/page_that_returns_500')
        self.assertEqual(response.status_code, 500)
