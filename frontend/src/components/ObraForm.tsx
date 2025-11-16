/**
 * Formulario para crear una nueva Obra.
 * Carga la lista de clientes para un <select>.
 */
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
    crearObra,
    listarClientes,
    type Obra,
    type ObraPayload,
    type Cliente,
} from "../services/api";

type ObraFormProps = {
    onObraCreada: (nuevaObra: Obra) => void;
};

export function ObraForm({ onObraCreada }: ObraFormProps) {
    const [nombre, setNombre] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [estado, setEstado] = useState("pendiente");
    const [clienteId, setClienteId] = useState("");

    const [clientes, setClientes] = useState<Cliente[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        listarClientes()
            .then(setClientes)
            .catch(() => setError("Error: No se pudieron cargar los clientes para el selector."));
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!clienteId) {
            setError("Debe seleccionar un cliente.");
            return;
        }

        setError(null);
        setCargando(true);

        const payload: ObraPayload = {
            nombre_obra: nombre,
            cliente: Number(clienteId),
            estado_obra: estado,
            ubicacion,
        };

        try {
            const nuevaObra = await crearObra(payload);
            onObraCreada(nuevaObra);

            setNombre("");
            setUbicacion("");
            setClienteId("");
        } catch (err) {
            setError("Error al crear la obra.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h2>Crear Nueva Obra</h2>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="obra-cliente">Cliente (Requerido)</label>
                    <select
                        id="obra-cliente"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            -- Seleccionar Cliente --
                        </option>
                        {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nombre} (CUIT: {cliente.cuil})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="obra-nombre">Nombre de la Obra</label>
                    <input
                        id="obra-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="obra-ubicacion">Ubicación (Opcional)</label>
                    <input
                        id="obra-ubicacion"
                        type="text"
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="obra-estado">Estado</label>
                    <select
                        id="obra-estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                    >
                        <option value="pendiente">Pendiente</option>
                        <option value="realizada">Realizada</option>
                        <option value="rechazada">Rechazada</option>
                    </select>
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar Obra"}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}
