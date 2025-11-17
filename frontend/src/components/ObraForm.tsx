import { useState, type FormEvent } from "react";
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
import { crearObra, type Obra, type ObraPayload, type Cliente } from "../services/api";

type ObraFormProps = {
  cliente: Cliente;
  onObraCreada: (obra: Obra) => void;
};

export function ObraForm({ cliente, onObraCreada }: ObraFormProps) {
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("pendiente");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const payload: ObraPayload = {
      nombre_obra: nombre,
      cliente: cliente.id,
      estado_obra: estado,
      ubicacion,
    };

    try {
      const nuevaObra = await crearObra(payload);
      onObraCreada(nuevaObra);
      setNombre("");
      setUbicacion("");
    } catch {
      setError("Error al crear la obra.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva obra para {cliente.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="obra-form" onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="obra-nombre">Nombre de la obra</Label>
            <Input id="obra-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="obra-ubicacion">Ubicación (opcional)</Label>
            <Input
              id="obra-ubicacion"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: San Miguel"
            />
          </div>
          <div className="grid gap-2">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button type="submit" form="obra-form" disabled={cargando}>
          {cargando ? "Guardando..." : "Guardar obra"}
        </Button>
      </CardFooter>
    </Card>
  );
}
