/**
 * Componente presentacional para mostrar un listado de Clientes.
 * Refactorizado para usar shadcn/ui Card.
 */
import { useState } from "react";
import type { Cliente } from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type ClienteListProps = {
  clientes: Cliente[];
  onClienteSeleccionado: (cliente: Cliente) => void;
  mostrarSoloNombre?: boolean;
};

export function ClienteList({
  clientes,
  onClienteSeleccionado,
  mostrarSoloNombre = false,
}: ClienteListProps) {
  if (clientes.length === 0) {
    return <p className="text-center text-muted-foreground">No hay clientes cargados.</p>;
  }
  const [filtro, setFiltro] = useState("");
  const filtrados = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar cliente..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm"
      />
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              {!mostrarSoloNombre && (
                <>
                  <TableHead>CUIT</TableHead>
                  <TableHead>Direccion</TableHead>
                  <TableHead className="text-right">Editar</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={mostrarSoloNombre ? 1 : 4}
                  className="text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onClienteSeleccionado(cliente)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" ? onClienteSeleccionado(cliente) : null)}
                >
                  <TableCell className="font-medium">{cliente.nombre}</TableCell>
                  {!mostrarSoloNombre && (
                    <>
                      <TableCell>{cliente.cuil}</TableCell>
                      <TableCell>{cliente.direccion || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
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
