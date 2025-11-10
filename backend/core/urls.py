"""
Rutas especificas de la app core.
Agrupamos endpoints relacionados con proyectos e indicadores de salud.
"""
from django.urls import path

from core import views

app_name = "core"

urlpatterns = [
    path("salud/", views.EstadoSaludAPIView.as_view(), name="salud"),
    path("proyectos/", views.ProyectoListCreateAPIView.as_view(), name="proyectos"),
]
