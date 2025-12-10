from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0021_obra_pais_obra_provincia_alter_obra_ubicacion"),
    ]

    operations = [
        migrations.RunSQL(
            sql="SELECT 1;",  # No-op migration to mark serializer snapshot changes (no schema change)
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
