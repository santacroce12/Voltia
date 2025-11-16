/**
 * ClientesPage.tsx
 * Página dedicada a la gestión de Clientes (formulario y lista).
 */
import { useEffect, useState } from "react";
import { ClienteList } from "../components/ClienteList";
import { ClienteForm } from "../components/ClienteForm";
import { listarClientes, type Cliente } from "../services/api";

export function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarClientes()
            .then(setClientes)
            .catch(() => setError("No se pudieron cargar los clientes."));
    }, []);

    const handleClienteCreado = (nuevoCliente: Cliente) => {
        setClientes([...clientes, nuevoCliente]);
    };

    return (
        <>
            <ClienteForm onClienteCreado={handleClienteCreado} />
            {error ? <p className="error">{error}</p> : <ClienteList clientes={clientes} />}
        </>
    );
}
