"""
Configuracion de la aplicacion `core`.
"""
from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Permite a Django identificar la app y ejecutar hooks de inicio."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "core"
    verbose_name = "Core VOLTIA"
