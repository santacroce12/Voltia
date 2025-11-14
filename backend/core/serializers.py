"""
Serializadores para transformar los modelos en JSON listo para el front.
"""
from django.contrib.auth.models import User
from rest_framework import serializers

from core.models import InstanciaDispositivo, Obra, Proyecto


class ProyectoSerializer(serializers.ModelSerializer):
    """Serializa el modelo Proyecto con todos sus campos basicos."""

    usuario_creador = serializers.ReadOnlyField(source="usuario_creador.username")

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
            "ubicacion_fisica",
        ]


class ObraSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Obra.
    El campo usuario_creador es de solo lectura.
    """

    usuario_creador = serializers.ReadOnlyField(source="usuario_creador.username")

    class Meta:
        model = Obra
        fields = "__all__"


class InstanciaDispositivoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo InstanciaDispositivo.
    El campo usuario_creador es de solo lectura.
    """

    usuario_creador = serializers.ReadOnlyField(source="usuario_creador.username")

    class Meta:
        model = InstanciaDispositivo
        fields = "__all__"


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para registrar nuevos usuarios.
    Solo pide los campos necesarios y se encarga de hashear la contrasena.
    """

    class Meta:
        model = User
        fields = ("username", "password", "email", "first_name", "last_name")
        extra_kwargs = {
            "password": {"write_only": True},  # 'write_only' significa que la contrasena no se puede LEER
        }

    def create(self, validated_data):
        """
        Esta funcion se llama cuando los datos son validos.
        Usamos 'create_user' para asegurar que la contrasena se guarde hasheada.
        """
        usuario = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return usuario
