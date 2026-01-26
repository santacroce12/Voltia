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
import { Eye, Plus } from "lucide-react";
import { Modal } from "./Modal";

 type Props = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    masterAtributos: AtributoMaestro[];
    onInstanciasCreadas: (instancias: InstanciaDispositivo[]) => void;
    onAbrirModalCatalogo?: () => void;
};

export function BatchInstanciaForm({
    proyectoId,
    catalogo,
    masterFunciones,
    masterAtributos,
    onInstanciasCreadas,
    onAbrirModalCatalogo,
}: Props) {
    const [catalogoId, setCatalogoId] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [valoresEAV, setValoresEAV] = useState<Record<number, string>>({});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [precioReal, setPrecioReal] = useState("");

    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [busquedaFuncion, setBusquedaFuncion] = useState("");
    const [viewOpen, setViewOpen] = useState(false);

    const [busquedaCatalogo, setBusquedaCatalogo] = useState("");
    const [filtroMarca, setFiltroMarca] = useState<string>("all");
    const [filtroCategoria, setFiltroCategoria] = useState<string>("all");

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));
            const defaults: Record<number, string> = {};
            if ((disp as any)?.especificaciones_set) {
                (disp as any).especificaciones_set.forEach((spec: any) => {
                    defaults[spec.atributo] = spec.valor;
                });
            }
            setValoresEAV(defaults);
            const idsSoportados = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => idsSoportados.includes(f.id)));
            const precioBase = disp?.precio_actual ?? disp?.precio_historico ?? "";
            setPrecioReal(precioBase !== "" && precioBase !== null && precioBase !== undefined ? String(precioBase) : "");
        } else {
            setFuncionesDisponibles([]);
            setValoresEAV({});
            setPrecioReal("");
        }
        setFuncionesUsadasIds([]);
        setBusquedaFuncion("");
    }, [catalogoId, catalogo, masterFunciones]);

    const funcionesFiltradas = useMemo(() => {
        const term = busquedaFuncion.trim().toLowerCase();
        return funcionesDisponibles.filter((f) =>
            `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(term),
        );
    }, [funcionesDisponibles, busquedaFuncion]);

    const catalogoFiltrado = useMemo(() => {
        const term = busquedaCatalogo.trim().toLowerCase();
        return catalogo.filter((d) => {
            const texto = `${d.nombre_completo_producto} ${d.modelo} ${(d as any).marca_nombre || ""} ${(d as any).categoria_nombre || ""}`.toLowerCase();
            const coincideTexto = term ? texto.includes(term) : true;
            const coincideMarca = filtroMarca !== "all" ? String(d.marca) === filtroMarca : true;
            const coincideCategoria = filtroCategoria !== "all" ? String(d.categoria) === filtroCategoria : true;
            return coincideTexto && coincideMarca && coincideCategoria;
        });
    }, [busquedaCatalogo, filtroMarca, filtroCategoria, catalogo]);

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
                atributos_set: atributosArray,
                funciones_usadas: funcionesUsadasIds,
                precio_real:
                    precioReal.trim() !== ""
                        ? Number(precioReal)
                        : Number.isFinite(precioFallback)
                          ? Number(precioFallback)
                          : 0,
            };
            promesas.push(crearInstancia(payload));
        }

        try {
            const nuevasInstancias = await Promise.all(promesas);
            onInstanciasCreadas(nuevasInstancias);
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

    const selectedCatalogo = catalogo.find((d) => d.id === Number(catalogoId));
    const funcionesModal = selectedCatalogo
        ? masterFunciones.filter((f) => selectedCatalogo.funciones_soportadas?.includes(f.id))
        : [];
    const especificacionesSet = (selectedCatalogo as any)?.especificaciones_set || [];
    const precioReferencia = selectedCatalogo?.precio_historico ?? null;
    const precioFallback = selectedCatalogo?.precio_actual ?? selectedCatalogo?.precio_historico ?? 0;

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle className="text-base">Carga en Lote</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="batch-form" className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Dispositivo del Catalogo</Label>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Input
                                    placeholder="Filtrar por modelo"
                                    value={busquedaCatalogo}
                                    onChange={(e) => setBusquedaCatalogo(e.target.value)}
                                    className="h-9"
                                />
                                <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Todas las marcas" />
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
                                        <SelectValue placeholder="Todas las categorías" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Categorías</SelectItem>
                                        {[
                                            ...new Set(
                                                catalogo.map((d) => (d.categoria ? String(d.categoria) : null)).filter(Boolean),
                                            ),
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

                            <div className="flex gap-2">
                                <Select value={catalogoId} onValueChange={setCatalogoId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {catalogoFiltrado.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {(d as any).marca_nombre || `Marca #${d.marca}`} {d.modelo}
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
                                    disabled={!catalogoId}
                                    title="Ver detalle del dispositivo"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                {onAbrirModalCatalogo && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={onAbrirModalCatalogo}
                                        title="Crear dispositivo en catálogo"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

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

                    <div className="grid gap-2">
                        <Label>Funciones a habilitar</Label>
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

                    <div className="grid gap-2 border rounded-md p-3 bg-muted/30">
                        <Label className="text-xs font-semibold text-muted-foreground">
                            Atributos comunes para el lote
                        </Label>
                        <DynamicAttributeForm
                            todosLosAtributos={masterAtributos}
                            valores={valoresEAV}
                            onChange={setValoresEAV}
                        />
                    </div>
                </form>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="batch-form" variant="default" type="submit" disabled={cargando} className="w-full">
                    {cargando ? `Anadiendo...` : `Generar Lote (${cantidad})`}
                </Button>
            </CardFooter>

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
                            {funcionesModal.length ? (
                                <ul className="list-disc pl-4 space-y-1">
                                    {funcionesModal.map((f) => (
                                        <li key={f.id}>{f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}{f.nombre}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-muted-foreground">Sin funciones configuradas.</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold">Especificaciones</h4>
                            {especificacionesSet && especificacionesSet.length ? (
                                <ul className="list-disc pl-4 space-y-1">
                                    {especificacionesSet.map((e: any) => (
                                        <li key={e.id}>
                                            {e.nombre_atributo || `Atributo #${e.atributo}`}: {e.valor} {e.unidad_atributo || ""}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-muted-foreground">Sin especificaciones.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Selecciona un dispositivo.</p>
                )}
            </Modal>
        </Card>
    );
}
