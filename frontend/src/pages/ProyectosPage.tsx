import { useEffect, useState } from "react";
import { ProjectList } from "../components/ProjectList";
import { ProyectoForm } from "../components/ProyectoForm";
import { ObraList } from "../components/ObraList";
import { listarProyectos, listarObras, type Proyecto, type Obra } from "../services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
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

  const handleProyectoCreado = (nuevoProyecto: Proyecto) => {
    setProyectos((prev) => [nuevoProyecto, ...prev]);
  };

  if (!obraSeleccionada) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">Seleccione una obra para gestionar sus proyectos.</p>
        </div>
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <ObraList obras={obras} onObraSeleccionada={setObraSeleccionada} />
        )}
      </div>
    );
  }

  const proyectosFiltrados = proyectos.filter((p) => p.obra === obraSeleccionada.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setObraSeleccionada(null)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Proyectos en {obraSeleccionada.nombre_obra}
        </h2>
      </div>

      <ProyectoForm obra={obraSeleccionada} onProyectoCreado={handleProyectoCreado} />

      <Separator className="my-6" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Listado de Proyectos</h3>
        <ProjectList proyectos={proyectosFiltrados} />
      </div>
    </div>
  );
}
