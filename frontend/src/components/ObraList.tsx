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
  onExportarObra?: (obra: Obra) => void;
};

export function ObraList({
  obras,
  onObraSeleccionada,
  clienteNombres,
  onEditarObra,
  onExportarObra,
}: ObraListProps) {
  if (obras.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No hay obras cargadas.</div>;
  }
  const [filtro, setFiltro] = useState("");
  const filtradas = obras.filter((obra) =>
    obra.nombre_obra.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div className="space-y-3 rounded-2xl border bg-card/60 shadow-sm p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border bg-muted/60 px-3 py-1 text-xs font-semibold">
            Obras
            <span className="ml-2 inline-flex h-5 min-w-[24px] items-center justify-center rounded-full bg-primary/10 px-2 text-primary">
              {obras.length}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">Click en una fila para seleccionarla.</span>
        </div>
        <Input
          placeholder="Buscar obra..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-muted/30">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead className="w-1/4">Obra</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicacion</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Creada</TableHead>
              {onExportarObra && <TableHead className="text-right w-32">Exportar lista</TableHead>}
              {onEditarObra && <TableHead className="text-right w-16">Editar</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={(onExportarObra ? 1 : 0) + (onEditarObra ? 1 : 0) + 5}
                  className="text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((obra) => {
                const estadoChipClasses =
                  obra.estado_obra === "realizada"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : obra.estado_obra === "rechazada"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30";
                return (
                  <TableRow
                    key={obra.id}
                    className={onObraSeleccionada ? "cursor-pointer hover:bg-background/40" : undefined}
                    onClick={() => onObraSeleccionada?.(obra)}
                  >
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                        {obra.nombre_obra}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoChipClasses}`}
                      >
                        {obra.estado_obra}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{obra.ubicacion || "N/A"}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {clienteNombres?.[obra.cliente] || `Cliente #${obra.cliente}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(obra.fecha_creacion).toLocaleDateString()}
                    </TableCell>
                    {onExportarObra && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportarObra(obra);
                          }}
                          className="inline-flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l-2.5-2.5L9 9.25" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 11.75v-.5A2.25 2.25 0 016.25 9h5.5A2.25 2.25 0 0114 11.25v7a2.25 2.25 0 01-2.25 2.25h-5.5A2.25 2.25 0 014 18.25z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 9V4.75A1.75 1.75 0 0111.75 3h5A1.75 1.75 0 0118.5 4.75v7a1.75 1.75 0 01-1.75 1.75H14" />
                          </svg>
                          CSV
                        </Button>
                      </TableCell>
                    )}
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
                          className="hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
