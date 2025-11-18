import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarInstancias,
    crearInstancia,
    listarCatalogoDispositivos,
    listarFunciones,
    listarProyectos,
    listarObras,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type Proyecto,
    type Obra,
} from "../services/api";
import { Modal } from "../components/Modal";
import { CatalogoFormModule } from "../components/CatalogoFormModule";
import { EditarFuncionesModal } from "../components/EditarFuncionesModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Edit2, Layers } from "lucide-react";

function InstanciaForm({ proyectoId, catalogo, masterFunciones, onInstanciaCreada, onAbrirModalCatalogo, onAbrirModalEditarFunciones }: any) {
    const [catalogoId, setCatalogoId] = useState("");
    const [tag, setTag] = useState("");
    const [atributos, setAtributos] = useState("{}");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [busquedaFunciones, setBusquedaFunciones] = useState("");

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d: CatalogoDispositivo) => d.id === Number(catalogoId));
            const ids = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f: FuncionDispositivo) => ids.includes(f.id)));
        } else {
            setFuncionesDisponibles([]);
        }
        setFuncionesUsadasIds([]);
        setBusquedaFunciones("");
    }, [catalogoId, catalogo, masterFunciones]);

    const funcionesFiltradas = useMemo(() => {
        const termino = busquedaFunciones.trim().toLowerCase();
        if (!termino) return funcionesDisponibles;
        return funcionesDisponibles.filter((f) => `${f.codigo_funcion ?? ""} ${f.nombre}`.toLowerCase().includes(termino));
    }, [busquedaFunciones, funcionesDisponibles]);

    const toggleFuncion = (id: number) => {
        setFuncionesUsadasIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!catalogoId) return;
        setCargando(true);
        setError(null);
        try {
            JSON.parse(atributos);
            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                tag_dispositivo: tag,
                atributos,
                funciones_usadas: funcionesUsadasIds,
            };
            const nueva = await crearInstancia(payload);
            onInstanciaCreada(nueva);
            setTag("");
            setAtributos("{}");
            setFuncionesUsadasIds([]);
        } catch (err: any) {
            setError(err.message || "Error al anadir.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card className="border-l-4 border-l-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" /> Carga Individual
                </CardTitle>
                <CardDescription>Anadir un unico dispositivo al proyecto.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="single-form" className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Dispositivo del Catalogo</Label>
                        <div className="flex gap-2">
                            <Select value={catalogoId} onValueChange={setCatalogoId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogo.map((d: CatalogoDispositivo) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.marca_nombre} {d.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="icon" onClick={onAbrirModalCatalogo} title="Crear Nuevo">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Funciones a Habilitar</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                placeholder="Buscar funcion..."
                                value={busquedaFunciones}
                                onChange={(e) => setBusquedaFunciones(e.target.value)}
                                disabled={!catalogoId}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => catalogoId && onAbrirModalEditarFunciones(Number(catalogoId))}
                                disabled={!catalogoId}
                                title="Editar soportadas"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
                            {!catalogoId ? (
                                <p className="text-center text-xs text-muted-foreground py-4">Seleccione un dispositivo para ver sus funciones.</p>
                            ) : funcionesFiltradas.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-4">No hay coincidencias.</p>
                            ) : (
                                funcionesFiltradas.map((f) => (
                                    <label key={f.id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={funcionesUsadasIds.includes(f.id)}
                                            onCheckedChange={() => toggleFuncion(f.id)}
                                        />
                                        <span className="cursor-pointer select-none">
                                            {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                            {f.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>TAG</Label>
                            <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ej: REL-001" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Atributos (JSON)</Label>
                            <Textarea value={atributos} onChange={(e) => setAtributos(e.target.value)} rows={1} className="font-mono text-xs" />
                        </div>
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="single-form" type="submit" disabled={cargando} className="w-full">
                    Anadir Instancia
                </Button>
            </CardFooter>
        </Card>
    );
}

function BatchForm({ proyectoId, catalogo, masterFunciones, onInstanciasCreadas }: any) {
    const [catalogoId, setCatalogoId] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [tagBase, setTagBase] = useState("DEV");
    const [cargando, setCargando] = useState(false);
    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);
    const [busquedaFunciones, setBusquedaFunciones] = useState("");

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d: CatalogoDispositivo) => d.id === Number(catalogoId));
            const ids = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f: FuncionDispositivo) => ids.includes(f.id)));
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!catalogoId) return;
        setCargando(true);
        const promesas = [];
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
        try {
            const res = await Promise.all(promesas);
            onInstanciasCreadas(res);
        } catch (e) {
            console.error(e);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Carga en Lote</CardTitle>
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
                                {catalogo.map((d: CatalogoDispositivo) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.modelo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Cantidad</Label>
                            <Input type="number" min="1" max="50" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
                        </div>
                        <div className="grid gap-2">
                            <Label>TAG Base</Label>
                            <Input value={tagBase} onChange={(e) => setTagBase(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Funciones a Habilitar</Label>
                        <Input
                            placeholder="Buscar funcion..."
                            value={busquedaFunciones}
                            onChange={(e) => setBusquedaFunciones(e.target.value)}
                            disabled={!catalogoId}
                        />
                        <div className="max-h-40 overflow-y-auto rounded-md border p-3 space-y-2">
                            {!catalogoId ? (
                                <p className="text-center text-xs text-muted-foreground py-4">Seleccione un dispositivo para ver sus funciones.</p>
                            ) : funcionesFiltradas.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-4">No hay coincidencias.</p>
                            ) : (
                                funcionesFiltradas.map((f) => (
                                    <label key={f.id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={funcionesSeleccionadas.includes(f.id)}
                                            onCheckedChange={() => toggleFuncion(f.id)}
                                        />
                                        <span className="cursor-pointer select-none">
                                            {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                            {f.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button form="batch-form" variant="secondary" type="submit" disabled={cargando} className="w-full">
                    Generar Lote
                </Button>
            </CardFooter>
        </Card>
    );
}

function InstanciaList({ instancias }: { instancias: InstanciaDispositivo[] }) {
    if (instancias.length === 0) return <div className="text-center text-muted-foreground py-8 col-span-full">No hay dispositivos cargados.</div>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 col-span-full">
            {instancias.map((i) => (
                <Card key={i.id} className="overflow-hidden">
                    <div className="bg-muted/40 p-3 border-b flex justify-between items-center">
                        <span className="font-mono font-bold text-primary">{i.tag_dispositivo || `#${i.id}`}</span>
                        <span className="text-xs text-muted-foreground">ID: {i.id}</span>
                    </div>
                    <CardContent className="p-3 text-sm space-y-1">
                        <p>
                            <span className="font-medium">Catalogo ID:</span> {i.catalogo}
                        </p>
                        <p>
                            <span className="font-medium">Funciones:</span> {i.funciones_usadas.length}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function IngenieriaDetallePage() {
    const { proyectoId } = useParams();
    const pid = Number(proyectoId);
    const [instancias, setInstancias] = useState<InstanciaDispositivo[]>([]);
    const [catalogo, setCatalogo] = useState<CatalogoDispositivo[]>([]);
    const [masterFunciones, setMasterFunciones] = useState<FuncionDispositivo[]>([]);
    const [modalCat, setModalCat] = useState(false);
    const [modalFunc, setModalFunc] = useState(false);
    const [catalogoIdSel, setCatalogoIdSel] = useState<number | null>(null);
    const [proyectoActual, setProyectoActual] = useState<Proyecto | null>(null);
    const [obraActual, setObraActual] = useState<Obra | null>(null);

    useEffect(() => {
        if (!pid) return;
        Promise.all([
            listarInstancias(pid),
            listarCatalogoDispositivos(),
            listarFunciones(),
            listarProyectos(),
            listarObras(),
        ])
            .then(([i, c, f, proyectos, obras]) => {
                setInstancias(i);
                setCatalogo(c);
                setMasterFunciones(f);
                const proyectoInfo = proyectos.find((p) => p.id === pid) || null;
                setProyectoActual(proyectoInfo || null);
                if (proyectoInfo) {
                    const obraInfo = obras.find((o) => o.id === proyectoInfo.obra) || null;
                    setObraActual(obraInfo || null);
                } else {
                    setObraActual(null);
                }
            })
            .catch(console.error);
    }, [pid]);

    const handleOpenFuncModal = (id: number) => {
        setCatalogoIdSel(id);
        setModalFunc(true);
    };

    const headerText = proyectoActual
        ? `Ingenieria / ${obraActual ? obraActual.nombre_obra : `Obra #${proyectoActual.obra}`} / Proyecto ${proyectoActual.nombre_proyecto}`
        : "Carga de Dispositivos";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/ingenieria">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold">{headerText}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <InstanciaForm
                        proyectoId={pid}
                        catalogo={catalogo}
                        masterFunciones={masterFunciones}
                        onInstanciaCreada={(i: InstanciaDispositivo) => setInstancias([i, ...instancias])}
                        onAbrirModalCatalogo={() => setModalCat(true)}
                        onAbrirModalEditarFunciones={handleOpenFuncModal}
                    />

                    <h3 className="text-lg font-semibold mt-8">Dispositivos Cargados</h3>
                    <InstanciaList instancias={instancias} />
                </div>

                <div className="space-y-6">
                    <BatchForm
                        proyectoId={pid}
                        catalogo={catalogo}
                        masterFunciones={masterFunciones}
                        onInstanciasCreadas={(nuevas: InstanciaDispositivo[]) => setInstancias([...nuevas, ...instancias])}
                    />
                </div>
            </div>

            <Modal isOpen={modalCat} onClose={() => setModalCat(false)} title="Nuevo Dispositivo de Catalogo">
                <CatalogoFormModule
                    onDispositivoCreado={(d) => {
                        setCatalogo([d, ...catalogo]);
                        setModalCat(false);
                    }}
                />
            </Modal>

            <EditarFuncionesModal
                isOpen={modalFunc}
                onClose={() => setModalFunc(false)}
                dispositivo={catalogo.find((d) => d.id === catalogoIdSel) || null}
                masterFunciones={masterFunciones}
                onUpdateExitoso={(d) => {
                    setCatalogo((prev) => prev.map((x) => (x.id === d.id ? d : x)));
                }}
            />
        </div>
    );
}

