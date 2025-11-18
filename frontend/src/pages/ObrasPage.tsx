import { useEffect, useState } from "react";
import { ObraList } from "../components/ObraList";
import { ObraForm } from "../components/ObraForm";
import { ClienteList } from "../components/ClienteList";
import { listarObras, listarClientes, type Obra, type Cliente } from "../services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

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
          <ClienteList clientes={clientes} onClienteSeleccionado={setClienteSeleccionado} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" size="sm" onClick={() => setClienteSeleccionado(null)} className="w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Clientes
      </Button>
      <ObraForm cliente={clienteSeleccionado} onObraCreada={handleObraCreada} />

      <Separator />

      <div>
        <h2 className="text-2xl font-semibold">Obras en {clienteSeleccionado.nombre}</h2>
        {cargando ? <p>Cargando obras...</p> : <ObraList obras={obras} />}
      </div>
    </div>
  );
}
