"""
Migracion inicial para crear la tabla de proyectos.
"""
from django.db import migrations, models


class Migration(migrations.Migration):
    """Primer snapshot de la estructura de datos."""

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Proyecto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(help_text="Nombre comercial del proyecto", max_length=150)),
                ("descripcion", models.TextField(help_text="Contexto o alcance del proyecto")),
                ("creado_en", models.DateTimeField(auto_now_add=True, help_text="Marca de tiempo de creacion")),
            ],
            options={
                "verbose_name": "Proyecto",
                "verbose_name_plural": "Proyectos",
            },
        )
    ]
