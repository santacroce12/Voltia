"""
Ajusta estado de obra y vincula servicios con su obra correspondiente.
"""
from django.db import migrations, models
import django.db.models.deletion


def enlazar_servicios_con_obras(apps, schema_editor):
    ServiciosProyecto = apps.get_model("core", "ServiciosProyecto")
    for servicio in ServiciosProyecto.objects.select_related("proyecto__obra"):
        proyecto = servicio.proyecto
        if proyecto and proyecto.obra_id:
            servicio.obra_id = proyecto.obra_id
            servicio.save(update_fields=["obra"])


def set_default_estado_obra(apps, schema_editor):
    Obra = apps.get_model("core", "Obra")
    Obra.objects.filter(estado_obra__isnull=True).update(estado_obra="pendiente")


class Migration(migrations.Migration):
    """Sincroniza los nuevos requerimientos de negocio."""

    dependencies = [
        ("core", "0003_proyecto_servicios_urls"),
    ]

    operations = [
        migrations.AddField(
            model_name="serviciosproyecto",
            name="obra",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="servicios",
                to="core.obra",
                verbose_name="Obra",
            ),
        ),
        migrations.RunPython(enlazar_servicios_con_obras, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="serviciosproyecto",
            name="obra",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="servicios",
                to="core.obra",
                verbose_name="Obra",
            ),
        ),
        migrations.RunPython(set_default_estado_obra, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="obra",
            name="estado_obra",
            field=models.CharField(
                choices=[
                    ("realizada", "Realizada"),
                    ("pendiente", "Pendiente"),
                    ("rechazada", "Rechazada"),
                ],
                default="pendiente",
                max_length=50,
                verbose_name="Estado de Obra",
            ),
        ),
    ]
