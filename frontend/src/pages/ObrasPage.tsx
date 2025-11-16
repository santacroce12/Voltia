/**
 * ObrasPage.tsx
 * Página dedicada a la gestión de Obras (formulario y lista).
 */
import { useEffect, useState } from "react";
import { ObraList } from "../components/ObraList";
import { ObraForm } from "../components/ObraForm";
import { listarObras, type Obra } from "../services/api";

export function ObrasPage() {
    const [obras, setObras] = useState<Obra[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarObras()
            .then(setObras)
            .catch(() => setError("No se pudieron cargar las obras."));
    }, []);

    const handleObraCreada = (nuevaObra: Obra) => {
        setObras([...obras, nuevaObra]);
    };

    return (
        <>
            <ObraForm onObraCreada={handleObraCreada} />
            {error ? <p className="error">{error}</p> : <ObraList obras={obras} />}
        </>
    );
}
