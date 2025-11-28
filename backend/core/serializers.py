"""
Serializadores para transformar los modelos en JSON listo para el front.
"""
from django.contrib.auth.models import User
from rest_framework import serializers

from core.models import (
    AtributoMaestro,
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
    EspecificacionCatalogo,
    AtributoInstancia,
)


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


class EspecificacionCatalogoSerializer(serializers.ModelSerializer):
    """Valor fijo para un atributo de un dispositivo del catalogo."""

    nombre_atributo = serializers.ReadOnlyField(source="atributo.nombre")
    unidad_atributo = serializers.ReadOnlyField(source="atributo.unidad")

    class Meta:
        model = EspecificacionCatalogo
        fields = ["id", "atributo", "nombre_atributo", "unidad_atributo", "valor"]


class AtributoInstanciaSerializer(serializers.ModelSerializer):
    """Serializa los valores unicos de atributos en cada instancia."""

    nombre_atributo = serializers.ReadOnlyField(source="atributo.nombre")
    unidad_atributo = serializers.ReadOnlyField(source="atributo.unidad")

    class Meta:
        model = AtributoInstancia
        fields = ["id", "atributo", "nombre_atributo", "unidad_atributo", "valor"]


class InstanciaDispositivoSerializer(serializers.ModelSerializer):
    """
    Serializador para InstanciaDispositivo con soporte de escritura de atributos EAV.
    """

    atributos_set = AtributoInstanciaSerializer(many=True, required=False)
    usuario_creador = serializers.ReadOnlyField(source="usuario_creador.username")
    nombre_dispositivo = serializers.ReadOnlyField(source="catalogo.nombre_completo_producto")
    marca_dispositivo = serializers.ReadOnlyField(source="catalogo.marca.nombre")

    class Meta:
        model = InstanciaDispositivo
        fields = "__all__"

    def create(self, validated_data):
        atributos_data = validated_data.pop("atributos_set", [])
        funciones_usadas = validated_data.pop("funciones_usadas", [])

        instancia = InstanciaDispositivo.objects.create(**validated_data)
        instancia.funciones_usadas.set(funciones_usadas)

        for attr_data in atributos_data:
            AtributoInstancia.objects.create(instancia=instancia, **attr_data)

        return instancia

    def update(self, instance, validated_data):
        atributos_data = validated_data.pop("atributos_set", None)
        funciones_usadas = validated_data.pop("funciones_usadas", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if funciones_usadas is not None:
            instance.funciones_usadas.set(funciones_usadas)

        if atributos_data is not None:
            instance.atributos_set.all().delete()
            for attr_data in atributos_data:
                AtributoInstancia.objects.create(instancia=instance, **attr_data)

        return instance


class CatalogoDispositivoSerializer(serializers.ModelSerializer):
    """
    Serializador para la biblioteca de Dispositivos (Catalogo).
    Permite al frontend ver y crear nuevas plantillas de dispositivos.
    """

    marca = serializers.PrimaryKeyRelatedField(queryset=Marca.objects.all())
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    funciones_soportadas = serializers.PrimaryKeyRelatedField(
        queryset=FuncionDispositivo.objects.all(), many=True, required=False
    )
    marca_nombre = serializers.CharField(source="marca.nombre", read_only=True)
    categoria_nombre = serializers.CharField(
        source="categoria.categoria_principal", read_only=True
    )
    especificaciones_set = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CatalogoDispositivo
        fields = "__all__"

    def get_especificaciones_set(self, obj):
        return EspecificacionCatalogoSerializer(obj.especificaciones_set.all(), many=True).data


class ServiciosProyectoSerializer(serializers.ModelSerializer):
    """
    Serializador para los Servicios de un Proyecto.
    """

    class Meta:
        model = ServiciosProyecto
        fields = "__all__"


class UrlsExternasProyectoSerializer(serializers.ModelSerializer):
    """
    Serializador para las URLs Externas de un Proyecto.
    """

    class Meta:
        model = UrlsExternasProyecto
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


class MarcaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Marca.
    """

    class Meta:
        model = Marca
        fields = "__all__"


class CategoriaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Categoria.
    """

    class Meta:
        model = Categoria
        fields = "__all__"


class FuncionDispositivoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo FuncionDispositivo.
    """

    class Meta:
        model = FuncionDispositivo
        fields = "__all__"


class AtributoMaestroSerializer(serializers.ModelSerializer):
    """
    Serializador para el diccionario de atributos maestro.
    """

    class Meta:
        model = AtributoMaestro
        fields = "__all__"


class EspecificacionCatalogoSerializer(serializers.ModelSerializer):
    """Serializa los valores fijos de atributos del catalogo."""

    nombre_atributo = serializers.ReadOnlyField(source="atributo.nombre")
    unidad_atributo = serializers.ReadOnlyField(source="atributo.unidad")

    class Meta:
        model = EspecificacionCatalogo
        fields = ["id", "atributo", "nombre_atributo", "unidad_atributo", "valor"]


class AtributoInstanciaSerializer(serializers.ModelSerializer):
    """Serializa los valores unicos de atributos en cada instancia."""

    nombre_atributo = serializers.ReadOnlyField(source="atributo.nombre")
    unidad_atributo = serializers.ReadOnlyField(source="atributo.unidad")

    class Meta:
        model = AtributoInstancia
        fields = ["id", "atributo", "nombre_atributo", "unidad_atributo", "valor"]
