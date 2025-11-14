/**
 * Formulario para crear un nuevo Cliente.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { crearCliente, type Cliente, type ClientePayload } from "../services/api";

type ClienteFormProps = {
    // Callback para notificar al padre (App) que un cliente fue creado
    onClienteCreado: (nuevoCliente: Cliente) => void;
};

export function ClienteForm({ onClienteCreado }: ClienteFormProps) {
    // Estados para cada campo del formulario
    const [nombre, setNombre] = useState("");
    const [cuil, setCuil] = useState("");
    const [direccion, setDireccion] = useState("");
    const [notas, setNotas] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        const payload: ClientePayload = { nombre, cuil, direccion, notas };

        try {
            const nuevoCliente = await crearCliente(payload);
            // 1. Notificamos al componente App
            onClienteCreado(nuevoCliente);
            // 2. Limpiamos el formulario
            setNombre("");
            setCuil("");
            setDireccion("");
            setNotas("");
        } catch (err) {
            setError("Error al crear el cliente. Revisa los datos.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h2>Crear Nuevo Cliente</h2>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="cli-nombre">Nombre / Razón Social</label>
                    <input
                        id="cli-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cli-cuil">CUIL / CUIT</label>
                    <input
                        id="cli-cuil"
                        type="text"
                        value={cuil}
                        onChange={(e) => setCuil(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cli-dir">Dirección (Opcional)</label>
                    <input
                        id="cli-dir"
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cli-notas">Notas (Opcional)</label>
                    <input
                        id="cli-notas"
                        type="text"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                    />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar Cliente"}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}
