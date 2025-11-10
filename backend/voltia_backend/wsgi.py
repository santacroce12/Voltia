"""
WSGI sirve como punto de entrada clasico para servidores como Gunicorn o uWSGI.
"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "voltia_backend.settings")

application = get_wsgi_application()
