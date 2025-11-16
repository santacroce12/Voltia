/**
 * Formulario para crear un nuevo Proyecto.
 * Carga la lista de Obras para un <select>.
 */
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
    crearProyecto,
    listarObras,
    type Proyecto,
    type ProyectoPayload,
    type Obra,
} from "../services/api";

type ProyectoFormProps = {
    onProyectoCreado: (nuevoProyecto: Proyecto) => void;
};

export function ProyectoForm({ onProyectoCreado }: ProyectoFormProps) {
    const [nombre, setNombre] = useState("");
    const [tipo, setTipo] = useState("proteccion");
    const [ubicacion, setUbicacion] = useState("");
    const [estado, setEstado] = useState("proceso");
    const [obraId, setObraId] = useState("");

    const [obras, setObras] = useState<Obra[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        listarObras()
            .then(setObras)
            .catch(() => setError("Error: No se pudieron cargar las obras."));
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!obraId) {
            setError("Debe seleccionar una obra.");
            return;
        }

        setError(null);
        setCargando(true);

        const payload: ProyectoPayload = {
            nombre_proyecto: nombre,
            obra: Number(obraId),
            tipo,
            ubicacion_fisica: ubicacion,
            estado_proyecto: estado,
        };

        try {
            const nuevoProyecto = await crearProyecto(payload);
            onProyectoCreado(nuevoProyecto);

            setNombre("");
            setUbicacion("");
            setObraId("");
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
            <h2>Crear Nuevo Proyecto</h2>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="proy-obra">Obra (Requerido)</label>
                    <select
                        id="proy-obra"
                        value={obraId}
                        onChange={(e) => setObraId(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            -- Seleccionar Obra --
                        </option>
                        {obras.length === 0 && <option disabled>Cargando obras...</option>}
                        {obras.map((obra) => (
                            <option key={obra.id} value={obra.id}>
                                {obra.nombre_obra}
                            </option>
                        ))}
                    </select>
                </div>

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
                    <label htmlFor="proy-ubicacion">Ubicación Física</label>
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
