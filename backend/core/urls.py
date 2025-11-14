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
    path("registro/", views.RegistroUsuarioAPIView.as_view(), name="registro"),
    path("clientes/", views.ClienteListCreateAPIView.as_view(), name="clientes"),
    path("obras/", views.ObraListCreateAPIView.as_view(), name="obras"),
    path("instancias/", views.InstanciaDispositivoListCreateAPIView.as_view(), name="instancias"),
    path("catalogo/", views.CatalogoDispositivoListCreateAPIView.as_view(), name="catalogo"),
]
