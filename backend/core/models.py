"""
Modelos base del dominio de VOLTIA.
"""
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models


class ModeloAuditable(models.Model):
    """
    Clase abstracta que agrega campos de auditoria a los modelos.
    """
    usuario_creador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_creados",
        verbose_name="Creado por",
    )
    usuario_modificador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_modificados",
        verbose_name="Modificado por",
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creacion")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Ultima Modificacion")

    class Meta:
        abstract = True


class Cliente(ModeloAuditable):
    """
    Representa una organizacion o persona para la cual VOLTIA ejecuta proyectos.
    """

    nombre = models.CharField(max_length=255, verbose_name="Nombre o Razon Social")
    cuil = models.CharField(max_length=20, unique=True, verbose_name="CUIL/CUIT")
    direccion = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name="Direccion",
    )
    notas = models.TextField(blank=True, null=True, verbose_name="Notas")

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self) -> str:
        """Devuelve el nombre para mostrarlo bonito en el panel de admin."""
        return self.nombre


class Marca(ModeloAuditable):
    """
    Catalogo de marcas asociadas a los dispositivos.
    """

    nombre = models.CharField(max_length=150, unique=True, verbose_name="Nombre de la Marca")

    class Meta:
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"

    def __str__(self) -> str:
        """Muestra el nombre de la marca en listados y selects."""
        return self.nombre


class Categoria(ModeloAuditable):
    """
    Catalogo jerarquico (categoria y subcategoria) para organizar dispositivos.
    """

    categoria_principal = models.CharField(max_length=100, verbose_name="Categoria Principal")
    subcategoria = models.CharField(max_length=100, verbose_name="Subcategoria")
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"

    def __str__(self) -> str:
        """Representacion legible usando la jerarquia categoria > subcategoria."""
        return f"{self.categoria_principal} > {self.subcategoria}"


class CatalogoDispositivo(ModeloAuditable):
    """
    Biblioteca de dispositivos estandarizados que podremos asociar a proyectos.
    """

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,  # Si se borra la categoria, el dispositivo no se borra
        null=True,
        blank=True,
        verbose_name="Categoria",
    )
    marca = models.ForeignKey(
        Marca,
        on_delete=models.SET_NULL,  # Si se borra la marca, el dispositivo no se borra
        null=True,
        blank=True,
        verbose_name="Marca",
    )
    modelo = models.CharField(max_length=200, verbose_name="Modelo o N° de Parte")
    nombre_completo_producto = models.CharField(max_length=300, verbose_name="Nombre Completo")
    descripcion_funcional = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripcion Funcional",
    )
    url_ficha_tecnica = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Ficha Tecnica (URL)",
    )
    precio_historico = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Precio Historico (USD/Ref)",
    )
    precio_actual = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Precio Actual de Mercado (USD)",
    )
    funciones_soportadas = models.ManyToManyField(
        "FuncionDispositivo",
        blank=True,
        verbose_name="Funciones Soportadas (de fabrica)",
    )

    class Meta:
        verbose_name = "Dispositivo de Catalogo"
        verbose_name_plural = "Dispositivos de Catalogo"

    def __str__(self) -> str:
        """Muestra la marca y el modelo para identificar el dispositivo."""
        marca_nombre = self.marca.nombre if self.marca else "Sin Marca"
        return f"{marca_nombre} - {self.modelo}"


class AtributoMaestro(models.Model):
    """
    Diccionario de atributos disponibles para describir dispositivos.
    """

    nombre = models.CharField(max_length=150, unique=True, verbose_name="Nombre del Atributo")
    unidad = models.CharField(max_length=50, blank=True, null=True, verbose_name="Unidad de Medida")

    class Meta:
        verbose_name = "Atributo Maestro"
        verbose_name_plural = "Atributos Maestro"
        ordering = ["nombre"]

    def __str__(self) -> str:
        """Muestra el nombre del atributo."""
        return self.nombre


