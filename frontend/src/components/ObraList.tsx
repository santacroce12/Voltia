import { useState } from "react";
import type { Obra } from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

type ObraListProps = {
  obras: Obra[];
  onObraSeleccionada?: (obra: Obra) => void;
  clienteNombres?: Record<number, string>;
  onEditarObra?: (obra: Obra) => void;
};

export function ObraList({
  obras,
  onObraSeleccionada,
  clienteNombres,
  onEditarObra,
}: ObraListProps) {
  if (obras.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No hay obras cargadas.</div>;
  }
  const [filtro, setFiltro] = useState("");
  const filtradas = obras.filter((obra) =>
    obra.nombre_obra.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar obra..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm"
      />
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Obra</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicacion</TableHead>
              <TableHead>Cliente</TableHead>
              {onEditarObra && <TableHead className="text-right">Editar</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onEditarObra ? 5 : 4} className="text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((obra) => (
                <TableRow
                  key={obra.id}
                  className={onObraSeleccionada ? "cursor-pointer hover:bg-muted/50" : undefined}
                  onClick={() => onObraSeleccionada?.(obra)}
                >
                  <TableCell className="font-medium">{obra.nombre_obra}</TableCell>
                  <TableCell>{obra.estado_obra}</TableCell>
                  <TableCell>{obra.ubicacion || "N/A"}</TableCell>
                  <TableCell>{clienteNombres?.[obra.cliente] || `Cliente #${obra.cliente}`}</TableCell>
                  {onEditarObra && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarObra(obra);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
