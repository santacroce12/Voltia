#!/bin/sh
# Script de arranque del backend VOLTIA.
# Se asegura de aplicar migraciones antes de exponer el servidor para desarrollo.

set -e

python manage.py migrate --noinput
python manage.py runserver 0.0.0.0:8000
