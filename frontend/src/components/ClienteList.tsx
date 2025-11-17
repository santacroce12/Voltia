/**
 * Componente presentacional para mostrar un listado de Clientes.
 * Refactorizado para usar shadcn/ui Card.
 */
import type { Cliente } from "../services/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type ClienteListProps = {
  clientes: Cliente[];
  onClienteSeleccionado: (cliente: Cliente) => void;
};

export function ClienteList({ clientes, onClienteSeleccionado }: ClienteListProps) {
  if (clientes.length === 0) {
    return <p className="text-center text-muted-foreground">No hay clientes cargados.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clientes.map((cliente) => (
        <Card
          key={cliente.id}
          className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
          onClick={() => onClienteSeleccionado(cliente)}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" ? onClienteSeleccionado(cliente) : null)}
        >
          <CardHeader>
            <CardTitle>{cliente.nombre}</CardTitle>
            <CardDescription>ID: {cliente.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">CUIT: {cliente.cuil}</p>
            {cliente.direccion && (
              <p className="text-xs text-muted-foreground">Dir: {cliente.direccion}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
