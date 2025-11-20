import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarInstancias,
    crearInstancia,
    listarCatalogoDispositivos,
    listarFunciones,
    listarProyectos,
    listarObras,
    listarClientes,
    borrarInstancia,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type Proyecto,
    type Obra,
    type Cliente,
} from "../services/api";
import { Modal } from "../components/Modal";
import { CatalogoFormModule } from "../components/CatalogoFormModule";
import { EditarFuncionesModal } from "../components/EditarFuncionesModal";
import { EstadisticasPanel } from "../components/EstadisticasPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Layers, Trash2 } from "lucide-react";

type InstanciaFormProps = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    onInstanciaCreada: (inst: InstanciaDispositivo) => void;
    onAbrirModalCatalogo: () => void;
    onAbrirModalEditarFunciones: (catalogoId: number) => void;
};

function InstanciaForm({
    proyectoId,
    catalogo,
    masterFunciones,
    onInstanciaCreada,
    onAbrirModalCatalogo,
    onAbrirModalEditarFunciones,
}: InstanciaFormProps) {
    const [catalogoId, setCatalogoId] = useState("");
    const [tag, setTag] = useState("");
    const [atributos, setAtributos] = useState("{}");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);
    const [busquedaFunciones, setBusquedaFunciones] = useState("");

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));
            const ids = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => ids.includes(f.id)));
        } else {
            setFuncionesDisponibles([]);
        }
        setFuncionesSeleccionadas([]);
        setBusquedaFunciones("");
    }, [catalogoId, catalogo, masterFunciones]);

    const funcionesFiltradas = useMemo(() => {
        const termino = busquedaFunciones.trim().toLowerCase();
        if (!termino) return funcionesDisponibles;
        return funcionesDisponibles.filter((f) => `${f.codigo_funcion ?? ""} ${f.nombre}`.toLowerCase().includes(termino));
    }, [busquedaFunciones, funcionesDisponibles]);

    const toggleFuncion = (id: number) => {
        setFuncionesSeleccionadas((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!catalogoId) return;
        setCargando(true);
        setError(null);
        try {
            JSON.parse(atributos);
            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                tag_dispositivo: tag || undefined,
                atributos,
                funciones_usadas: funcionesSeleccionadas,
            };
            const nueva = await crearInstancia(payload);
            onInstanciaCreada(nueva);
            setTag("");
            setAtributos("{}");
            setFuncionesSeleccionadas([]);
        } catch (err: any) {
            setError(err?.message || "Error al crear la instancia.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5" /> Carga Individual
                </CardTitle>
                <CardDescription>Registra un dispositivo puntual y define las funciones habilitadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="instancia-form" className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Dispositivo del catalogo</Label>
                        <div className="flex gap-2">
                            <Select value={catalogoId} onValueChange={setCatalogoId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Seleccionar dispositivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogo.map((disp) => (
                                        <SelectItem key={disp.id} value={String(disp.id)}>
                                            {disp.marca_nombre ? `${disp.marca_nombre} - ` : ""}
                                            {disp.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" onClick={onAbrirModalCatalogo}>
                                Nuevo
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={!catalogoId}
                                onClick={() => catalogoId && onAbrirModalEditarFunciones(Number(catalogoId))}
                            >
                                Funciones
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="instancia-tag">TAG (opcional)</Label>
                            <Input id="instancia-tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ej: SM-CCM-01" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="instancia-atributos">Atributos JSON</Label>
                            <Textarea
                                id="instancia-atributos"
                                value={atributos}
                                onChange={(e) => setAtributos(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Funciones habilitadas</Label>
                        <Input
                            placeholder="Buscar funcion..."
                            value={busquedaFunciones}
                            onChange={(e) => setBusquedaFunciones(e.target.value)}
                            disabled={!catalogoId}
                        />
                        <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
                            {!catalogoId ? (
                                <p className="text-center text-xs text-muted-foreground py-4">
                                    Selecciona un dispositivo para mostrar sus funciones disponibles.
                                </p>
                            ) : funcionesFiltradas.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-4">No hay coincidencias.</p>
                            ) : (
                                funcionesFiltradas.map((func) => (
                                    <label key={func.id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={funcionesSeleccionadas.includes(func.id)}
                                            onCheckedChange={() => toggleFuncion(func.id)}
                                        />
                                        <span>
                                            {func.codigo_funcion ? `[${func.codigo_funcion}] ` : ""}
                                            {func.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </form>
                {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="instancia-form" type="submit" disabled={cargando || !catalogoId}>
                    {cargando ? "Guardando..." : "Guardar instancia"}
                </Button>
            </CardFooter>
        </Card>
    );
}

type BatchFormProps = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    onInstanciasCreadas: (instancias: InstanciaDispositivo[]) => void;
};

function BatchForm({ proyectoId, catalogo, masterFunciones, onInstanciasCreadas }: BatchFormProps) {
    const [catalogoId, setCatalogoId] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [tagBase, setTagBase] = useState("DEV");
    const [cargando, setCargando] = useState(false);
    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);
    const [busquedaFunciones, setBusquedaFunciones] = useState("");

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));
            const ids = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => ids.includes(f.id)));
        } else {
            setFuncionesDisponibles([]);
        }
        setFuncionesSeleccionadas([]);
        setBusquedaFunciones("");
    }, [catalogoId, catalogo, masterFunciones]);

    const funcionesFiltradas = useMemo(() => {
        const termino = busquedaFunciones.trim().toLowerCase();
        if (!termino) return funcionesDisponibles;
        return funcionesDisponibles.filter((f) => `${f.codigo_funcion ?? ""} ${f.nombre}`.toLowerCase().includes(termino));
    }, [busquedaFunciones, funcionesDisponibles]);

    const toggleFuncion = (id: number) => {
        setFuncionesSeleccionadas((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!catalogoId || cantidad <= 0) return;
        setCargando(true);
        try {
            const promesas: Promise<InstanciaDispositivo>[] = [];
            for (let i = 0; i < cantidad; i++) {
                promesas.push(
                    crearInstancia({
                        proyecto: proyectoId,
                        catalogo: Number(catalogoId),
                        tag_dispositivo: `${tagBase}-${String(i + 1).padStart(2, "0")}`,
                        atributos: "{}",
                        funciones_usadas: funcionesSeleccionadas,
                    }),
                );
            }
            const nuevas = await Promise.all(promesas);
            onInstanciasCreadas(nuevas);
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Carga en lote</CardTitle>
                <CardDescription>Genera varias instancias repetidas con un mismo perfil.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="batch-form" className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Dispositivo</Label>
                        <Select value={catalogoId} onValueChange={setCatalogoId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {catalogo.map((disp) => (
                                    <SelectItem key={disp.id} value={String(disp.id)}>
                                        {disp.marca_nombre ? `${disp.marca_nombre} - ` : ""}
                                        {disp.modelo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Cantidad</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>TAG base</Label>
                            <Input value={tagBase} onChange={(e) => setTagBase(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Funciones a habilitar</Label>
                        <Input
                            placeholder="Buscar funcion..."
                            value={busquedaFunciones}
                            onChange={(e) => setBusquedaFunciones(e.target.value)}
                            disabled={!catalogoId}
                        />
                        <div className="max-h-40 overflow-y-auto rounded-md border p-3 space-y-2">
                            {!catalogoId ? (
                                <p className="text-center text-xs text-muted-foreground py-4">
                                    Selecciona un dispositivo para listar sus funciones.
                                </p>
                            ) : funcionesFiltradas.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-4">Sin coincidencias.</p>
                            ) : (
                                funcionesFiltradas.map((func) => (
                                    <label key={func.id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={funcionesSeleccionadas.includes(func.id)}
                                            onCheckedChange={() => toggleFuncion(func.id)}
                                        />
                                        <span>
                                            {func.codigo_funcion ? `[${func.codigo_funcion}] ` : ""}
                                            {func.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button form="batch-form" type="submit" disabled={cargando || !catalogoId}>
                    {cargando ? "Generando..." : "Crear lote"}
                </Button>
            </CardFooter>
        </Card>
    );
}

type SortableField = "tag" | "marca" | "categoria" | "subcategoria";

type InstanciaListProps = {
    instancias: InstanciaDispositivo[];
    seleccionados: number[];
    onSeleccionCambiada: (id: number, checked: boolean) => void;
    onToggleTodos: (checked: boolean) => void;
    onDelete: (id: number) => Promise<void>;
    deletingId: number | null;
    busquedaNombre: string;
    sortConfig: { field: SortableField; direction: "asc" | "desc" };
    onSortChange: (field: SortableField) => void;
};

function InstanciaList({
    instancias,
    seleccionados,
    onSeleccionCambiada,
    onToggleTodos,
    onDelete,
    deletingId,
    busquedaNombre,
    sortConfig,
    onSortChange,
}: InstanciaListProps) {
    const allSelected = instancias.length > 0 && seleccionados.length === instancias.length;
    const isIndeterminate = seleccionados.length > 0 && !allSelected;

    const renderCheckboxState = isIndeterminate ? "indeterminate" : allSelected;

    const normalizar = (valor: string) => valor?.toLowerCase() ?? "";

    const filtradas = useMemo(() => {
        const termino = busquedaNombre.trim().toLowerCase();
        if (!termino) return instancias;
        return instancias.filter((inst) => {
            const nombre = inst.nombre_dispositivo || "";
            return nombre.toLowerCase().includes(termino);
        });
    }, [busquedaNombre, instancias]);

    const ordenadas = useMemo(() => {
        const copia = [...filtradas];
        const obtenerCampo = (inst: InstanciaDispositivo) => {
            switch (sortConfig.field) {
                case "tag":
                    return inst.tag_dispositivo || `Sin TAG #${inst.id}`;
                case "marca":
                    return inst.marca_dispositivo || "";
                case "categoria":
                    return inst.categoria_dispositivo || "";
                case "subcategoria":
                    return inst.subcategoria_dispositivo || "";
                default:
                    return "";
            }
        };
        copia.sort((a, b) => {
            const valA = normalizar(obtenerCampo(a));
            const valB = normalizar(obtenerCampo(b));
            const comparacion = valA.localeCompare(valB);
            return sortConfig.direction === "asc" ? comparacion : -comparacion;
        });
        return copia;
    }, [filtradas, sortConfig]);

    const renderIndicator = (field: SortableField) =>
        sortConfig.field === field ? <span className="ml-1 text-xs">{sortConfig.direction === "asc" ? "^" : "v"}</span> : null;

    return (
        <Card className="shadow">
            <CardHeader>
                <CardTitle className="text-lg">Dispositivos en el proyecto</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={renderCheckboxState as boolean | "indeterminate"}
                                        onCheckedChange={(checked) => onToggleTodos(Boolean(checked))}
                                    />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => onSortChange("tag")}
                                >
                                    TAG {renderIndicator("tag")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => onSortChange("marca")}
                                >
                                    Marca y modelo {renderIndicator("marca")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => onSortChange("categoria")}
                                >
                                    Categoria {renderIndicator("categoria")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => onSortChange("subcategoria")}
                                >
                                    Subcategoria {renderIndicator("subcategoria")}
                                </TableHead>
                                <TableHead className="text-center">Funciones usadas</TableHead>
                                <TableHead className="text-center">Accion</TableHead>
                            </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ordenadas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                                    No hay dispositivos cargados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            ordenadas.map((inst) => {
                                const displayNombre = inst.nombre_dispositivo || `Catalogo ${inst.catalogo}`;
                                const displayMarca = inst.marca_dispositivo || "Sin marca";
                                const displayCategoria = inst.categoria_dispositivo || "Sin categoria";
                                const displaySubcategoria = inst.subcategoria_dispositivo || "Sin subcategoria";
                                return (
                                    <TableRow key={inst.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={seleccionados.includes(inst.id)}
                                                onCheckedChange={(checked) => onSeleccionCambiada(inst.id, Boolean(checked))}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono font-medium">
                                            {inst.tag_dispositivo || `Sin TAG #${inst.id}`}
                                        </TableCell>
                                        <TableCell>
                                            {displayNombre}
                                            <div className="text-xs text-muted-foreground">{displayMarca}</div>
                                        </TableCell>
                                        <TableCell>{displayCategoria}</TableCell>
                                        <TableCell>{displaySubcategoria}</TableCell>
                                        <TableCell className="text-center">{inst.funciones_usadas.length}</TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(inst.id)}
                                                disabled={deletingId === inst.id}
                                                title="Borrar instancia"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function IngenieriaDetallePage() {
    const { proyectoId } = useParams<{ proyectoId: string }>();
    const pid = Number(proyectoId);
    const [instancias, setInstancias] = useState<InstanciaDispositivo[]>([]);
    const [catalogo, setCatalogo] = useState<CatalogoDispositivo[]>([]);
    const [masterFunciones, setMasterFunciones] = useState<FuncionDispositivo[]>([]);
    const [modalCat, setModalCat] = useState(false);
    const [modalFunc, setModalFunc] = useState(false);
    const [catalogoIdSel, setCatalogoIdSel] = useState<number | null>(null);
    const [proyectoActual, setProyectoActual] = useState<Proyecto | null>(null);
    const [obraActual, setObraActual] = useState<Obra | null>(null);
    const [clienteActual, setClienteActual] = useState<Cliente | null>(null);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [batchDeleting, setBatchDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [busquedaNombre, setBusquedaNombre] = useState("");
    const [sortConfig, setSortConfig] = useState<{ field: SortableField; direction: "asc" | "desc" }>({
        field: "marca",
        direction: "asc",
    });

    useEffect(() => {
        if (!pid) return;
        Promise.all([
            listarInstancias(pid),
            listarCatalogoDispositivos(),
            listarFunciones(),
            listarProyectos(),
            listarObras(),
            listarClientes(),
        ])
            .then(([insts, catalogoData, funciones, proyectos, obras, clientes]) => {
                setInstancias(insts);
                setCatalogo(catalogoData);
                setMasterFunciones(funciones);
                const proyectoInfo = (proyectos as Proyecto[]).find((p) => p.id === pid) || null;
                setProyectoActual(proyectoInfo || null);
                let obraInfo: Obra | null = null;
                if (proyectoInfo) {
                    obraInfo = (obras as Obra[]).find((o) => o.id === proyectoInfo.obra) || null;
                }
                setObraActual(obraInfo);
                if (obraInfo) {
                    const clienteInfo = (clientes as Cliente[]).find((cl) => cl.id === obraInfo!.cliente) || null;
                    setClienteActual(clienteInfo || null);
                } else {
                    setClienteActual(null);
                }
            })
            .catch(console.error);
    }, [pid]);

    useEffect(() => {
        setSeleccionados((prev) => prev.filter((id) => instancias.some((inst) => inst.id === id)));
    }, [instancias]);

    const handleOpenFuncModal = (id: number) => {
        setCatalogoIdSel(id);
        setModalFunc(true);
    };

    const headerText = proyectoActual
        ? `Ingenieria / ${
              clienteActual ? clienteActual.nombre : obraActual ? `Cliente #${obraActual.cliente}` : "Cliente"
          } / ${obraActual ? obraActual.nombre_obra : `Obra #${proyectoActual.obra}`} / Proyecto ${
              proyectoActual.nombre_proyecto
          }`
        : "Carga de Dispositivos";

    const handleInstanciaCreada = (nueva: InstanciaDispositivo) => {
        setInstancias((prev) => [nueva, ...prev]);
    };

    const handleInstanciasCreadas = (nuevas: InstanciaDispositivo[]) => {
        setInstancias((prev) => [...nuevas, ...prev]);
    };

    const handleSeleccionCambiada = (id: number, checked: boolean) => {
        setSeleccionados((prev) => {
            if (checked) {
                if (prev.includes(id)) return prev;
                return [...prev, id];
            }
            return prev.filter((item) => item !== id);
        });
    };

    const handleToggleTodos = (checked: boolean) => {
        setSeleccionados(checked ? instancias.map((i) => i.id) : []);
    };

    const handleSingleDelete = async (id: number) => {
        const inst = instancias.find((i) => i.id === id);
        if (!inst) return;
        if (!confirm(`¿Seguro que quieres borrar ${inst.tag_dispositivo || `la instancia #${id}`}?`)) return;
        setDeletingId(id);
        try {
            await borrarInstancia(id);
            setInstancias((prev) => prev.filter((i) => i.id !== id));
            setSeleccionados((prev) => prev.filter((sel) => sel !== id));
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleBatchDelete = async () => {
        if (seleccionados.length === 0) return;
        if (!confirm(`¿Seguro que quieres borrar ${seleccionados.length} dispositivos seleccionados?`)) return;
        setBatchDeleting(true);
        try {
            await Promise.all(seleccionados.map((id) => borrarInstancia(id)));
            setInstancias((prev) => prev.filter((inst) => !seleccionados.includes(inst.id)));
            setSeleccionados([]);
        } catch (err) {
            console.error(err);
        } finally {
            setBatchDeleting(false);
        }
    };

    const handleHeaderSort = (field: SortableField) => {
        setSortConfig((prev) => {
            if (prev.field === field) {
                return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { field, direction: "asc" };
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/ingenieria">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold tracking-tight">{headerText}</h2>
            </div>

            <InstanciaForm
                proyectoId={pid}
                catalogo={catalogo}
                masterFunciones={masterFunciones}
                onInstanciaCreada={handleInstanciaCreada}
                onAbrirModalCatalogo={() => setModalCat(true)}
                onAbrirModalEditarFunciones={handleOpenFuncModal}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <BatchForm
                        proyectoId={pid}
                        catalogo={catalogo}
                        masterFunciones={masterFunciones}
                        onInstanciasCreadas={handleInstanciasCreadas}
                    />

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <h3 className="text-lg font-semibold">Dispositivos cargados</h3>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Input
                                placeholder="Buscar por nombre..."
                                value={busquedaNombre}
                                onChange={(e) => setBusquedaNombre(e.target.value)}
                                className="md:w-48"
                            />
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={seleccionados.length === 0 || batchDeleting}
                                onClick={handleBatchDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Borrar lote ({seleccionados.length})
                            </Button>
                        </div>
                    </div>
                    <InstanciaList
                        instancias={instancias}
                        seleccionados={seleccionados}
                        onSeleccionCambiada={handleSeleccionCambiada}
                        onToggleTodos={handleToggleTodos}
                        onDelete={handleSingleDelete}
                        deletingId={deletingId}
                        busquedaNombre={busquedaNombre}
                        sortConfig={sortConfig}
                        onSortChange={handleHeaderSort}
                    />
                </div>

                <EstadisticasPanel instancias={instancias} />
            </div>

            <Modal isOpen={modalCat} onClose={() => setModalCat(false)} title="Nuevo dispositivo del catalogo">
                <CatalogoFormModule
                    onDispositivoCreado={(disp) => {
                        setCatalogo((prev) => [disp, ...prev]);
                        setModalCat(false);
                    }}
                />
            </Modal>

            <EditarFuncionesModal
                isOpen={modalFunc}
                onClose={() => setModalFunc(false)}
                dispositivo={catalogo.find((d) => d.id === catalogoIdSel) || null}
                masterFunciones={masterFunciones}
                onUpdateExitoso={(updated) => {
                    setCatalogo((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
                }}
            />
        </div>
    );
}
