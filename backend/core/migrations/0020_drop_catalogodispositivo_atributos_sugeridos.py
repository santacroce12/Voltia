from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0019_remove_instanciadispositivo_tag_dispositivo"),
    ]

    operations = [
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS "core_catalogodispositivo_atributos_sugeridos" CASCADE;',
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
