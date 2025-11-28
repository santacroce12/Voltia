import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    crearInstancia,
    type CatalogoDispositivo,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type FuncionDispositivo,
    type AtributoMaestro,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicAttributeForm } from "./DynamicAttributeForm";
import { Eye } from "lucide-react";
import { Modal } from "./Modal";

type Props = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    masterAtributos: AtributoMaestro[];
    onInstanciasCreadas: (instancias: InstanciaDispositivo[]) => void;
};

export function BatchInstanciaForm({
    proyectoId,
    catalogo,
    masterFunciones,
    masterAtributos,
    onInstanciasCreadas,
}: Props) {
    const [catalogoId, setCatalogoId] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [tagBase, setTagBase] = useState("DEV");
    const [valoresEAV, setValoresEAV] = useState<Record<number, string>>({});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [busquedaFuncion, setBusquedaFuncion] = useState("");
    const [viewOpen, setViewOpen] = useState(false);

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));
            const idsSoportados = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => idsSoportados.includes(f.id)));
        } else {
            setFuncionesDisponibles([]);
        }
        setFuncionesUsadasIds([]);
        setBusquedaFuncion("");
        setValoresEAV({});
    }, [catalogoId, catalogo, masterFunciones]);

    const funcionesFiltradas = useMemo(() => {
        const term = busquedaFuncion.trim().toLowerCase();
        return funcionesDisponibles.filter((f) =>
            `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(term),
        );
    }, [funcionesDisponibles, busquedaFuncion]);

    const toggleFuncion = (id: number) => {
        setFuncionesUsadasIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!catalogoId) return;

        setCargando(true);
        setError(null);

        const atributosArray = Object.entries(valoresEAV).map(([id, val]) => ({
            atributo: Number(id),
            valor: val,
        }));

        const promesas: Promise<InstanciaDispositivo>[] = [];

        for (let i = 0; i < cantidad; i++) {
            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                tag_dispositivo: `${tagBase}-${String(i + 1).padStart(3, "0")}`,
                atributos_set: atributosArray,
                funciones_usadas: funcionesUsadasIds,
            };
            promesas.push(crearInstancia(payload));
        }

        try {
            const nuevasInstancias = await Promise.all(promesas);
            onInstanciasCreadas(nuevasInstancias);
            setTagBase("DEV");
            setCantidad(1);
            setCatalogoId("");
            setFuncionesUsadasIds([]);
            setBusquedaFuncion("");
            setValoresEAV({});
        } catch (err: any) {
            setError("Error en la carga en lote: " + err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle className="text-base">Carga en Lote</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="batch-form" className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Dispositivo</Label>
                        <div className="flex gap-2">
                            <Select value={catalogoId} onValueChange={setCatalogoId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogo.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {(d as any).marca_nombre || `Marca #${d.marca}`} {d.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setViewOpen(true)}
                                disabled={!catalogoId}
                                title="Ver detalle del dispositivo"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Cantidad</Label>
                            <Input
                                type="number"
                                min="1"
                                max="50"
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>TAG Base</Label>
                            <Input value={tagBase} onChange={(e) => setTagBase(e.target.value)} placeholder="Ej: REL" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Funciones a habilitar (checkbox, sin Ctrl)</Label>
                        <div className="grid gap-2 rounded-md border bg-muted/40 p-3">
                            <Input
                                placeholder="Buscar por nombre o codigo..."
                                value={busquedaFuncion}
                                onChange={(e) => setBusquedaFuncion(e.target.value)}
                                disabled={!catalogoId || funcionesDisponibles.length === 0}
                            />
                            <div className="max-h-44 overflow-y-auto space-y-1">
                                {!catalogoId && (
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona un dispositivo para ver funciones.
                                    </p>
                                )}
                                {catalogoId && funcionesDisponibles.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Este dispositivo no tiene funciones soportadas.
                                    </p>
                                )}
                                {catalogoId &&
                                    funcionesDisponibles.length > 0 &&
                                    (funcionesFiltradas.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No hay coincidencias con el filtro.</p>
                                    ) : (
                                        funcionesFiltradas.map((f) => (
                                            <label
                                                key={f.id}
                                                className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-background"
                                            >
                                                <Checkbox
                                                    checked={funcionesUsadasIds.includes(f.id)}
                                                    onCheckedChange={() => toggleFuncion(f.id)}
                                                />
                                                <div className="leading-tight">
                                                    <div className="font-medium text-sm">
                                                        {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                                        {f.nombre}
                                                    </div>
                                                    {f.descripcion && (
                                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                                            {f.descripcion}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))
                                    ))}
                            </div>
                        </div>
                    </div>

                    {catalogoId && (
                        <div className="grid gap-2 border rounded-md p-3 bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    Atributos variables (comunes para el lote)
                                </Label>
                                <button
                                    type="button"
                                    className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 border border-primary/40 flex items-center justify-center"
                                    title="Aquí ASIGNAS UNA OBLIGACIÓN (Marcas un checkbox). Concepto: Son datos que CAMBIAN en cada instalación física. No puedes saberlos ahora porque dependen de la obra (la IP, el número de serie, la ubicación)."
                                >
                                    ?
                                </button>
                                <span className="text-[11px] text-muted-foreground">
                                    Solo los sugeridos por el dispositivo (puedes agregar extras abajo)
                                </span>
                            </div>
                            <DynamicAttributeForm
                                todosLosAtributos={masterAtributos}
                                sugeridosIds={(catalogo.find((d) => d.id === Number(catalogoId))?.atributos_sugeridos) || []}
                                valores={valoresEAV}
                                onChange={setValoresEAV}
                            />
                        </div>
                    )}
                </form>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="batch-form" variant="default" type="submit" disabled={cargando} className="w-full">
                    {cargando ? `Anadiendo...` : `Generar Lote (${cantidad})`}
                </Button>
            </CardFooter>

            <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Detalle de dispositivo">
                {catalogoId ? (
                    (() => {
                        const d = catalogo.find((x) => x.id === Number(catalogoId));
                        if (!d) return <p className="text-sm text-muted-foreground">No encontrado.</p>;
                        const funcs = masterFunciones.filter((f) => d.funciones_soportadas?.includes(f.id));
                        const especs = (d as any).especificaciones_set || [];
                        const attrs = d.atributos_sugeridos || [];
                        return (
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <p><strong>Marca:</strong> {(d as any).marca_nombre ?? d.marca}</p>
                                    <p><strong>Modelo:</strong> {d.modelo}</p>
                                    <p><strong>Nombre:</strong> {d.nombre_completo_producto}</p>
                                    <p><strong>Categoría:</strong> {(d as any).categoria_nombre ?? d.categoria}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Funciones soportadas</h4>
                                    {funcs.length ? (
                                        <ul className="list-disc pl-4 space-y-1">
                                            {funcs.map((f) => (
                                                <li key={f.id}>{f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}{f.nombre}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Sin funciones configuradas.</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold">Especificaciones fijas</h4>
                                    {especs.length ? (
                                        <ul className="list-disc pl-4 space-y-1">
                                            {especs.map((e: any) => (
                                                <li key={e.id}>
                                                    {e.nombre_atributo || `Atributo #${e.atributo}`}: {e.valor} {e.unidad_atributo || ""}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Sin especificaciones.</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold">Atributos variables (plantilla)</h4>
                                    {attrs.length ? (
                                        <ul className="list-disc pl-4 space-y-1">
                                            {attrs.map((id: number) => {
                                                const attr = masterAtributos.find((a) => a.id === id);
                                                return <li key={id}>{attr ? attr.nombre : `Atributo #${id}`}</li>;
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Sin atributos variables.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <p className="text-sm text-muted-foreground">Selecciona un dispositivo.</p>
                )}
            </Modal>
        </Card>
    );
}
