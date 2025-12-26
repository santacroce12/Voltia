import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClienteList } from "../components/ClienteList";
import { ObraList } from "../components/ObraList";
import { ProjectList } from "../components/ProjectList";
import { listarObras, listarProyectos, listarClientes, type Obra, type Proyecto, type Cliente } from "../services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export function IngenieriaPage() {
    const navigate = useNavigate();
    const [obras, setObras] = useState<Obra[]>([]);
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([listarObras(), listarProyectos(), listarClientes()])
            .then(([listaObras, listaProyectos, listaClientes]) => {
                setObras(listaObras);
                setProyectos(listaProyectos);
                setClientes(listaClientes);
            })
            .catch(() => setError("No se pudieron cargar los datos."));
    }, []);

    const clienteNombreMap = useMemo(() => {
        const map: Record<number, string> = {};
        clientes.forEach((cliente) => {
            map[cliente.id] = cliente.nombre;
        });
        return map;
    }, [clientes]);

    const clientePorObra = useMemo(() => {
        const map: Record<number, string> = {};
        obras.forEach((obra) => {
            map[obra.id] = clienteNombreMap[obra.cliente] || `Cliente #${obra.cliente}`;
        });
        return map;
    }, [obras, clienteNombreMap]);

    const obrasFiltradas = useMemo(
        () => (clienteSeleccionado ? obras.filter((obra) => obra.cliente === clienteSeleccionado.id) : []),
        [obras, clienteSeleccionado],
    );

    const handleVolver = () => setObraSeleccionada(null);

    // Vista 1: Seleccionar Cliente
    if (!clienteSeleccionado) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Ingenieria</h2>
                    <p className="text-muted-foreground">Selecciona un cliente para empezar.</p>
                </div>
                {error ? (
                    <p className="text-destructive">{error}</p>
                ) : (
                    <ClienteList
                        clientes={clientes}
                        onClienteSeleccionado={(cliente) => {
                            setClienteSeleccionado(cliente);
                            setObraSeleccionada(null);
                        }}
                        mostrarSoloNombre
                    />
                )}
            </div>
        );
    }

    // Vista 2: Seleccionar Obra
    if (!obraSeleccionada) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setClienteSeleccionado(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <p className="text-sm text-muted-foreground">Cliente seleccionado</p>
                        <h2 className="text-2xl font-semibold">{clienteSeleccionado.nombre}</h2>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Obras del cliente</h3>
                    <p className="text-muted-foreground">Seleccione una obra para comenzar la carga de dispositivos.</p>
                </div>
                {error ? (
                    <p className="text-destructive">{error}</p>
                ) : obrasFiltradas.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                        No hay obras creadas para este cliente.
                    </div>
                ) : (
                    <ObraList obras={obrasFiltradas} onObraSeleccionada={setObraSeleccionada} clienteNombres={clienteNombreMap} />
                )}
            </div>
        );
    }

    // Vista 2: Seleccionar Proyecto
    const proyectosFiltrados = proyectos.filter((p) => p.obra === obraSeleccionada.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleVolver}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-semibold">Proyectos en {obraSeleccionada.nombre_obra}</h2>
                    <p className="text-sm text-muted-foreground">Seleccione un proyecto para gestionar sus dispositivos.</p>
                    <p className="text-sm text-muted-foreground">Cliente: {clienteSeleccionado.nombre}</p>
                </div>
            </div>
            
            <Separator />

            {proyectosFiltrados.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                    No hay proyectos creados en esta obra. Ve a la seccion "Proyectos" para crear uno.
                </div>
            ) : (
                // Usamos el linkPrefix para dirigir a la pagina de detalle de ingenieria
                <ProjectList
                    proyectos={proyectosFiltrados}
                    clientePorObra={clientePorObra}
                    onSelectProyecto={(proyecto) =>
                        navigate(
                            `/ingenieria/proyecto/${proyecto.id}?obra_nombre=${encodeURIComponent(
                                obraSeleccionada.nombre_obra,
                            )}&proyecto_nombre=${encodeURIComponent(proyecto.nombre_proyecto)}`,
                        )
                    }
                />
            )}
        </div>
    );
}
