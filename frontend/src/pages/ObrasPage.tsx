/**
 * ObrasPage.tsx
 * Página de gestión de Obras (Flujo Master-Detail).
 * Muestra lista de Clientes y, al seleccionar uno, muestra sus Obras y el formulario.
 */
import { useEffect, useState } from "react";
import { ObraList } from "../components/ObraList";
import { ObraForm } from "../components/ObraForm";
import { ClienteList } from "../components/ClienteList";
import { listarObras, listarClientes, type Obra, type Cliente } from "../services/api";

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
        if (clienteSeleccionado) {
            setCargando(true);
            setError(null);
            listarObras(clienteSeleccionado.id)
                .then(setObras)
                .catch(() => setError("No se pudieron cargar las obras de este cliente."))
                .finally(() => setCargando(false));
        } else {
            setObras([]);
        }
    }, [clienteSeleccionado]);

    const handleObraCreada = (nuevaObra: Obra) => {
        setObras([nuevaObra, ...obras]);
    };

    const handleVolver = () => {
        setClienteSeleccionado(null);
    };

    if (!clienteSeleccionado) {
        return (
            <>
                <h2 className="page-title">Gestión de Obras</h2>
                <p>Por favor, seleccione un cliente para ver sus obras.</p>
                {error ? (
                    <p className="error">{error}</p>
                ) : (
                    <ClienteList
                        clientes={clientes}
                        onClienteSeleccionado={setClienteSeleccionado}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <button className="back-button" onClick={handleVolver}>
                &larr; Volver a la lista de Clientes
            </button>

            <ObraForm cliente={clienteSeleccionado} onObraCreada={handleObraCreada} />

            <hr className="divider" />

            <section className="cards-wrapper">
                <h2>Obras en {clienteSeleccionado.nombre}</h2>
                {cargando ? (
                    <p>Cargando obras...</p>
                ) : (
                    <ObraList obras={obras} onObraSeleccionada={() => {}} />
                )}
            </section>
        </>
    );
}