class EspecificacionCatalogo(models.Model):
    """Valor fijo para un atributo en el Catalogo (sustituye al JSON)."""

    catalogo = models.ForeignKey(
        "CatalogoDispositivo",
        on_delete=models.CASCADE,
        related_name="especificaciones_set",
    )
    atributo = models.ForeignKey(AtributoMaestro, on_delete=models.PROTECT)
    valor = models.CharField(max_length=255)

    class Meta:
        unique_together = ("catalogo", "atributo")


class AtributoInstancia(models.Model):
    """Valor unico para un atributo en una Instancia (sustituye al JSON)."""

    instancia = models.ForeignKey(
        "InstanciaDispositivo",
        on_delete=models.CASCADE,
        related_name="atributos_set",
    )
    atributo = models.ForeignKey(AtributoMaestro, on_delete=models.PROTECT)
    valor = models.CharField(max_length=255)

    class Meta:
        unique_together = ("instancia", "atributo")


class FuncionDispositivo(ModeloAuditable):
    """
    Biblioteca maestra de todas las funciones posibles que un dispositivo puede tener.
    """

    codigo_funcion = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="Codigo de Funcion (Ej: 50/51, 87)",
    )
    nombre = models.CharField(max_length=255, verbose_name="Nombre de la Funcion")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripcion")

    class Meta:
        verbose_name = "Funcion de Dispositivo"
        verbose_name_plural = "Funciones de Dispositivos"
        ordering = ["codigo_funcion", "nombre"]

    def __str__(self) -> str:
        """Muestra el codigo (si existe) y el nombre."""
        if self.codigo_funcion:
            return f"[{self.codigo_funcion}] {self.nombre}"
        return self.nombre


class InstanciaDispositivo(ModeloAuditable):
    """
    Representa un dispositivo concreto usado dentro de un proyecto.
    """

    proyecto = models.ForeignKey(
        "Proyecto",  # El modelo Proyecto que ya definimos
        on_delete=models.CASCADE,  # Si se borra el proyecto, se borran sus instancias
        verbose_name="Proyecto",
    )
    catalogo = models.ForeignKey(
        CatalogoDispositivo,
        on_delete=models.PROTECT,  # ¡MUY IMPORTANTE! Impide borrar un dispositivo del catalogo si esta en uso
        verbose_name="Dispositivo del Catalogo",
        related_name="instancias",
    )
    funciones_usadas = models.ManyToManyField(
        "FuncionDispositivo",
        blank=True,
        verbose_name="Funciones Usadas (en este proyecto)",
    )
    precio_real = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name="Precio Real (Compra/Cotizado)",
    )

    class Meta:
        verbose_name = "Instancia de Dispositivo"
        verbose_name_plural = "Instancias de Dispositivos"

    def __str__(self) -> str:
        """Muestra el proyecto y el dispositivo para ubicarlo rapido."""
        return f"{self.proyecto.nombre_proyecto} - {self.catalogo.modelo}"


class EstadoObra(models.TextChoices):
    """Estados posibles de una obra para poder filtrar reportes."""

    REALIZADA = "realizada", "Realizada"
    PENDIENTE = "pendiente", "Pendiente"
    RECHAZADA = "rechazada", "Rechazada"


class Obra(ModeloAuditable):
    """
    Describe una obra especifica ligada a un cliente determinado.
    """

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,  # Si se borra el cliente, se borran sus obras
        verbose_name="Cliente",
    )
    nombre_obra = models.CharField(max_length=255, verbose_name="Nombre de Obra")
    pais = models.CharField(max_length=50, blank=True, null=True, verbose_name="País")
    provincia = models.CharField(max_length=100, blank=True, null=True, verbose_name="Provincia/Estado")
    ubicacion = models.CharField(max_length=300, blank=True, null=True, verbose_name="Dirección / Calle")
    estado_obra = models.CharField(
        max_length=50,
        choices=EstadoObra.choices,
        default=EstadoObra.PENDIENTE,
        verbose_name="Estado de Obra",
    )  # Requerido y con opciones controladas para facilitar filtros

    class Meta:
        verbose_name = "Obra"
        verbose_name_plural = "Obras"

    def __str__(self) -> str:
        """Nombre legible para facilitar la administracion."""
        return self.nombre_obra


