import { useState, type FormEvent } from "react";
import { crearProyecto, type Proyecto, type ProyectoPayload, type Obra } from "../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type ProyectoFormProps = {
  obra: Obra;
  onProyectoCreado: (nuevoProyecto: Proyecto) => void;
};

export function ProyectoForm({ obra, onProyectoCreado }: ProyectoFormProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("proteccion");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("proceso");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const payload: ProyectoPayload = {
      nombre_proyecto: nombre,
      obra: obra.id,
      tipo,
      ubicacion_fisica: ubicacion,
      estado_proyecto: estado,
    };

    try {
      const nuevoProyecto = await crearProyecto(payload);
      onProyectoCreado(nuevoProyecto);
      setNombre("");
      setUbicacion("");
    } catch {
      setError("Error al crear el proyecto.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle>Crear nuevo proyecto en: {obra.nombre_obra}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="proyecto-form"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2 lg:col-span-2">
            <Label htmlFor="proy-nombre">Nombre del proyecto</Label>
            <Input
              id="proy-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proy-tipo">Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="proy-tipo">
                <SelectValue placeholder="Seleccionar tipo" />
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
            <Label htmlFor="proy-estado">Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="proy-estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proceso">En proceso</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 lg:col-span-4">
            <Label htmlFor="proy-ubicacion">Ubicacion fisica (opcional)</Label>
            <Input
              id="proy-ubicacion"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Sala de tableros"
            />
          </div>
        </form>
        {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button form="proyecto-form" type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Guardar Proyecto"}
        </Button>
      </CardFooter>
    </Card>
  );
}
