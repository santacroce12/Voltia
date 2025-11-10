# Imagen base liviana de Python 3.12 para correr Django
FROM python:3.12-slim

# Variables que facilitan el debug y evitan archivos .pyc innecesarios
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalamos dependencias del sistema necesarias para compilar paquetes como psycopg
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiamos e instalamos los paquetes de Python
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del codigo del backend (esto luego sera sobreescrito por el volumen para desarrollo)
COPY . /app

# Damos permisos al script de entrada que ejecuta migraciones y levanta el server
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Comando por defecto: correr el script que espera la BD y enciende Django
CMD ["/bin/sh", "/app/entrypoint.sh"]
