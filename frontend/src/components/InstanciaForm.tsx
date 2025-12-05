import { useState, useEffect, type FormEvent } from "react";
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
    const [tag, setTag] = useState("");
    const [valoresEAV, setValoresEAV] = useState<Record<number, string>>({});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);
    const [viewOpen, setViewOpen] = useState(false);
    const [busquedaFuncion, setBusquedaFuncion] = useState("");
    const [busquedaAtributo, setBusquedaAtributo] = useState("");
    const [nuevoAttrNombre, setNuevoAttrNombre] = useState("");
    const [nuevoAttrUnidad, setNuevoAttrUnidad] = useState("");
    const [creandoAttr, setCreandoAttr] = useState(false);
    const [modalNuevoAttrOpen, setModalNuevoAttrOpen] = useState(false);

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));

            // Herencia desde especificaciones_set (EAV)
            const defaults: Record<number, string> = {};
            if (disp?.especificaciones_set) {
                disp.especificaciones_set.forEach((spec: any) => {
                    defaults[spec.atributo] = spec.valor;
                });
            }
            setValoresEAV(defaults);

            const idsSoportados = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => idsSoportados.includes(f.id)));
        } else {
            setValoresEAV({});
            setFuncionesDisponibles([]);
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
                tag_dispositivo: tag,
                atributos_set: atributosArray,
                funciones_usadas: funcionesUsadasIds,
            };

            const nueva = await crearInstancia(payload);
            onInstanciaCreada(nueva);

            setTag("");
            setValoresEAV({});
            setFuncionesUsadasIds([]);
            setCatalogoId("");
        } catch (err: any) {
            setError(err.message || "Error al anadir instancia.");
        } finally {
            setCargando(false);
        }
    };

    const funcionesFiltradas = funcionesDisponibles.filter((f) =>
        `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(busquedaFuncion.toLowerCase()),
    );

    const atributosFiltrados = atributosMaestros.filter((a) =>
        `${a.nombre} ${a.unidad || ""}`.toLowerCase().includes(busquedaAtributo.toLowerCase()),
    );

    const toggleFuncion = (id: number) => {
        setFuncionesUsadasIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const toggleAtributoVisible = (id: number) => {
        setValoresEAV((prev) => {
            const next = { ...prev };
            if (id in next) {
                delete next[id];
            } else {
                next[id] = "";
            }
            return next;
        });
    };

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
                <form id="single-form" className="grid gap-6 lg:grid-cols-3" onSubmit={handleSubmit}>
                    <div className="grid gap-2 lg:col-span-3">
                        <Label>Dispositivo del Catalogo</Label>
                        <div className="flex gap-2">
                            <Select value={catalogoId} onValueChange={setCatalogoId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Seleccionar Dispositivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogo.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.marca_nombre ? `${d.marca_nombre} - ` : ""} {d.modelo}
                                        </SelectItem>
                                    ))}
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

                    <div className="grid gap-2">
                        <Label>TAG del Dispositivo</Label>
                        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ej: REL-001" />
                    </div>

                    <div className="lg:col-span-2">
                        <div className="border rounded-lg bg-muted/20 p-4 space-y-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Label className="flex-1 text-sm font-semibold">Atributos disponibles</Label>
                                <Input
                                    placeholder="Buscar atributo..."
                                    value={busquedaAtributo}
                                    onChange={(e) => setBusquedaAtributo(e.target.value)}
                                    className="sm:max-w-xs"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="Crear nuevo atributo"
                                    onClick={() => setModalNuevoAttrOpen(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-md border bg-muted/40 p-3 max-h-64 overflow-y-auto space-y-1">
                                    {atributosFiltrados.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No hay atributos que coincidan.</p>
                                    ) : (
                                        atributosFiltrados.map((attr) => (
                                            <label
                                                key={attr.id}
                                                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-background text-sm"
                                            >
                                                <Checkbox
                                                    checked={attr.id in valoresEAV}
                                                    onCheckedChange={() => toggleAtributoVisible(attr.id)}
                                                />
                                                <span>
                                                    {attr.nombre}
                                                    {attr.unidad ? ` (${attr.unidad})` : ""}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>

                                <div className="grid gap-2 border rounded-md p-3 bg-background shadow-sm">
                                    <Label className="text-sm font-semibold">Valores seleccionados</Label>
                                    <DynamicAttributeForm
                                        todosLosAtributos={atributosMaestros}
                                        valores={valoresEAV}
                                        onChange={setValoresEAV}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2 lg:col-span-3">
                        <Label>Funciones a habilitar</Label>
                        <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-2 rounded-md border bg-muted/40 p-3">
                                <Input
                                    placeholder="Buscar funcion..."
                                    value={busquedaFuncion}
                                    onChange={(e) => setBusquedaFuncion(e.target.value)}
                                    disabled={!catalogoId || funcionesDisponibles.length === 0}
                                />
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {!catalogoId && (
                                        <p className="text-xs text-muted-foreground px-1">Selecciona un dispositivo.</p>
                                    )}
                                    {catalogoId && funcionesDisponibles.length === 0 && (
                                        <p className="text-xs text-muted-foreground px-1">No hay funciones soportadas.</p>
                                    )}
                                    {catalogoId &&
                                        funcionesFiltradas.map((f) => (
                                            <label
                                                key={f.id}
                                                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-background text-sm"
                                            >
                                                <Checkbox
                                                    checked={funcionesUsadasIds.includes(f.id)}
                                                    onCheckedChange={() => toggleFuncion(f.id)}
                                                />
                                                <span>
                                                    {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                                    {f.nombre}
                                                </span>
                                            </label>
                                        ))}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => onAbrirModalEditarFunciones(Number(catalogoId))}
                                disabled={!catalogoId}
                                title="Editar Soportadas en Catalogo"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
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
