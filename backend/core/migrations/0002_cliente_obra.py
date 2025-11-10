"""
Migracion que introduce los modelos Cliente y Obra.
"""
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Crea tablas nuevas para clientes y obras asociadas."""

    dependencies = [
        ("core", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Cliente",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=255, verbose_name="Nombre o Razon Social")),
                ("cuil", models.CharField(max_length=20, unique=True, verbose_name="CUIL/CUIT")),
                ("direccion", models.CharField(blank=True, max_length=300, null=True, verbose_name="Direccion")),
                ("notas", models.TextField(blank=True, null=True, verbose_name="Notas")),
            ],
            options={
                "verbose_name": "Cliente",
                "verbose_name_plural": "Clientes",
            },
        ),
        migrations.CreateModel(
            name="Obra",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre_obra", models.CharField(max_length=255, verbose_name="Nombre de Obra")),
                ("ubicacion", models.CharField(blank=True, max_length=300, null=True, verbose_name="Ubicacion")),
                ("estado_obra", models.CharField(blank=True, max_length=50, null=True, verbose_name="Estado de Obra")),
                (
                    "cliente",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        to="core.cliente",
                        verbose_name="Cliente",
                    ),
                ),
                (
                    "usuario_creador",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Usuario Creador",
                    ),
                ),
            ],
            options={
                "verbose_name": "Obra",
                "verbose_name_plural": "Obras",
            },
        ),
    ]
