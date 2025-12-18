"""
Configuracion principal del proyecto VOLTIA.
Cada bloque esta comentado en espanol para dejar claro el objetivo de las variables
y facilitar la puesta en marcha a otros miembros del equipo.
"""
from __future__ import annotations

import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv

# Directorio base del proyecto; se usa para construir rutas absolutas seguras
BASE_DIR = Path(__file__).resolve().parent.parent

# Cargamos las variables definidas en el archivo .env local si existe
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)

# Clave secreta para criptografia interna de Django
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "cambia-esta-clave-en-produccion")

# Bandera de depuracion para controlar mensajes detallados de error
DEBUG = os.getenv("DEBUG", os.getenv("DJANGO_DEBUG", "false")).lower() == "true"

# Lista de hosts permitidos, util cuando despleguemos en un dominio publico
raw_hosts = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost 127.0.0.1 [::1]")
ALLOWED_HOSTS = [host.strip() for host in raw_hosts.replace(",", " ").split(" ") if host.strip()]

# Aplicaciones instaladas, mezclando las core de Django, libs externas y nuestras apps
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",  # API REST en espanol
    "corsheaders",  # Control de origenes para permitir al front comunicarse
    "rest_framework_simplejwt",
    "core.apps.CoreConfig",  # Nuestra app base donde iniciaremos el dominio del negocio
]

# Middleware ordenados segun el flujo de peticion -> respuesta
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # Debe ir alto para anadir los headers CORS
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Configuracion para el ruteo principal
ROOT_URLCONF = "voltia_backend.urls"

# Plantillas: mantenemos ajustes por defecto anadiendo comentarios explicativos
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # Carpeta opcional por si mas adelante usamos HTML server-side
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Puerta de entrada WSGI cuando levantemos con Gunicorn u otro servidor compatible
WSGI_APPLICATION = "voltia_backend.wsgi.application"

# Base de datos: nos conectamos a PostgreSQL 17 usando variables de entorno
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "voltia"),
        "USER": os.getenv("POSTGRES_USER", "voltia"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "voltia"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# Validaciones estandar de contraseñas para cuentas internas
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Idioma y zona horaria por defecto para mostrar la app en espanol
LANGUAGE_CODE = "es-es"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True

# Configuracion basica de archivos estaticos
STATIC_URL = "/django_static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Django recomienda usar BigAutoField para llaves primarias en nuevos modelos
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Configuracion centralizada para DRF con comentarios para proximas ampliaciones
REST_FRAMEWORK = {
    # Comentado en espanol para explicar
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",  # Para ver la API en el navegador
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # Usamos SessionAuthentication para el Admin de Django
        "rest_framework.authentication.SessionAuthentication",
        # Usamos JWT para que React se autentique
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        # Por defecto, ahora todo estara BLOQUEADO.
        # Solo usuarios autenticados podran acceder a la API.
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# Origenes permitidos para CORS; ideal para comunicar el front en React con esta API
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
if cors_origins:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
else:
    CORS_ALLOW_ALL_ORIGINS = True

# --- Configuracion de Simple JWT (JSON Web Tokens) ---
SIMPLE_JWT = {
    # Tiempo de vida corto para seguridad (30 minutos)
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    # Tiempo máximo de sesión antes de pedir login de nuevo (12 horas)
    "REFRESH_TOKEN_LIFETIME": timedelta(hours=12),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
}
