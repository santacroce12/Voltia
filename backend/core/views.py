"""
Vistas REST responsables de entregar datos al frontend de React.
"""
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import CatalogoDispositivo, InstanciaDispositivo, Obra, Proyecto, Cliente
from core.serializers import (
    CatalogoDispositivoSerializer,
    InstanciaDispositivoSerializer,
    ObraSerializer,
    ProyectoSerializer,
    RegistroUsuarioSerializer,
    ClienteSerializer,
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

    queryset = Obra.objects.all()
    serializer_class = ObraSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Asigna automaticamente al usuario logueado como creador de la Obra."""
        serializer.save(usuario_creador=self.request.user)


class InstanciaDispositivoListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Instancias de Dispositivos.
    Solo usuarios autenticados pueden acceder.
    """

    queryset = InstanciaDispositivo.objects.all()
    serializer_class = InstanciaDispositivoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Asigna automaticamente al usuario logueado como creador de la Instancia."""
        serializer.save(usuario_creador=self.request.user)


class CatalogoDispositivoListCreateAPIView(generics.ListCreateAPIView):
    """
    Vista para LISTAR (GET) y CREAR (POST) Dispositivos del Catalogo.
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
