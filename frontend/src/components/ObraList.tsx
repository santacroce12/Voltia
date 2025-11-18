import type { Obra } from "../services/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type ObraListProps = {
  obras: Obra[];
  onObraSeleccionada?: (obra: Obra) => void;
};

export function ObraList({ obras, onObraSeleccionada }: ObraListProps) {
  if (obras.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No hay obras cargadas.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {obras.map((obra) => (
        <Card key={obra.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{obra.nombre_obra}</CardTitle>
            <CardDescription>Cliente ID: {obra.cliente}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Estado:</span> {obra.estado_obra}
              </p>
              <p>
                <span className="font-medium">Ubicacion:</span> {obra.ubicacion || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">Creada por: {obra.usuario_creador}</p>
            </div>
          </CardContent>
          {onObraSeleccionada && (
            <CardFooter>
              <Button className="w-full" onClick={() => onObraSeleccionada(obra)}>
                Seleccionar Obra <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
