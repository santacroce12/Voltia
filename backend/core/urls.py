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
    path("catalogo/<int:pk>/", views.CatalogoDispositivoDetailAPIView.as_view(), name="catalogo-detail"),
    path("marcas/", views.MarcaListCreateAPIView.as_view(), name="marcas"),
    path("categorias/", views.CategoriaListCreateAPIView.as_view(), name="categorias"),
    path("funciones/", views.FuncionDispositivoListCreateAPIView.as_view(), name="funciones"),
    path("servicios/", views.ServiciosProyectoListCreateAPIView.as_view(), name="servicios-proyecto"),
    path("urls-externas/", views.UrlsExternasProyectoListCreateAPIView.as_view(), name="urls-externas"),
]
