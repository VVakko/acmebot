from pathlib import Path
from flask import (
    abort, current_app, render_template, request, send_from_directory
)
from jinja2 import TemplateNotFound

from app import socketio
from app.base import blueprint


@blueprint.route('/')
def index():
    return render_template('index.html', segment='index')


@blueprint.route('/<template>')
def route_template(template):
    try:
        # Favicons return without authorization.
        if template in (current_app.config.get('STATIC_ROOT_FAVICON_NAMES') or ''):
            filepath = Path(current_app.root_path) / 'base' / 'static' / 'images' / 'favicons'
            return send_from_directory(filepath, template)

        # Append .html if not specified.
        if not template.endswith('.html'):
            template += '.html'
        # Detect the current page.
        segment = get_segment(request)
        # Serve the file (if exists) from app/templates/FILE.html
        return render_template(template, segment=segment)

    except TemplateNotFound:
        return abort(404)
    except:
        return abort(500)


@socketio.on('connect')
def connect():
    current_app.logger.debug("WebSocket is connected")


@socketio.on('disconnect')
def disconnect():
    current_app.logger.debug("WebSocket is disconnected")


@socketio.on('message')
def message(data):
    if not data:
        return
    current_app.logger.debug(data)


# Helper - Extract current page name from request.
def get_segment(requested):
    try:
        return requested.path.split('/')[-1] or 'index'
    except:
        return None


# Errors

@blueprint.errorhandler(403)
def errorhandler_403(error):  # pylint: disable=unused-argument
    # exceptions.Forbidden
    return render_template('errors/page-403.html'), 403


@blueprint.errorhandler(404)
def errorhandler_404(error):  # pylint: disable=unused-argument
    # exceptions.NotFound
    return render_template('errors/page-404.html'), 404


@blueprint.errorhandler(500)
def errorhandler_500(error):  # pylint: disable=unused-argument
    # exceptions.InternalServerError
    return render_template('errors/page-500.html'), 500
