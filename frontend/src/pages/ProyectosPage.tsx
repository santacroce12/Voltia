import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ProjectList } from "../components/ProjectList";
import { ProyectoForm } from "../components/ProyectoForm";
import { ObraList } from "../components/ObraList";
import {
  listarProyectos,
  listarObras,
  listarClientes,
  actualizarProyecto,
  type Proyecto,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState("proteccion");
  const [editEstado, setEditEstado] = useState("proceso");
  const [editUbicacion, setEditUbicacion] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([listarObras(), listarProyectos(), listarClientes()])
      .then(([listaObras, listaProyectos, listaClientes]) => {
        setObras(listaObras);
        setProyectos(listaProyectos);
        setClientes(listaClientes);
      })
      .catch(() => setError("No se pudieron cargar los datos."));
  }, []);

  const handleProyectoCreado = (nuevoProyecto: Proyecto) => {
    setProyectos((prev) => [nuevoProyecto, ...prev]);
  };

  const abrirEditorProyecto = (proyecto: Proyecto) => {
    setProyectoEditando(proyecto);
    setEditNombre(proyecto.nombre_proyecto);
    setEditTipo(proyecto.tipo);
    setEditEstado(proyecto.estado_proyecto);
    setEditUbicacion(proyecto.ubicacion_fisica || "");
    setEditError(null);
    setEditOpen(true);
  };

  const cerrarEditorProyecto = () => {
    setEditOpen(false);
    setProyectoEditando(null);
    setEditError(null);
  };

  const handleEditarProyecto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!proyectoEditando) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const actualizado = await actualizarProyecto(proyectoEditando.id, {
        nombre_proyecto: editNombre,
        tipo: editTipo,
        estado_proyecto: editEstado,
        ubicacion_fisica: editUbicacion,
        obra: proyectoEditando.obra,
      });
      setProyectos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      cerrarEditorProyecto();
    } catch (err) {
      console.error(err);
      setEditError("No se pudo actualizar el proyecto.");
    } finally {
      setEditLoading(false);
    }
  };

  const irAGestionServicios = (proyecto: Proyecto) => {
    navigate(`/proyecto/${proyecto.id}`);
  };

  const clienteNombreMap = useMemo(() => {
    const map: Record<number, string> = {};
    clientes.forEach((cliente) => {
      map[cliente.id] = cliente.nombre;
    });
    return map;
  }, [clientes]);

  const clientePorObra = useMemo(() => {
    const map: Record<number, string> = {};
    obras.forEach((obra) => {
      map[obra.id] = clienteNombreMap[obra.cliente] || `Cliente #${obra.cliente}`;
    });
    return map;
  }, [obras, clienteNombreMap]);

  if (!obraSeleccionada) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">Seleccione una obra para gestionar sus proyectos.</p>
        </div>
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <ObraList obras={obras} onObraSeleccionada={setObraSeleccionada} clienteNombres={clienteNombreMap} />
        )}
      </div>
    );
  }

  const proyectosFiltrados = proyectos.filter((p) => p.obra === obraSeleccionada.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setObraSeleccionada(null)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Proyectos en {obraSeleccionada.nombre_obra}
        </h2>
      </div>

      <ProyectoForm obra={obraSeleccionada} onProyectoCreado={handleProyectoCreado} />

      <Separator className="my-6" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Listado de Proyectos</h3>
        <ProjectList
          proyectos={proyectosFiltrados}
          clientePorObra={clientePorObra}
          onEditarProyecto={abrirEditorProyecto}
          onGestionProyecto={irAGestionServicios}
        />
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => (open ? setEditOpen(true) : cerrarEditorProyecto())}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {proyectoEditando
                ? `Editar proyecto: ${proyectoEditando.nombre_proyecto}`
                : "Editar proyecto"}
            </DialogTitle>
            <DialogDescription>
              Actualiza los datos principales del proyecto seleccionado.
            </DialogDescription>
          </DialogHeader>
          {proyectoEditando && (
            <form className="space-y-4" onSubmit={handleEditarProyecto}>
              <div className="grid gap-2">
                <Label htmlFor="edit-proy-nombre">Nombre</Label>
                <Input
                  id="edit-proy-nombre"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={editTipo} onValueChange={setEditTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proteccion">Proteccion</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="medicion">Medicion</SelectItem>
                    <SelectItem value="comunicacion">Comunicacion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={editEstado} onValueChange={setEditEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proceso">En proceso</SelectItem>
                    <SelectItem value="realizado">Realizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-proy-ubicacion">Ubicacion fisica</Label>
                <Input
                  id="edit-proy-ubicacion"
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                  placeholder="Ej: Sala de tableros"
                />
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={cerrarEditorProyecto} disabled={editLoading}>
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
