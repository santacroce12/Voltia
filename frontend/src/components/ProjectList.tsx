/**
 * Componente presentacional para mostrar un listado de proyectos.
 * Refactorizado para usar shadcn/ui.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Proyecto } from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, FileText, Copy } from "lucide-react";

type ProyectoListProps = {
  proyectos: Proyecto[];
  linkPrefix?: string;
  clientePorObra?: Record<number, string>;
  onEditarProyecto?: (proyecto: Proyecto) => void;
  onGestionProyecto?: (proyecto: Proyecto) => void;
  onClonarProyecto?: (proyecto: Proyecto) => void;
};

export function ProjectList({
  proyectos,
  linkPrefix = "/proyecto",
  clientePorObra,
  onEditarProyecto,
  onGestionProyecto,
  onClonarProyecto,
}: ProyectoListProps) {
  if (proyectos.length === 0) {
    return <p className="text-center text-muted-foreground">Todavia no hay proyectos registrados.</p>;
  }
  const [filtro, setFiltro] = useState("");
  const filtrados = proyectos.filter((proyecto) =>
    proyecto.nombre_proyecto.toLowerCase().includes(filtro.toLowerCase()),
  );
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar proyecto..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm"
      />
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Ubicacion</TableHead>
            <TableHead>Creado</TableHead>
            {(onEditarProyecto || onGestionProyecto || onClonarProyecto) && (
              <TableHead className="text-right">Acciones</TableHead>
            )}
          </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6 + (onEditarProyecto || onGestionProyecto || onClonarProyecto ? 1 : 0)}
                  className="text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((proyecto) => (
                <TableRow
                  key={proyecto.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`${linkPrefix}/${proyecto.id}`)}
                >
                  <TableCell className="font-medium">{proyecto.nombre_proyecto}</TableCell>
                  <TableCell>{clientePorObra?.[proyecto.obra] || `Cliente #${proyecto.obra}`}</TableCell>
                  <TableCell>{proyecto.tipo}</TableCell>
                  <TableCell>{proyecto.estado_proyecto}</TableCell>
                  <TableCell>{proyecto.ubicacion_fisica || "N/A"}</TableCell>
                  <TableCell>{new Date(proyecto.fecha_creacion).toLocaleDateString()}</TableCell>
                  {(onEditarProyecto || onGestionProyecto || onClonarProyecto) && (
                    <TableCell className="text-right space-x-1">
                      {onClonarProyecto && (
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClonarProyecto(proyecto);
                          }}
                          className="inline-flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Clonar
                        </Button>
                      )}
                      {onGestionProyecto && (
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGestionProyecto(proyecto);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      {onEditarProyecto && (
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditarProyecto(proyecto);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
