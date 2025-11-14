"""
Serializadores para transformar los modelos en JSON listo para el front.
"""
from django.contrib.auth.models import User
from rest_framework import serializers

from core.models import CatalogoDispositivo, InstanciaDispositivo, Obra, Proyecto, Cliente


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


class ClienteSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Cliente.
    """

    class Meta:
        model = Cliente
        fields = "__all__"


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


class CatalogoDispositivoSerializer(serializers.ModelSerializer):
    """
    Serializador para la biblioteca de Dispositivos (Catalogo).
    Permite al frontend ver y crear nuevas plantillas de dispositivos.
    """

    marca = serializers.StringRelatedField()
    categoria = serializers.StringRelatedField()

    class Meta:
        model = CatalogoDispositivo
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
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        """Crea el usuario, guardando la contrasena hasheada."""
        usuario = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return usuario
