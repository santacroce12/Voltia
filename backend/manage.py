#!/usr/bin/env python
"""
Archivo de entrada principal para los comandos de Django.
Mantenerlo comentado en espanol ayuda a entender rapidamente como iniciar utilidades administrativas.
"""
import os
import sys


def main() -> None:
    """Configura el modulo de settings y delega la ejecucion al runner de Django."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "voltia_backend.settings")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
