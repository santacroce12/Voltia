import { useState, useEffect, type FormEvent } from "react";
import {
    crearInstancia,
    type InstanciaDispositivo,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type InstanciaPayload,
    listarAtributosMaestros,
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

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));
            const idsSoportados = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => idsSoportados.includes(f.id)));
        } else {
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
    const sugeridos = selectedCatalogo?.atributos_sugeridos || [];
    const funcionesDelCatalogo = selectedCatalogo
        ? masterFunciones.filter((f) => selectedCatalogo.funciones_soportadas?.includes(f.id))
        : [];
    const atributosSugeridos = selectedCatalogo?.atributos_sugeridos || [];
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
            setError(err.message || "Error al añadir instancia.");
        } finally {
            setCargando(false);
        }
    };

    const funcionesFiltradas = funcionesDisponibles.filter((f) =>
        `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(busquedaFuncion.toLowerCase()),
    );

    const toggleFuncion = (id: number) => {
        setFuncionesUsadasIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5" /> Carga Individual (1 a 1)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form id="single-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="grid gap-2 md:col-span-2">
                        <Label>Dispositivo del Catálogo</Label>
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
                                title="Crear Nuevo en Catálogo"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>TAG del Dispositivo</Label>
                        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ej: REL-001" />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Label>Atributos Variables (Plantilla para instancias)</Label>
                                <button
                                    type="button"
                                    className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 border border-primary/40 flex items-center justify-center"
                                    title="Aquí ASIGNAS UNA OBLIGACIÓN (Marcas un checkbox). Concepto: Son datos que CAMBIAN en cada instalación física. No puedes saberlos ahora porque dependen de la obra (la IP, el número de serie, la ubicación)."
                                    onClick={() =>
                                        alert(
                                            "Aquí ASIGNAS UNA OBLIGACIÓN (Marcas un checkbox).\nConcepto: Son datos que CAMBIAN en cada instalación física. No puedes saberlos ahora porque dependen de la obra (la IP, el número de serie, la ubicación)."
                                        )
                                    }
                                >
                                    ?
                                </button>
                            </div>
                            <DynamicAttributeForm
                                todosLosAtributos={atributosMaestros}
                                sugeridosIds={sugeridos}
                                valores={valoresEAV}
                                onChange={setValoresEAV}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <Label>Funciones a habilitar</Label>
                        <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-2 rounded-md border bg-muted/40 p-3">
                                <Input
                                    placeholder="Buscar función..."
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
                                title="Editar Soportadas en Catálogo"
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
                    {cargando ? "Añadiendo..." : "Añadir Instancia"}
                </Button>
            </CardFooter>

            <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Detalle de dispositivo">
                {selectedCatalogo ? (
                    <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <p><strong>Marca:</strong> {(selectedCatalogo as any).marca_nombre ?? selectedCatalogo.marca}</p>
                            <p><strong>Modelo:</strong> {selectedCatalogo.modelo}</p>
                            <p><strong>Nombre:</strong> {selectedCatalogo.nombre_completo_producto}</p>
                            <p><strong>Categoría:</strong> {(selectedCatalogo as any).categoria_nombre ?? selectedCatalogo.categoria}</p>
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
                        <div>
                            <h4 className="font-semibold">Atributos variables (plantilla)</h4>
                            {atributosSugeridos.length ? (
                                <ul className="list-disc pl-4 space-y-1">
                                    {atributosSugeridos.map((id) => {
                                        const attr = masterAtributos.find((a) => a.id === id);
                                        return <li key={id}>{attr ? attr.nombre : `Atributo #${id}`}</li>;
                                    })}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-xs">Sin atributos variables configurados.</p>
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
