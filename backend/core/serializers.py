"""
Serializadores para transformar los modelos en JSON listo para el front.
"""
from rest_framework import serializers

from core.models import Proyecto


class ProyectoSerializer(serializers.ModelSerializer):
    """Serializa el modelo Proyecto con todos sus campos basicos."""

    class Meta:
        model = Proyecto
        fields = [
            "id",
            "obra",
            "usuario_creador",
            "nombre_proyecto",
            "tipo",
            "fecha_creacion",
            "estado_proyecto",
        ]