class TipoProyecto(models.TextChoices):
    """Opciones disponibles para clasificar el tipo de proyecto."""

    PROTECCION = "proteccion", "Proteccion"
    CONTROL = "control", "Control"
    MEDICION = "medicion", "Medicion"
    COMUNICACION = "comunicacion", "Comunicacion"


class EstadoProyecto(models.TextChoices):
    """Estados posibles del proyecto para seguimiento."""

    PROCESO = "proceso", "Proceso"
    REALIZADO = "realizado", "Realizado"


class Proyecto(ModeloAuditable):
    """
    Representa un proyecto asociado a una obra especifica.
    """

    obra = models.ForeignKey(
        Obra,
        on_delete=models.CASCADE,  # Si se borra la Obra, se borran sus proyectos
        verbose_name="Obra",
        related_name="proyectos",
    )
    nombre_proyecto = models.CharField(max_length=255, verbose_name="Nombre del Proyecto")
    tipo = models.CharField(
        max_length=20,
        choices=TipoProyecto.choices,  # Usa las opciones que definimos arriba
        default=TipoProyecto.PROTECCION,  # Valor por defecto
    )
    estado_proyecto = models.CharField(
        max_length=20,
        choices=EstadoProyecto.choices,
        default=EstadoProyecto.PROCESO,
        verbose_name="Estado",
    )
    ubicacion_fisica = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name="Ubicacion Fisica",
    )

    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"

    def __str__(self) -> str:
        """Entrega el nombre del proyecto para listados amigables."""
        return self.nombre_proyecto


class ServiciosProyecto(models.Model):
    """
    Lista los servicios que cuelgan de un proyecto.
    """

    obra = models.ForeignKey(
        Obra,
        on_delete=models.CASCADE,
        related_name="servicios",
        verbose_name="Obra",
    )
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="servicios",
        verbose_name="Proyecto",
    )
    item_servicio = models.CharField(max_length=255, verbose_name="Item o Servicio")
    horas_estimadas = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.0,
        verbose_name="Horas Estimadas",
    )
    tarifa_hora_ref = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.0,
        verbose_name="Tarifa Hora (Ref.)",
    )
    notas_alcance = models.TextField(
        blank=True,
        null=True,
        verbose_name="Notas de Alcance",
    )

    class Meta:
        verbose_name = "Servicio de Proyecto"
        verbose_name_plural = "Servicios de Proyecto"

    def clean(self):
        """Verifica que el proyecto pertenezca a la obra seleccionada."""
        super().clean()
        if self.proyecto_id and self.obra_id and self.proyecto.obra_id != self.obra_id:
            raise ValidationError("El proyecto elegido debe pertenecer a la obra seleccionada.")

    def save(self, *args, **kwargs):
        """Garantiza que se ejecute la validacion personalizada."""
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        """Muestra el proyecto y el item para ubicarlo rapido en admin."""
        return f"{self.proyecto.nombre_proyecto} - {self.item_servicio}"  # Muestra el proyecto y el item


class UrlsExternasProyecto(models.Model):
    """
    Enlaces relevantes asociados a un proyecto (pliegos, planos, etc.).
    """

    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="urls_externas",
    )
    tipo_enlace = models.CharField(max_length=100, verbose_name="Tipo de Enlace (Ej: Pliego, Plano)")
    url = models.URLField(max_length=500, verbose_name="Enlace (URL)")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripcion")

    class Meta:
        verbose_name = "Enlace Externo"
        verbose_name_plural = "Enlaces Externos"

    def __str__(self) -> str:
        """Descripcion amigable para el admin."""
        return f"{self.proyecto.nombre_proyecto} - {self.tipo_enlace}"
