"""
Modelos base del dominio de VOLTIA.
"""
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models


class Cliente(models.Model):
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


class EstadoObra(models.TextChoices):
    """Estados posibles de una obra para poder filtrar reportes."""

    REALIZADA = "realizada", "Realizada"
    PENDIENTE = "pendiente", "Pendiente"
    RECHAZADA = "rechazada", "Rechazada"


class Obra(models.Model):
    """
    Describe una obra especifica ligada a un cliente determinado.
    """

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,  # Si se borra el cliente, se borran sus obras
        verbose_name="Cliente",
    )
    usuario_creador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,  # Si se borra el usuario, la obra NO se borra, solo queda "sin creador"
        null=True,
        blank=True,
        verbose_name="Usuario Creador",
    )
    nombre_obra = models.CharField(max_length=255, verbose_name="Nombre de Obra")
    ubicacion = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name="Ubicacion",
    )
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


class Proyecto(models.Model):
    """
    Representa un proyecto asociado a una obra especifica.
    """

    obra = models.ForeignKey(
        Obra,
        on_delete=models.CASCADE,  # Si se borra la Obra, se borran sus proyectos
        verbose_name="Obra",
        related_name="proyectos",
    )
    usuario_creador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,  # La trazabilidad no se borra, pero es opcional
        null=True,
        blank=True,
        verbose_name="Usuario Creador",
    )
    nombre_proyecto = models.CharField(max_length=255, verbose_name="Nombre del Proyecto")
    tipo = models.CharField(
        max_length=20,
        choices=TipoProyecto.choices,  # Usa las opciones que definimos arriba
        default=TipoProyecto.PROTECCION,  # Valor por defecto
    )
    fecha_creacion = models.DateField(auto_now_add=True, verbose_name="Fecha de Creacion")  # Se pone automaticamente la fecha de hoy al crearlo
    estado_proyecto = models.CharField(
        max_length=20,
        choices=EstadoProyecto.choices,
        default=EstadoProyecto.PROCESO,
        verbose_name="Estado",
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
