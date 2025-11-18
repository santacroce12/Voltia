/**
 * Componente presentacional para mostrar un listado de proyectos.
 * Refactorizado para usar shadcn/ui.
 */
import { Link } from "react-router-dom";
import type { Proyecto } from "../services/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type ProyectoListProps = {
  proyectos: Proyecto[];
  linkPrefix?: string;
};

export function ProjectList({ proyectos, linkPrefix = "/proyecto" }: ProyectoListProps) {
  if (proyectos.length === 0) {
    return <p className="text-center text-muted-foreground">Todavia no hay proyectos registrados.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proyectos.map((proyecto) => (
        <Link
          to={`${linkPrefix}/${proyecto.id}`}
          key={proyecto.id}
          className="block transition-all hover:-translate-y-1"
        >
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>{proyecto.nombre_proyecto}</CardTitle>
              <CardDescription>
                Creado el {new Date(proyecto.fecha_creacion).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Tipo:</span> {proyecto.tipo}
                </p>
                <p>
                  <span className="font-semibold">Estado:</span> {proyecto.estado_proyecto}
                </p>
                <p>
                  <span className="font-semibold">Ubicacion:</span> {proyecto.ubicacion_fisica || "N/A"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Por: {proyecto.usuario_creador}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
