#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Esperando a PostgreSQL..."
    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done
    echo "PostgreSQL iniciado"
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn voltia_backend.wsgi:application --bind 0.0.0.0:8000
