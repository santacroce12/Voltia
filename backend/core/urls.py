"""
Rutas especificas de la app core.
Agrupamos endpoints relacionados con proyectos e indicadores de salud.
"""
from django.urls import path

from core import views

app_name = "core"

urlpatterns = [
    path("salud/", views.EstadoSaludAPIView.as_view(), name="salud"),
    path("proyectos/clone/", views.ProyectoCloneAPIView.as_view(), name="proyecto-clone"),
    path("proyectos/", views.ProyectoListCreateAPIView.as_view(), name="proyectos"),
    path("proyectos/<int:pk>/", views.ProyectoDetailAPIView.as_view(), name="proyecto-detail"),
    path("registro/", views.RegistroUsuarioAPIView.as_view(), name="registro"),
    path("clientes/", views.ClienteListCreateAPIView.as_view(), name="clientes"),
    path("clientes/<int:pk>/", views.ClienteDetailAPIView.as_view(), name="cliente-detail"),
    path("obras/", views.ObraListCreateAPIView.as_view(), name="obras"),
    path("obras/<int:obra_id>/exportar-materiales/", views.ExportarMaterialesAPIView.as_view(), name="obras-exportar-materiales"),
    path("obras/<int:pk>/", views.ObraDetailAPIView.as_view(), name="obra-detail"),
    path("instancias/", views.InstanciaDispositivoListCreateAPIView.as_view(), name="instancias"),
    path("instancias/<int:pk>/", views.InstanciaDispositivoDetailAPIView.as_view(), name="instancia-detail"),
    path("catalogo/", views.CatalogoDispositivoListCreateAPIView.as_view(), name="catalogo"),
    path("catalogo/<int:pk>/", views.CatalogoDispositivoDetailAPIView.as_view(), name="catalogo-detail"),
    path("marcas/", views.MarcaListCreateAPIView.as_view(), name="marcas"),
    path("marcas/<int:pk>/", views.MarcaDetailAPIView.as_view(), name="marca-detail"),
    path("categorias/", views.CategoriaListCreateAPIView.as_view(), name="categorias"),
    path("categorias/<int:pk>/", views.CategoriaDetailAPIView.as_view(), name="categoria-detail"),
    path("funciones/", views.FuncionDispositivoListCreateAPIView.as_view(), name="funciones"),
    path("funciones/<int:pk>/", views.FuncionDispositivoDetailAPIView.as_view(), name="funcion-detail"),
    path("servicios/", views.ServiciosProyectoListCreateAPIView.as_view(), name="servicios-proyecto"),
    path("urls-externas/", views.UrlsExternasProyectoListCreateAPIView.as_view(), name="urls-externas"),
    path("atributos/maestro/", views.AtributoMaestroListCreateAPIView.as_view(), name="atributo-maestro-list-create"),
    path("atributos/maestro/<int:pk>/", views.AtributoMaestroDetailAPIView.as_view(), name="atributo-maestro-detail"),
]
