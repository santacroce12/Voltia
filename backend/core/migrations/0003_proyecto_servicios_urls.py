"""
Reestructura el modelo Proyecto y agrega tablas hijas.
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """Define Proyecto moderno y los modelos Servicios/URLs asociados."""

    dependencies = [
        ("core", "0002_cliente_obra"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.DeleteModel(
            name="Proyecto",
        ),
        migrations.CreateModel(
            name="Proyecto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre_proyecto", models.CharField(max_length=255, verbose_name="Nombre del Proyecto")),
                (
                    "tipo",
                    models.CharField(
                        choices=[
                            ("proteccion", "Proteccion"),
                            ("control", "Control"),
                            ("medicion", "Medicion"),
                            ("comunicacion", "Comunicacion"),
                        ],
                        default="proteccion",
                        max_length=20,
                    ),
                ),
                ("fecha_creacion", models.DateField(auto_now_add=True, verbose_name="Fecha de Creacion")),
                ("estado_proyecto", models.CharField(blank=True, max_length=50, null=True, verbose_name="Estado")),
                (
                    "obra",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="proyectos",
                        to="core.obra",
                        verbose_name="Obra",
                    ),
                ),
                (
                    "usuario_creador",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Usuario Creador",
                    ),
                ),
            ],
            options={
                "verbose_name": "Proyecto",
                "verbose_name_plural": "Proyectos",
            },
        ),
        migrations.CreateModel(
            name="ServiciosProyecto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("item_servicio", models.CharField(max_length=255, verbose_name="Item o Servicio")),
                (
                    "horas_estimadas",
                    models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name="Horas Estimadas"),
                ),
                (
                    "tarifa_hora_ref",
                    models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name="Tarifa Hora (Ref.)"),
                ),
                ("notas_alcance", models.TextField(blank=True, null=True, verbose_name="Notas de Alcance")),
                (
                    "proyecto",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="servicios",
                        to="core.proyecto",
                    ),
                ),
            ],
            options={
                "verbose_name": "Servicio de Proyecto",
                "verbose_name_plural": "Servicios de Proyecto",
            },
        ),
        migrations.CreateModel(
            name="UrlsExternasProyecto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("tipo_enlace", models.CharField(max_length=100, verbose_name="Tipo de Enlace (Ej: Pliego, Plano)")),
                ("url", models.URLField(max_length=500, verbose_name="Enlace (URL)")),
                ("descripcion", models.TextField(blank=True, null=True, verbose_name="Descripcion")),
                (
                    "proyecto",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="urls_externas",
                        to="core.proyecto",
                    ),
                ),
            ],
            options={
                "verbose_name": "Enlace Externo",
                "verbose_name_plural": "Enlaces Externos",
            },
        ),
    ]
