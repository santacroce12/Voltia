/**
 * Formulario para crear un nuevo Proyecto.
 * Recibe la Obra padre como prop.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { crearProyecto, type Proyecto, type ProyectoPayload, type Obra } from "../services/api";

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
            setTipo("proteccion");
            setEstado("proceso");
        } catch (err) {
            setError("Error al crear el proyecto.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h2>Crear Proyecto en: {obra.nombre_obra}</h2>

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="proy-nombre">Nombre del Proyecto</label>
                    <input
                        id="proy-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="proy-tipo">Tipo</label>
                    <select
                        id="proy-tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="proteccion">Protección</option>
                        <option value="control">Control</option>
                        <option value="medicion">Medición</option>
                        <option value="comunicacion">Comunicación</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="proy-estado">Estado</label>
                    <select
                        id="proy-estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                    >
                        <option value="proceso">En proceso</option>
                        <option value="completado">Completado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="proy-ubicacion">Ubicación Física (Opcional)</label>
                    <input
                        id="proy-ubicacion"
                        type="text"
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                        placeholder="Ej: Sala de Tableros"
                    />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar Proyecto"}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}
