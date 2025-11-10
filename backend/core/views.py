"""
Vistas REST responsables de entregar datos al frontend de React.
"""
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Proyecto
from core.serializers import ProyectoSerializer


class EstadoSaludAPIView(APIView):
    """Endpoint simple para revisar que la API responde correctamente."""

    def get(self, request, *args, **kwargs):
        """Entrega un mensaje corto para monitoreo."""
        data = {"mensaje": "API VOLTIA en linea", "total_proyectos": Proyecto.objects.count()}
        return Response(data)


class ProyectoListCreateAPIView(generics.ListCreateAPIView):
    """
    Expone un listado de proyectos y permite crear nuevos registros.
    Ideal para validar la escritura en PostgreSQL desde el front.
    """

    serializer_class = ProyectoSerializer

    def get_queryset(self):
        """
        Filtra por obra cuando llega el parametro ?obra=ID para reusar desde el admin.
        """
        queryset = Proyecto.objects.all().order_by("-fecha_creacion")
        obra_id = self.request.query_params.get("obra")
        if obra_id:
            queryset = queryset.filter(obra_id=obra_id)
        return queryset
