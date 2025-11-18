/**
 * ClientesPage.tsx
 * Refactorizada para usar shadcn/ui
 */
import { useEffect, useState, type FormEvent } from "react";
import {
  listarClientes,
  crearCliente,
  type Cliente,
  type ClientePayload,
} from "../services/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function ClienteForm({ onClienteCreado }: { onClienteCreado: (cliente: Cliente) => void }) {
  const [nombre, setNombre] = useState("");
  const [cuil, setCuil] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const payload: ClientePayload = { nombre, cuil, direccion, notas };
    try {
      const nuevoCliente = await crearCliente(payload);
      onClienteCreado(nuevoCliente);
      setNombre("");
      setCuil("");
      setDireccion("");
      setNotas("");
    } catch {
      setError("Error al crear el cliente. Revisa los datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Cliente</CardTitle>
        <CardDescription>Registra un cliente para asociarlo a obras y proyectos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="cliente-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="cli-nombre">Nombre / Razon Social *</Label>
            <Input id="cli-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cli-cuil">CUIL / CUIT *</Label>
            <Input id="cli-cuil" value={cuil} onChange={(e) => setCuil(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cli-dir">Direccion (Opcional)</Label>
            <Input id="cli-dir" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cli-notas">Notas / Comentarios</Label>
            <Input id="cli-notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
        </form>
        {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button form="cliente-form" type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Guardar Cliente"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ClienteList({ clientes }: { clientes: Cliente[] }) {
  if (clientes.length === 0) {
    return <p className="text-center text-muted-foreground">No hay clientes cargados.</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clientes.map((cliente) => (
        <Card key={cliente.id}>
          <CardHeader>
            <CardTitle>{cliente.nombre}</CardTitle>
            <CardDescription>ID #{cliente.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">CUIT: {cliente.cuil}</p>
            {cliente.direccion && <p className="text-sm text-muted-foreground">Dir: {cliente.direccion}</p>}
            {cliente.notas && <p className="text-xs text-muted-foreground mt-1">Notas: {cliente.notas}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarClientes()
      .then(setClientes)
      .catch(() => setError("No se pudieron cargar los clientes."));
  }, []);

  const handleClienteCreado = (cliente: Cliente) => {
    setClientes((prev) => [cliente, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6">
      <ClienteForm onClienteCreado={handleClienteCreado} />
      <Separator />
      <div>
        <h2 className="text-2xl font-semibold">Clientes existentes</h2>
        <p className="text-sm text-muted-foreground">Gestiona tus clientes desde un panel profesional.</p>
      </div>
      {error ? <p className="text-destructive">{error}</p> : <ClienteList clientes={clientes} />}
    </div>
  );
}
