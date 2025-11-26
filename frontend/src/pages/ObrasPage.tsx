import { useEffect, useState, useMemo, type FormEvent } from "react";
import { ObraList } from "../components/ObraList";
import { ObraForm } from "../components/ObraForm";
import { ClienteList } from "../components/ClienteList";
import {
  listarObras,
  listarClientes,
  actualizarObra,
  type Obra,
  type Cliente,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [obraEditando, setObraEditando] = useState<Obra | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editUbicacion, setEditUbicacion] = useState("");
  const [editEstado, setEditEstado] = useState("pendiente");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    listarClientes()
      .then(setClientes)
      .catch(() => setError("No se pudieron cargar los clientes."));
  }, []);

  useEffect(() => {
    if (!clienteSeleccionado) {
      setObras([]);
      return;
    }
    setCargando(true);
    setError(null);
    listarObras(clienteSeleccionado.id)
      .then(setObras)
      .catch(() => setError("No se pudieron cargar las obras de este cliente."))
      .finally(() => setCargando(false));
  }, [clienteSeleccionado]);

  const handleObraCreada = (obra: Obra) => {
    setObras((prev) => [obra, ...prev]);
  };

  const abrirEditorObra = (obra: Obra) => {
    setObraEditando(obra);
    setEditNombre(obra.nombre_obra);
    setEditUbicacion(obra.ubicacion || "");
    setEditEstado(obra.estado_obra || "pendiente");
    setEditError(null);
    setEditOpen(true);
  };

  const cerrarEditorObra = () => {
    setEditOpen(false);
    setObraEditando(null);
    setEditError(null);
  };

  const handleEditarObra = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!obraEditando) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const actualizada = await actualizarObra(obraEditando.id, {
        nombre_obra: editNombre,
        ubicacion: editUbicacion,
        estado_obra: editEstado,
        cliente: obraEditando.cliente,
      });
      setObras((prev) => prev.map((o) => (o.id === actualizada.id ? actualizada : o)));
      cerrarEditorObra();
    } catch (err) {
      console.error(err);
      setEditError("No se pudo actualizar la obra.");
    } finally {
      setEditLoading(false);
    }
  };

  const clienteNombreMap = useMemo(() => {
    const map: Record<number, string> = {};
    clientes.forEach((c) => {
      map[c.id] = c.nombre;
    });
    return map;
  }, [clientes]);

  if (!clienteSeleccionado) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Gestion de Obras</h2>
          <p className="text-muted-foreground">Paso 1: Selecciona un cliente para ver sus obras.</p>
        </div>
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <ClienteList
            clientes={clientes}
            onClienteSeleccionado={setClienteSeleccionado}
            mostrarSoloNombre
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClienteSeleccionado(null)}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Button>
        </div>

        <ObraForm cliente={clienteSeleccionado} onObraCreada={handleObraCreada} />

        <Separator />

        <div>
          <h2 className="text-2xl font-semibold">Obras en {clienteSeleccionado.nombre}</h2>
          {cargando ? (
            <p>Cargando obras...</p>
          ) : (
            <ObraList
              obras={obras}
              clienteNombres={clienteNombreMap}
              onEditarObra={abrirEditorObra}
              onExportarObra={(obra) =>
                (window.location.href = `${
                  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"
                }/obras/${obra.id}/exportar-materiales/`)
              }
            />
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : cerrarEditorObra())}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {obraEditando ? `Editar obra: ${obraEditando.nombre_obra}` : "Editar obra"}
            </DialogTitle>
            <DialogDescription>Actualiza los datos principales de la obra.</DialogDescription>
          </DialogHeader>
          {obraEditando && (
            <form className="space-y-4" onSubmit={handleEditarObra}>
              <div className="grid gap-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ubicacion">Ubicacion</Label>
                <Input
                  id="edit-ubicacion"
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={editEstado} onValueChange={setEditEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={cerrarEditorObra} disabled={editLoading}>
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
    </>
  );
}
