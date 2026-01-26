import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
    crearInstancia,
    type InstanciaDispositivo,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type InstanciaPayload,
    listarAtributosMaestros,
    crearAtributoMaestro,
    type AtributoMaestro,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Layers, Eye } from "lucide-react";
import { DynamicAttributeForm } from "@/components/DynamicAttributeForm";
import { Modal } from "./Modal";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Props = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    masterAtributos: AtributoMaestro[];
    onInstanciaCreada: (instancia: InstanciaDispositivo) => void;
    onAbrirModalCatalogo: () => void;
    onAbrirModalEditarFunciones: (id: number) => void;
};

export function InstanciaForm({
    proyectoId,
    catalogo,
    masterFunciones,
    masterAtributos,
    onInstanciaCreada,
    onAbrirModalCatalogo,
    onAbrirModalEditarFunciones,
}: Props) {
    const [catalogoId, setCatalogoId] = useState("");
    const [valoresEAV, setValoresEAV] = useState<Record<number, string>>({});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [precioReal, setPrecioReal] = useState("");

    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);
    const [viewOpen, setViewOpen] = useState(false);
    const [busquedaCatalogo, setBusquedaCatalogo] = useState("");
    const [filtroMarca, setFiltroMarca] = useState<string>("all");
    const [filtroCategoria, setFiltroCategoria] = useState<string>("all");
    const [nuevoAttrNombre, setNuevoAttrNombre] = useState("");
    const [nuevoAttrUnidad, setNuevoAttrUnidad] = useState("");
    const [creandoAttr, setCreandoAttr] = useState(false);
    const [modalNuevoAttrOpen, setModalNuevoAttrOpen] = useState(false);

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));

            // --- SNAPSHOT de especificaciones ---
            const defaults: Record<number, string> = {};
            if (disp?.especificaciones_set) {
                disp.especificaciones_set.forEach((spec: any) => {
                    defaults[spec.atributo] = spec.valor;
                });
            }
            setValoresEAV(defaults);
            // ------------------------------------

            const idsSoportados = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => idsSoportados.includes(f.id)));
            const precioBase = disp?.precio_actual ?? disp?.precio_historico ?? "";
            setPrecioReal(precioBase !== "" && precioBase !== null && precioBase !== undefined ? String(precioBase) : "");
        } else {
            setValoresEAV({});
            setFuncionesDisponibles([]);
            setPrecioReal("");
        }
        setFuncionesUsadasIds([]);
    }, [catalogoId, catalogo, masterFunciones]);

    useEffect(() => {
        if (masterAtributos && masterAtributos.length > 0) {
            setAtributosMaestros(masterAtributos);
        } else {
            listarAtributosMaestros().then(setAtributosMaestros).catch(console.error);
        }
    }, [masterAtributos]);

    const selectedCatalogo = catalogo.find((d) => d.id === Number(catalogoId));
    const funcionesDelCatalogo = selectedCatalogo
        ? masterFunciones.filter((f) => selectedCatalogo.funciones_soportadas?.includes(f.id))
        : [];
    const especificacionesSet = (selectedCatalogo as any)?.especificaciones_set || [];
    const precioReferencia = selectedCatalogo?.precio_historico ?? null;
    const precioFallback = selectedCatalogo?.precio_actual ?? selectedCatalogo?.precio_historico ?? 0;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!catalogoId) return;
        setCargando(true);
        setError(null);

        try {
            const atributosArray = Object.entries(valoresEAV).map(([idAttr, val]) => ({
                atributo: Number(idAttr),
                valor: val,
            }));

            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                atributos_set: atributosArray,
                funciones_usadas: funcionesUsadasIds,
                precio_real:
                    precioReal.trim() !== ""
                        ? Number(precioReal)
                        : Number.isFinite(precioFallback)
                          ? Number(precioFallback)
                          : 0,
            };

            const nueva = await crearInstancia(payload);
            onInstanciaCreada(nueva);

            setValoresEAV({});
            setFuncionesUsadasIds([]);
            setCatalogoId("");
        } catch (err: any) {
            setError(err.message || "Error al anadir instancia.");
        } finally {
            setCargando(false);
        }
    };

    const catalogoFiltrado = useMemo(() => {
        const term = busquedaCatalogo.toLowerCase();
        return catalogo.filter((d) => {
            const texto = `${d.nombre_completo_producto} ${d.modelo} ${(d as any).marca_nombre || ""} ${(d as any).categoria_nombre || ""}`.toLowerCase();
            const coincideTexto = term ? texto.includes(term) : true;
            const coincideMarca = filtroMarca !== "all" ? String(d.marca) === filtroMarca : true;
            const coincideCategoria = filtroCategoria !== "all" ? String(d.categoria) === filtroCategoria : true;
            return coincideTexto && coincideMarca && coincideCategoria;
        });
    }, [busquedaCatalogo, filtroMarca, filtroCategoria, catalogo]);

    const crearAtributoRapido = async () => {
        if (!nuevoAttrNombre.trim()) return;
        setCreandoAttr(true);
        try {
            const creado = await crearAtributoMaestro({
                nombre: nuevoAttrNombre.trim(),
                unidad: nuevoAttrUnidad.trim() || null,
            });
            setAtributosMaestros((prev) => [...prev, creado].sort((a, b) => a.nombre.localeCompare(b.nombre)));
            setNuevoAttrNombre("");
            setNuevoAttrUnidad("");
            // mostrarlo inmediatamente
            setValoresEAV((prev) => ({ ...prev, [creado.id]: "" }));
            setModalNuevoAttrOpen(false);
        } catch (e) {
            console.error("No se pudo crear el atributo", e);
        } finally {
            setCreandoAttr(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5" /> Carga Individual (1 a 1)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form id="single-form" className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Dispositivo del Catalogo</Label>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Input
                                    placeholder="Filtrar por nombre o modelo..."
                                    value={busquedaCatalogo}
                                    onChange={(e) => setBusquedaCatalogo(e.target.value)}
                                    className="h-9"
                                />
                                <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Filtrar por marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las marcas</SelectItem>
                                        {[...new Set(catalogo.map((d) => (d.marca ? String(d.marca) : null)).filter(Boolean))].map(
                                            (id) => {
                                                const nombre =
                                                    (catalogo.find((c) => c.marca && String(c.marca) === id) as any)
                                                        ?.marca_nombre || `Marca #${id}`;
                                                return (
                                                    <SelectItem key={id as string} value={id as string}>
                                                        {nombre}
                                                    </SelectItem>
                                                );
                                            },
                                        )}
                                    </SelectContent>
                                </Select>
                                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Filtrar por categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {[
                                            ...new Set(catalogo.map((d) => (d.categoria ? String(d.categoria) : null)).filter(Boolean)),
                                        ].map((id) => {
                                            const nombre =
                                                (catalogo.find((c) => c.categoria && String(c.categoria) === id) as any)
                                                    ?.categoria_nombre || `Categoría #${id}`;
                                            return (
                                                <SelectItem key={id as string} value={id as string}>
                                                    {nombre}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Select value={catalogoId} onValueChange={setCatalogoId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Seleccionar Dispositivo..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                        {catalogoFiltrado.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {(d as any).marca_nombre ? `${(d as any).marca_nombre} - ` : ""} {d.modelo}
                                            </SelectItem>
                                        ))}
                                        {catalogoFiltrado.length === 0 && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">Sin resultados.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setViewOpen(true)}
                                    disabled={!selectedCatalogo}
                                    title="Ver detalle del dispositivo"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={onAbrirModalCatalogo}
                                    title="Crear Nuevo en Catalogo"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3">
                        <div className="grid gap-2">
                            <Label>Precio Historico (Ref)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={precioReferencia ?? ""}
                                disabled
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Precio Real de Compra</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={precioReal}
                                onChange={(e) => setPrecioReal(e.target.value)}
                                placeholder="Ej: 45.00"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 rounded-lg border bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-semibold">Atributos de la instancia</Label>
                                <p className="text-xs text-muted-foreground">
                                    Agrega atributos y carga sus valores (hereda vacios/valores del catalogo).
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setModalNuevoAttrOpen(true)}
                                title="Crear nuevo atributo"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Nuevo
                            </Button>
                        </div>
                        <DynamicAttributeForm
                            todosLosAtributos={atributosMaestros}
                            valores={valoresEAV}
                            onChange={setValoresEAV}
                        />
                    </div>

                    {/* --- NUEVA LISTA DE CHECKBOXES (Reemplaza al Select) --- */}
                    <div className="grid gap-2 md:col-span-2">
                        <div className="flex items-center justify-between">
                            <Label>Funciones a Habilitar</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onAbrirModalEditarFunciones(Number(catalogoId))}
                                disabled={!catalogoId}
                                className="h-6 text-xs text-muted-foreground hover:text-primary"
                            >
                                <Edit2 className="h-3 w-3 mr-1" /> Editar Funciones Soportadas
                            </Button>
                        </div>

                        <div
                            className={cn(
                                "rounded-md border p-4 h-48 overflow-y-auto bg-background space-y-3",
                                !catalogoId && "opacity-50 pointer-events-none bg-muted",
                            )}
                        >
                            {funcionesDisponibles.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {catalogoId ? "Este dispositivo no tiene funciones configuradas." : "Seleccione un dispositivo primero."}
                                </p>
                            ) : (
                                funcionesDisponibles.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors"
                                    >
                                        <Checkbox
                                            id={`func-inst-${f.id}`}
                                            checked={funcionesUsadasIds.includes(f.id)}
                                            onCheckedChange={(checked) => {
                                                setFuncionesUsadasIds((prev) =>
                                                    checked ? [...prev, f.id] : prev.filter((id) => id !== f.id),
                                                );
                                            }}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={`func-inst-${f.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                                {f.nombre}
                                            </Label>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="single-form" type="submit" disabled={cargando} className="w-full">
                    {cargando ? "Anadiendo..." : "Anadir Instancia"}
                </Button>
            </CardFooter>

            <Modal isOpen={modalNuevoAttrOpen} onClose={() => setModalNuevoAttrOpen(false)} title="Nuevo atributo maestro">
                <div className="grid gap-3">
                    <div className="grid gap-2">
                        <Label>Nombre</Label>
                        <Input
                            value={nuevoAttrNombre}
                            onChange={(e) => setNuevoAttrNombre(e.target.value)}
                            placeholder="Ej: IP, Serie, Ubicacion"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Unidad (opcional)</Label>
                        <Input
                            value={nuevoAttrUnidad}
                            onChange={(e) => setNuevoAttrUnidad(e.target.value)}
                            placeholder="Ej: V, A, texto libre"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setModalNuevoAttrOpen(false)}>Cancelar</Button>
                        <Button onClick={crearAtributoRapido} disabled={creandoAttr || !nuevoAttrNombre.trim()}>
                            {creandoAttr ? "Creando..." : "Crear atributo"}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Detalle de dispositivo">
                {selectedCatalogo ? (
                    <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <p><strong>Marca:</strong> {(selectedCatalogo as any).marca_nombre ?? selectedCatalogo.marca}</p>
                            <p><strong>Modelo:</strong> {selectedCatalogo.modelo}</p>
                            <p><strong>Nombre:</strong> {selectedCatalogo.nombre_completo_producto}</p>
                            <p><strong>Categoria:</strong> {(selectedCatalogo as any).categoria_nombre ?? selectedCatalogo.categoria}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Funciones soportadas</h4>
                            {funcionesDelCatalogo.length ? (
                                <ul className="list-disc pl-4 space-y-1">
                                    {funcionesDelCatalogo.map((f) => (
                                        <li key={f.id}>{f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}{f.nombre}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-xs">Sin funciones configuradas.</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold">Especificaciones fijas</h4>
                            {especificacionesSet && especificacionesSet.length ? (
                                <ul className="list-disc pl-4 space-y-1">
                                    {especificacionesSet.map((e: any) => (
                                        <li key={e.id}>
                                            {e.nombre_atributo || `Atributo #${e.atributo}`}: {e.valor} {e.unidad_atributo || ""}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-xs">Sin especificaciones cargadas.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">Selecciona un dispositivo para ver su detalle.</p>
                )}
            </Modal>
        </Card>
    );
}
