"""
Configuraciones del administrador de Django para inspeccionar modelos rapidamente.
"""
from django import forms
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, reverse

from core.models import (
    AtributoInstancia,
    AtributoMaestro,
    CatalogoDispositivo,
    Categoria,
    Cliente,
    EspecificacionCatalogo,
    FuncionDispositivo,
    InstanciaDispositivo,
    Marca,
    Obra,
    Proyecto,
    ServiciosProyecto,
    UrlsExternasProyecto,
)


@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    """Define columnas visibles y filtros basicos para el admin."""

    list_display = ("id", "nombre_proyecto", "obra", "tipo", "fecha_creacion")
    list_display_links = ("nombre_proyecto",)
    search_fields = ("nombre_proyecto", "obra__nombre_obra")
    list_filter = ("obra", "tipo", "estado_proyecto", "fecha_creacion", "obra__estado_obra")


@admin.register(Obra)
class ObraAdmin(admin.ModelAdmin):
    """Permite filtrar rapidamente por estado de obra."""

    list_display = ("id", "nombre_obra", "cliente", "estado_obra")
    list_display_links = ("nombre_obra",)
    list_filter = ("estado_obra", "cliente")
    search_fields = ("nombre_obra", "cliente__nombre")


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    """Admin sencillo para clientes."""

    list_display = ("id", "nombre", "cuil")
    search_fields = ("nombre", "cuil")


class ServiciosProyectoForm(forms.ModelForm):
    """
    Formulario personalizado para filtrar los proyectos segun la obra elegida.
    """

    class Meta:
        model = ServiciosProyecto
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        proyecto_field = self.fields["proyecto"]
        proyecto_field.queryset = Proyecto.objects.none()

        # Determinamos la obra seleccionada ya sea desde el POST o desde el registro existente
        obra_id = None
        if self.data.get("obra"):
            obra_id = self.data.get("obra")
        elif self.instance.pk:
            obra_id = self.instance.obra_id

        selected_id = None
        if self.instance.pk:
            selected_id = self.instance.proyecto_id

        if obra_id:
            proyecto_field.queryset = Proyecto.objects.filter(obra_id=obra_id)
        elif selected_id:
            proyecto_field.queryset = Proyecto.objects.filter(pk=selected_id)

@admin.register(ServiciosProyecto)
class ServiciosProyectoAdmin(admin.ModelAdmin):
    """Expone obra y proyecto para crear servicios con trazabilidad."""

    form = ServiciosProyectoForm
    list_display = ("id", "obra", "proyecto", "item_servicio", "horas_estimadas")
    list_filter = ("obra", "proyecto")
    search_fields = ("item_servicio", "proyecto__nombre_proyecto")

    class Media:
        js = ("core/admin/servicios_proyecto.js?v=2",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        formfield = super().formfield_for_foreignkey(db_field, request, **kwargs)
        if db_field.name in {"obra", "proyecto"}:
            widget = formfield.widget
            # Si el admin lo envolvio en RelatedFieldWidgetWrapper, accedemos al widget interno
            inner_widget = getattr(widget, "widget", widget)
            endpoint = reverse("admin:core_serviciosproyecto_proyectos_por_obra")
            if db_field.name == "obra":
                inner_widget.attrs["data-projects-endpoint"] = endpoint
            else:
                inner_widget.attrs["data-endpoint"] = endpoint
        return formfield

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "proyectos-por-obra/",
                self.admin_site.admin_view(self.proyectos_por_obra),
                name="core_serviciosproyecto_proyectos_por_obra",
            ),
        ]
        return custom_urls + urls

    def proyectos_por_obra(self, request):
        """Devuelve proyectos para la obra seleccionada en formato JSON."""
        obra_id = request.GET.get("obra")
        data = []
        if obra_id:
            data = list(
                Proyecto.objects.filter(obra_id=obra_id).values("id", "nombre_proyecto"),
            )
        return JsonResponse(data, safe=False)


@admin.register(UrlsExternasProyecto)
class UrlsExternasProyectoAdmin(admin.ModelAdmin):
    """Permite revisar enlaces cargados para cada proyecto."""

    list_display = ("id", "proyecto", "tipo_enlace", "url")
    list_filter = ("tipo_enlace", "proyecto")
    search_fields = ("tipo_enlace", "proyecto__nombre_proyecto", "url")


class CatalogoDispositivoFuncionInline(admin.TabularInline):
    """
    Permite vincular rapidamente funciones con dispositivos desde el admin de funciones.
    """

    model = CatalogoDispositivo.funciones_soportadas.through
    extra = 1
    fk_name = "funciondispositivo"


@admin.register(FuncionDispositivo)
class FuncionDispositivoAdmin(admin.ModelAdmin):
    """Admin sencillo para gestionar el catalogo de funciones."""

    list_display = ("codigo_funcion", "nombre")
    search_fields = ("codigo_funcion", "nombre")
    inlines = [CatalogoDispositivoFuncionInline]


@admin.register(CatalogoDispositivo)
class CatalogoDispositivoAdmin(admin.ModelAdmin):
    """
    Mejora el admin del catalogo para seleccionar funciones soportadas.
    """

    list_display = ("__str__", "marca", "categoria")
    search_fields = ("modelo", "nombre_completo_producto", "marca__nombre", "categoria__subcategoria")
    list_filter = ("marca", "categoria")
    filter_horizontal = ("funciones_soportadas",)


@admin.register(InstanciaDispositivo)
class InstanciaDispositivoAdmin(admin.ModelAdmin):
    """
    Admin de instancias que permite seleccionar funciones usadas en cada proyecto.
    """

    list_display = ("id", "tag_dispositivo", "proyecto", "catalogo", "usuario_creador")
    search_fields = ("tag_dispositivo", "proyecto__nombre_proyecto", "catalogo__modelo")
    list_filter = ("proyecto__obra", "proyecto")
    filter_horizontal = ("funciones_usadas",)


@admin.register(AtributoMaestro)
class AtributoMaestroAdmin(admin.ModelAdmin):
    """ABM del diccionario de atributos maestros."""

    list_display = ("nombre", "unidad")
    search_fields = ("nombre",)


@admin.register(EspecificacionCatalogo)
class EspecificacionCatalogoAdmin(admin.ModelAdmin):
    """Valores fijos por dispositivo en el catalogo."""

    list_display = ("catalogo", "atributo", "valor")
    search_fields = ("catalogo__modelo", "atributo__nombre", "valor")
    list_filter = ("catalogo", "atributo")


@admin.register(AtributoInstancia)
class AtributoInstanciaAdmin(admin.ModelAdmin):
    """Valores unicos por instancia (cargados en obra)."""

    list_display = ("instancia", "atributo", "valor")
    search_fields = ("instancia__tag_dispositivo", "atributo__nombre", "valor")
    list_filter = ("instancia__proyecto", "atributo")


admin.site.register(Marca)
admin.site.register(Categoria)
