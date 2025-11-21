import { useEffect, useState } from "react";
import { ObraList } from "../components/ObraList";
import { ProyectoForm } from "../components/ProyectoForm";
import { ProjectList } from "../components/ProjectList";
import { CloningModal } from "@/components/CloningModal";
import { listarProyectos, listarObras, type Proyecto, type Obra } from "../services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy } from "lucide-react";

export function ProyectosPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [obras, setObras] = useState<Obra[]>([]);
    const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [proyectoAClonar, setProyectoAClonar] = useState<Proyecto | null>(null);
    const [todasLasObras, setTodasLasObras] = useState<Obra[]>([]);

    useEffect(() => {
        Promise.all([listarObras(), listarProyectos()])
            .then(([listaObras, listaProyectos]) => {
                setObras(listaObras);
                setProyectos(listaProyectos);
                setTodasLasObras(listaObras);
            })
            .catch(() => setError("No se pudieron cargar los datos."));
    }, []);

    const handleProyectoCreado = (nuevoProyecto: Proyecto) => {
        setProyectos((prev) => [nuevoProyecto, ...prev]);
    };

    const handleClonacionExitosa = (nuevoProyecto: Proyecto) => {
        setProyectos((prev) => [nuevoProyecto, ...prev]);
        setModalAbierto(false);
    };

    const iniciarClonacion = (proyecto: Proyecto) => {
        setProyectoAClonar(proyecto);
        setModalAbierto(true);
    };

    if (!obraSeleccionada) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
                    <p className="text-muted-foreground">Seleccione una obra para gestionar sus proyectos.</p>
                </div>
                {error ? <p className="text-destructive">{error}</p> : <ObraList obras={obras} onObraSeleccionada={setObraSeleccionada} />}
            </div>
        );
    }

    const proyectosFiltrados = proyectos.filter((p) => p.obra === obraSeleccionada.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setObraSeleccionada(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-semibold tracking-tight">Proyectos en {obraSeleccionada.nombre_obra}</h2>
                </div>
            </div>

            <ProyectoForm obra={obraSeleccionada} onProyectoCreado={handleProyectoCreado} />

            <Separator className="my-6" />

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Listado de Proyectos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {proyectosFiltrados.map((proyecto) => (
                        <div key={proyecto.id} className="relative">
                            <ProjectList proyectos={[proyecto]} />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                                onClick={() => iniciarClonacion(proyecto)}
                                title="Clonar Proyecto"
                            >
                                <Copy className="h-4 w-4 mr-1" /> Clonar
                            </Button>
                        </div>
                    ))}
                    {proyectosFiltrados.length === 0 && (
                        <p className="col-span-3 text-center text-muted-foreground py-8">No hay proyectos. Cree uno arriba.</p>
                    )}
                </div>
            </div>

            <CloningModal
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                sourceProject={proyectoAClonar}
                allObras={todasLasObras.filter((o) => o.id !== obraSeleccionada.id)}
                onCloneExitoso={handleClonacionExitosa}
            />
        </div>
    );
}
