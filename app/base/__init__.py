from flask import Blueprint

blueprint = Blueprint(
    'base_blueprint',
    __name__,
    url_prefix='',
    static_folder='static',
    template_folder='templates'
)
