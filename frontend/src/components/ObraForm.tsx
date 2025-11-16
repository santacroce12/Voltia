/**
 * Formulario para crear una nueva Obra.
 * Recibe el Cliente padre como prop.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { crearObra, type Obra, type ObraPayload, type Cliente } from "../services/api";

type ObraFormProps = {
    cliente: Cliente;
    onObraCreada: (nuevaObra: Obra) => void;
};

export function ObraForm({ cliente, onObraCreada }: ObraFormProps) {
    const [nombre, setNombre] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [estado, setEstado] = useState("pendiente");

    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

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
        } catch (err) {
            setError("Error al crear la obra.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h2>Crear Obra para: {cliente.nombre}</h2>
            <div className="form-grid">
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
