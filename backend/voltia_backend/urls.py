"""
Definicion de rutas principales del backend.
Aqui centralizamos los endpoints expuestos a otros servicios (como el front en React).
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),
    path("api/", include("core.urls")),  # Endpoint raiz para la API principal
]
