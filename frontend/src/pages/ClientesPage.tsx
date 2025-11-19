/**
 * ClientesPage.tsx
 * Refactorizada para usar shadcn/ui
 */
import { useEffect, useState, type FormEvent } from "react";
import {
  listarClientes,
  crearCliente,
  actualizarCliente,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

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

function ClienteList({
  clientes,
  onEdit,
}: {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
}) {
  if (clientes.length === 0) {
    return <p className="text-center text-muted-foreground">No hay clientes cargados.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>CUIT</TableHead>
            <TableHead>Direccion</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Editar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nombre}</TableCell>
              <TableCell>{cliente.cuil}</TableCell>
              <TableCell>{cliente.direccion || "-"}</TableCell>
              <TableCell className="max-w-[250px] truncate">{cliente.notas || "-"}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" type="button" onClick={() => onEdit(cliente)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editCuil, setEditCuil] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editNotas, setEditNotas] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    listarClientes()
      .then(setClientes)
      .catch(() => setError("No se pudieron cargar los clientes."));
  }, []);

  const handleClienteCreado = (cliente: Cliente) => {
    setClientes((prev) => [cliente, ...prev]);
  };

  const abrirEditor = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setEditCuil(cliente.cuil || "");
    setEditDireccion(cliente.direccion || "");
    setEditNotas(cliente.notas || "");
    setEditError(null);
    setEditOpen(true);
  };

  const cerrarEditor = () => {
    setEditOpen(false);
    setClienteEditando(null);
    setEditError(null);
  };

  const handleEditarSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clienteEditando) {
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const actualizado = await actualizarCliente(clienteEditando.id, {
        cuil: editCuil,
        direccion: editDireccion,
        notas: editNotas,
      });
      setClientes((prev) => prev.map((c) => (c.id === actualizado.id ? actualizado : c)));
      cerrarEditor();
    } catch (e) {
      console.error(e);
      setEditError("No se pudo actualizar el cliente.");
    } finally {
      setEditLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(filtroNombre.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <ClienteForm onClienteCreado={handleClienteCreado} />
      <Separator />
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Clientes existentes</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus clientes desde un panel profesional.</p>
        </div>
        <Input
          placeholder="Buscar por nombre..."
          className="w-full md:w-64"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <ClienteList clientes={clientesFiltrados} onEdit={abrirEditor} />
      )}

      <Dialog open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : cerrarEditor())}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {clienteEditando ? `Editar cliente: ${clienteEditando.nombre}` : "Editar cliente"}
            </DialogTitle>
            <DialogDescription>Actualiza CUIL, direccion y notas del cliente.</DialogDescription>
          </DialogHeader>
          {clienteEditando && (
            <form className="space-y-4" onSubmit={handleEditarSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="edit-nombre">Nombre / Razon Social</Label>
                <Input id="edit-nombre" value={clienteEditando.nombre} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cuil">CUIL / CUIT</Label>
                <Input
                  id="edit-cuil"
                  value={editCuil}
                  onChange={(e) => setEditCuil(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-direccion">Direccion</Label>
                <Input
                  id="edit-direccion"
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notas">Notas</Label>
                <Textarea
                  id="edit-notas"
                  value={editNotas}
                  onChange={(e) => setEditNotas(e.target.value)}
                  rows={4}
                />
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={cerrarEditor} disabled={editLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
