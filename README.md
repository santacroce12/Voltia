# Sistema VOLTIA

Repositorio base para desarrollar el backend en Django + PostgreSQL y el frontend en React, todo orquestado con Docker para facilitar el levantamiento del entorno de desarrollo.

## Contenido

- `backend/`: proyecto Django 5 con DRF y conexiones listas a PostgreSQL 17.
- `frontend/`: app React creada con Vite para construir la UI.
- `docker-compose.yml`: define los servicios (backend, frontend, base de datos).

## Primeros pasos

1. Copia las variables de ejemplo:
   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   Copy-Item .env.example .env
   ```
2. Levanta los contenedores:
   ```powershell
   docker compose up --build
   ```
3. Ejecuta migraciones dentro del contenedor del backend (solo la primera vez):
   ```powershell
   docker compose exec backend python manage.py migrate
   ```

El frontend quedara disponible en `http://localhost:5173` (servido via Vite) y el backend en `http://localhost:8000`.
