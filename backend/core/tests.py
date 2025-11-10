"""
Pruebas unitarias basicas para evitar regresiones.
"""
from django.test import TestCase
from django.urls import reverse

from core.models import Cliente, EstadoObra, Obra, Proyecto, TipoProyecto


class SaludEndpointTests(TestCase):
    """Valida que el endpoint de salud responda HTTP 200."""

    def test_salud_responde_ok(self):
        url = reverse("core:salud")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("mensaje", response.json())


class ProyectoAPITests(TestCase):
    """Comprueba operaciones basicas sobre proyectos."""

    def test_lista_proyectos(self):
        cliente = Cliente.objects.create(nombre="Cliente Demo", cuil="20-12345678-9")
        obra = Obra.objects.create(
            cliente=cliente,
            nombre_obra="Obra Central",
            estado_obra=EstadoObra.PENDIENTE,
        )
        proyecto = Proyecto.objects.create(
            obra=obra,
            nombre_proyecto="Proyecto Inicial",
            tipo=TipoProyecto.PROTECCION,
        )
        url = reverse("core:proyectos")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.json()), 1)

        # Con el parametro ?obra deberia retornar solo los proyectos de esa obra
        response_filtrado = self.client.get(url, {"obra": obra.id})
        self.assertEqual(response_filtrado.status_code, 200)
        self.assertEqual(len(response_filtrado.json()), 1)
        self.assertEqual(response_filtrado.json()[0]["id"], proyecto.id)
