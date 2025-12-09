import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ObraList } from "../components/ObraList";
import { ProyectoForm } from "../components/ProyectoForm";
import { ProjectList } from "../components/ProjectList";
import { CloningModal } from "@/components/CloningModal";
import {
    listarProyectos,
    listarObras,
    actualizarProyecto,
    listarInstancias,
    type Proyecto,
    type Obra,
    type InstanciaDispositivo,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProyectosPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [obras, setObras] = useState<Obra[]>([]);
    const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [proyectoAClonar, setProyectoAClonar] = useState<Proyecto | null>(null);
    const [todasLasObras, setTodasLasObras] = useState<Obra[]>([]);
    const [editOpen, setEditOpen] = useState(false);
    const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);
    const [editNombre, setEditNombre] = useState("");
    const [editTipo, setEditTipo] = useState("proteccion");
    const [editEstado, setEditEstado] = useState("proceso");
    const [editUbicacion, setEditUbicacion] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [proyectoDetalle, setProyectoDetalle] = useState<Proyecto | null>(null);
    const [instanciasDetalle, setInstanciasDetalle] = useState<InstanciaDispositivo[]>([]);
    const [loadingInstancias, setLoadingInstancias] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([listarObras(), listarProyectos()])
            .then(([listaObras, listaProyectos]) => {
                setObras(listaObras);
                setProyectos(listaProyectos);
                setTodasLasObras(listaObras);
            })
            .catch(() => setError("No se pudieron cargar los datos."));
    }, []);

    useEffect(() => {
        // Al cambiar la obra limpiamos cualquier proyecto seleccionado para evitar confusiones
        setProyectoDetalle(null);
        setInstanciasDetalle([]);
        setLoadingInstancias(false);
    }, [obraSeleccionada]);

    const handleProyectoCreado = (nuevoProyecto: Proyecto) => {
        setProyectos((prev) => [nuevoProyecto, ...prev]);
    };

    const handleClonacionExitosa = (nuevoProyecto: Proyecto) => {
        setProyectos((prev) => [nuevoProyecto, ...prev]);
        setModalAbierto(false);
    };

    const cargarInstanciasProyecto = (proyecto: Proyecto) => {
        setProyectoDetalle(proyecto);
        setLoadingInstancias(true);
        listarInstancias(proyecto.id)
            .then(setInstanciasDetalle)
            .catch(() => setInstanciasDetalle([]))
            .finally(() => setLoadingInstancias(false));
    };

    const iniciarClonacion = (proyecto: Proyecto) => {
        setProyectoAClonar(proyecto);
        setModalAbierto(true);
    };

    const abrirEditorProyecto = (proyecto: Proyecto) => {
        setProyectoEditando(proyecto);
        setEditNombre(proyecto.nombre_proyecto);
        setEditTipo(proyecto.tipo);
        setEditEstado(proyecto.estado_proyecto);
        setEditUbicacion(proyecto.ubicacion_fisica || "");
        setEditError(null);
        setEditOpen(true);
    };

    const handleEditarProyecto = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!proyectoEditando) return;
        setEditLoading(true);
        setEditError(null);
        try {
            const actualizado = await actualizarProyecto(proyectoEditando.id, {
                nombre_proyecto: editNombre,
                tipo: editTipo,
                estado_proyecto: editEstado,
                ubicacion_fisica: editUbicacion,
                obra: proyectoEditando.obra,
            });
            setProyectos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
            setEditOpen(false);
        } catch (err: any) {
            setEditError(err.message || "No se pudo actualizar el proyecto.");
        } finally {
            setEditLoading(false);
        }
    };

    const proyectosFiltrados = useMemo(
        () => (obraSeleccionada ? proyectos.filter((p) => p.obra === obraSeleccionada.id) : []),
        [proyectos, obraSeleccionada],
    );

    if (!obraSeleccionada) {
        return (
            <div className="max-w-6xl space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
                    <p className="text-muted-foreground">Seleccione una obra para gestionar sus proyectos.</p>
                </div>
                {error ? <p className="text-destructive">{error}</p> : <ObraList obras={obras} onObraSeleccionada={setObraSeleccionada} />}
            </div>
        );
    }

    return (
        <div className="max-w-6xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setObraSeleccionada(null)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <p className="text-sm text-muted-foreground">Obra seleccionada</p>
                    <h2 className="text-2xl font-semibold tracking-tight">{obraSeleccionada.nombre_obra}</h2>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Crear nuevo proyecto en</p>
                    <h3 className="text-xl font-semibold">{obraSeleccionada.nombre_obra}</h3>
                </div>
                <ProyectoForm obra={obraSeleccionada} onProyectoCreado={handleProyectoCreado} />
            </div>

            <Separator />

            <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Listado de Proyectos</h3>
                        <p className="text-sm text-muted-foreground">
                            Administra, clona o navega a la ingeniería de cada proyecto.
                        </p>
                    </div>
                </div>
                <ProjectList
                    proyectos={proyectosFiltrados}
                    onClonarProyecto={iniciarClonacion}
                    onEditarProyecto={abrirEditorProyecto}
                    onSelectProyecto={cargarInstanciasProyecto}
                    onServiciosPlanos={(proy) => navigate(`/proyecto/${proy.id}`)}
                />
                {proyectosFiltrados.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No hay proyectos. Crea uno arriba.</p>
                )}
            </div>

            {proyectoDetalle && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Proyecto seleccionado</p>
                            <h3 className="text-xl font-semibold">{proyectoDetalle.nombre_proyecto}</h3>
                            <p className="text-sm text-muted-foreground">Tipo: {proyectoDetalle.tipo} · Estado: {proyectoDetalle.estado_proyecto}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => iniciarClonacion(proyectoDetalle)}>
                                Clonar
                            </Button>
                            <Button variant="default" onClick={() => navigate(`/proyecto/${proyectoDetalle.id}`)}>
                                Servicios / Planos
                            </Button>
                            <Button variant="outline" onClick={() => setProyectoDetalle(null)}>
                                Ocultar
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="text-lg font-semibold">Dispositivos del proyecto</h4>
                        {loadingInstancias ? (
                            <p className="text-sm text-muted-foreground">Cargando dispositivos...</p>
                        ) : instanciasDetalle.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay dispositivos cargados.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-left">
                                        <tr>
                                            <th className="px-3 py-2">ID</th>
                                            <th className="px-3 py-2">Modelo</th>
                                            <th className="px-3 py-2">Marca</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {instanciasDetalle.map((inst) => (
                                            <tr key={inst.id} className="hover:bg-muted/30">
                                                <td className="px-3 py-2 font-mono text-xs">{`ID-${inst.id}`}</td>
                                                <td className="px-3 py-2">{inst.nombre_dispositivo || "Sin modelo"}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{inst.marca_dispositivo || "Sin marca"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Tip: abre Ingenieria para editar o agregar dispositivos.</p>
                    </div>
                </div>
            )}

            <CloningModal
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                sourceProject={proyectoAClonar}
                allObras={todasLasObras.filter((o) => o.id !== obraSeleccionada.id)}
                onCloneExitoso={handleClonacionExitosa}
            />

            <Dialog open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : setEditOpen(false))}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>
                            {proyectoEditando ? `Editar proyecto: ${proyectoEditando.nombre_proyecto}` : "Editar proyecto"}
                        </DialogTitle>
                        <DialogDescription>Actualiza la información básica del proyecto.</DialogDescription>
                    </DialogHeader>
                    {proyectoEditando && (
                        <form className="space-y-4" onSubmit={handleEditarProyecto}>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombre">Nombre</Label>
                                <Input
                                    id="edit-nombre"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipo</Label>
                                <Select value={editTipo} onValueChange={setEditTipo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proteccion">Protección</SelectItem>
                                        <SelectItem value="control">Control</SelectItem>
                                        <SelectItem value="medicion">Medición</SelectItem>
                                        <SelectItem value="comunicacion">Comunicación</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Estado</Label>
                                <Select value={editEstado} onValueChange={setEditEstado}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proceso">En proceso</SelectItem>
                                        <SelectItem value="realizado">Realizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-ubicacion">Ubicación física</Label>
                                <Input
                                    id="edit-ubicacion"
                                    value={editUbicacion}
                                    onChange={(e) => setEditUbicacion(e.target.value)}
                                    placeholder="Ej: Sala de tableros"
                                />
                            </div>
                            {editError && <p className="text-sm text-destructive">{editError}</p>}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={editLoading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editLoading}>
                                    {editLoading ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
