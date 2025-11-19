"""
Vistas REST responsables de entregar datos al frontend de React.
"""
from django.contrib.auth.models import User
from django.db import models
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import (
    CatalogoDispositivo,
    InstanciaDispositivo,
    Obra,
    Proyecto,
    Cliente,
    Marca,
    Categoria,
    FuncionDispositivo,
    ServiciosProyecto,
    UrlsExternasProyecto,
)
from core.serializers import (
    CatalogoDispositivoSerializer,
    InstanciaDispositivoSerializer,
    ObraSerializer,
    ProyectoSerializer,
    RegistroUsuarioSerializer,
    ClienteSerializer,
    MarcaSerializer,
    CategoriaSerializer,
    FuncionDispositivoSerializer,
    ServiciosProyectoSerializer,
    UrlsExternasProyectoSerializer,
)


class EstadoSaludAPIView(APIView):
    """Endpoint simple para revisar que la API responde correctamente."""

    permission_classes = [AllowAny]  # Permite acceso publico a esta vista

    def get(self, request, *args, **kwargs):
        """Entrega un mensaje corto para monitoreo."""
        data = {"mensaje": "API VOLTIA en linea", "total_proyectos": Proyecto.objects.count()}
        return Response(data)


class ProyectoListCreateAPIView(generics.ListCreateAPIView):
    """
    Expone un listado de proyectos y permite crear nuevos registros.
    Ideal para validar la escritura en PostgreSQL desde el front.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProyectoSerializer

    def get_queryset(self):
        """
        Filtra por obra cuando llegue el parametro ?obra=ID para reusar desde el admin.
        """
        queryset = Proyecto.objects.all().order_by("-fecha_creacion")
        obra_id = self.request.query_params.get("obra")
        if obra_id:
            queryset = queryset.filter(obra_id=obra_id)
        return queryset

    def perform_create(self, serializer):
        """Asigna automaticamente al usuario autenticado como creador del proyecto."""
        serializer.save(usuario_creador=self.request.user)


class ProyectoDetailAPIView(generics.RetrieveUpdateAPIView):
    """Permite consultar o actualizar un proyecto especifico."""

    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegistroUsuarioAPIView(generics.CreateAPIView):
    """
    Endpoint de API para que nuevos usuarios puedan registrarse.
    Es de solo creacion (POST).
    """

    queryset = User.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [AllowAny]  # ¡Importante! Permite el acceso sin token


class ObraListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Obras.
    Solo usuarios autenticados pueden acceder.
    """

    serializer_class = ObraSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filtra por cliente cuando llegue el parametro ?cliente=ID.
        """
        queryset = Obra.objects.all().order_by("-id")
        cliente_id = self.request.query_params.get("cliente")
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        return queryset

    def perform_create(self, serializer):
        """Asigna automaticamente al usuario logueado como creador de la Obra."""
        serializer.save(usuario_creador=self.request.user)


class ObraDetailAPIView(generics.RetrieveUpdateAPIView):
    """Permite leer o actualizar una obra puntual."""

    queryset = Obra.objects.all()
    serializer_class = ObraSerializer
    permission_classes = [permissions.IsAuthenticated]


class InstanciaDispositivoListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Instancias de Dispositivos.
    Solo usuarios autenticados pueden acceder.
    """

    serializer_class = InstanciaDispositivoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filtra por proyecto cuando llegue el parametro ?proyecto=ID.
        """
        queryset = InstanciaDispositivo.objects.all().order_by("-id")
        proyecto_id = self.request.query_params.get("proyecto")
        if proyecto_id:
            queryset = queryset.filter(proyecto_id=proyecto_id)
        return queryset

    def perform_create(self, serializer):
        """Asigna automaticamente al usuario logueado como creador de la Instancia."""
        serializer.save(usuario_creador=self.request.user)


class InstanciaDispositivoDetailAPIView(generics.RetrieveDestroyAPIView):
    """Permite consultar o eliminar una instancia de dispositivo puntual."""

    queryset = InstanciaDispositivo.objects.all()
    serializer_class = InstanciaDispositivoSerializer
    permission_classes = [permissions.IsAuthenticated]


class CatalogoDispositivoListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Dispositivos del Catalogo.
    """

    serializer_class = CatalogoDispositivoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Permite filtrar el catálogo por marca, categoría o texto en nombre/modelo.
        """
        queryset = CatalogoDispositivo.objects.all().order_by("-id")
        marca_id = self.request.query_params.get("marca")
        categoria_id = self.request.query_params.get("categoria")
        search = self.request.query_params.get("q")

        if marca_id:
            queryset = queryset.filter(marca_id=marca_id)
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        if search:
            queryset = queryset.filter(
                models.Q(nombre_completo_producto__icontains=search)
                | models.Q(modelo__icontains=search)
            )
        return queryset


class CatalogoDispositivoDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para LEER, ACTUALIZAR y BORRAR un dispositivo específico del catálogo.
    """

    queryset = CatalogoDispositivo.objects.all()
    serializer_class = CatalogoDispositivoSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClienteListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Clientes.
    Solo usuarios autenticados pueden acceder.
    """

    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClienteDetailAPIView(generics.RetrieveUpdateAPIView):
    """Permite consultar o actualizar un cliente en particular."""

    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]


class MarcaListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Marcas.
    """

    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [permissions.IsAuthenticated]


class MarcaDetailAPIView(generics.RetrieveUpdateAPIView):
    """Permite consultar o actualizar una marca."""

    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [permissions.IsAuthenticated]


class CategoriaListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Categorias.
    """

    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class CategoriaDetailAPIView(generics.RetrieveUpdateAPIView):
    """Permite consultar o actualizar una categoria."""

    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class FuncionDispositivoListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Funciones de Dispositivos.
    """

    queryset = FuncionDispositivo.objects.all()
    serializer_class = FuncionDispositivoSerializer
    permission_classes = [permissions.IsAuthenticated]


class FuncionDispositivoDetailAPIView(generics.RetrieveUpdateAPIView):
    """Permite consultar o actualizar una funcion de dispositivo."""

    queryset = FuncionDispositivo.objects.all()
    serializer_class = FuncionDispositivoSerializer
    permission_classes = [permissions.IsAuthenticated]


class ServiciosProyectoListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Servicios de un Proyecto.
    """

    serializer_class = ServiciosProyectoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtra servicios por el ID del proyecto."""
        queryset = ServiciosProyecto.objects.all()
        proyecto_id = self.request.query_params.get("proyecto")
        if proyecto_id:
            queryset = queryset.filter(proyecto_id=proyecto_id)
        return queryset


class UrlsExternasProyectoListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) URLs externas de un Proyecto.
    """

    serializer_class = UrlsExternasProyectoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtra URLs por el ID del proyecto."""
        queryset = UrlsExternasProyecto.objects.all()
        proyecto_id = self.request.query_params.get("proyecto")
        if proyecto_id:
            queryset = queryset.filter(proyecto_id=proyecto_id)
        return queryset
