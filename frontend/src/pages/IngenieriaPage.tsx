import { useEffect, useState } from "react";
import { ObraList } from "../components/ObraList";
import { ProjectList } from "../components/ProjectList";
import { listarObras, listarProyectos, type Obra, type Proyecto } from "../services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export function IngenieriaPage() {
    const [obras, setObras] = useState<Obra[]>([]);
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([listarObras(), listarProyectos()])
            .then(([listaObras, listaProyectos]) => {
                setObras(listaObras);
                setProyectos(listaProyectos);
            })
            .catch(() => setError("No se pudieron cargar los datos."));
    }, []);

    const handleVolver = () => setObraSeleccionada(null);

    // Vista 1: Seleccionar Obra
    if (!obraSeleccionada) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Ingenieria</h2>
                    <p className="text-muted-foreground">Seleccione una obra para comenzar la carga de dispositivos.</p>
                </div>
                {error ? <p className="text-destructive">{error}</p> : (
                    <ObraList obras={obras} onObraSeleccionada={setObraSeleccionada} />
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
                </div>
            </div>
            
            <Separator />

            {proyectosFiltrados.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                    No hay proyectos creados en esta obra. Ve a la seccion "Proyectos" para crear uno.
                </div>
            ) : (
                // Usamos el linkPrefix para dirigir a la pagina de detalle de ingenieria
                <ProjectList proyectos={proyectosFiltrados} linkPrefix="/ingenieria/proyecto" />
            )}
        </div>
    );
}
