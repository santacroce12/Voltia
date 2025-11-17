/**
 * Componente presentacional para mostrar un listado de Obras.
 * Refactorizado para usar shadcn/ui Card.
 */
import type { Obra } from "../services/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ObraListProps = {
  obras: Obra[];
  onObraSeleccionado?: (obra: Obra) => void;
};

export function ObraList({ obras, onObraSeleccionado }: ObraListProps) {
  if (obras.length === 0) {
    return <p className="text-center text-muted-foreground">No hay obras cargadas.</p>;
  }

  const isClickable = Boolean(onObraSeleccionado);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {obras.map((obra) => (
        <Card
          key={obra.id}
          className={cn(
            isClickable && "cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md",
          )}
          onClick={() => onObraSeleccionado?.(obra)}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={(e) => (isClickable && e.key === "Enter" ? onObraSeleccionado?.(obra) : null)}
        >
          <CardHeader>
            <CardTitle>{obra.nombre_obra}</CardTitle>
            <CardDescription>Cliente ID: {obra.cliente}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Estado: {obra.estado_obra}</p>
            <p className="text-sm">
              Ubicación: {obra.ubicacion?.length ? obra.ubicacion : "No especificada"}
            </p>
            <small className="text-xs text-muted-foreground">Creada por: {obra.usuario_creador}</small>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
