import logging
import os
import sys
import click
import coloredlogs


def init_app(app):
    log_level = logging.DEBUG if os.environ.get('FLASK_DEBUG') == '1' else logging.INFO
    log_format = '%(asctime)s\t%(levelname)8s\t%(funcName)s: %(message)s'
    coloredlogs.install()
    coloredlogs.install(level=log_level, fmt=log_format)

    @app.cli.command('test')
    @click.option('--coverage', is_flag=True, help='Enable code coverage')
    def test(coverage):
        '''
        Run tests.
        '''
        args = ['--verbose']
        args += ['--rootdir', 'tests']
        if coverage:
            args += [
                '--cov',
                '--cov-config', 'tests/.coveragerc',
            ]
        exit_code = 0
        if not app.config['TESTING']:
            # When running via pytest.main(),
            # the percentages of test coverage are incorrectly calculated
            # exit_code = pytest.main(args)
            exit_code = os.system(f"pytest {' '.join(args)}")  # pragma: no cover
        sys.exit(exit_code)
