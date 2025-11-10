"""
ASGI expone la aplicacion asincronica de Django, util para websockets u otros protocolos modernos.
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "voltia_backend.settings")

application = get_asgi_application()
