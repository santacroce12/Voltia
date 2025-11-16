/**
 * Pagina de gestion de Funciones de Dispositivo.
 */
import { useEffect, useState, type FormEvent } from "react";
import {
    listarFunciones,
    crearFuncion,
    type FuncionDispositivo,
    type FuncionPayload,
} from "../services/api";

function FuncionForm({ onFuncionCreada }: { onFuncionCreada: (func: FuncionDispositivo) => void }) {
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        setError(null);

        const payload: FuncionPayload = {
            codigo_funcion: codigo,
            nombre,
            descripcion,
        };

        try {
            const nuevaFuncion = await crearFuncion(payload);
            onFuncionCreada(nuevaFuncion);
            setCodigo("");
            setNombre("");
            setDescripcion("");
        } catch {
            setError("Error al guardar la función.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Registrar Nueva Función</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="func-codigo">Código (Opcional)</label>
                    <input
                        id="func-codigo"
                        type="text"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        placeholder="Ej: 50/51, 87"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="func-nombre">Nombre de la Función</label>
                    <input
                        id="func-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Sobrecorriente de Fase"
                        required
                    />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="func-desc">Descripción (Opcional)</label>
                    <input
                        id="func-desc"
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar Función"}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}

function FuncionList({ funciones }: { funciones: FuncionDispositivo[] }) {
    return (
        <section className="cards-wrapper">
            <h3>Funciones Disponibles</h3>
            {funciones.length === 0 ? (
                <p className="placeholder">No hay funciones.</p>
            ) : (
                <div className="cards small-cards">
                    {funciones.map((func) => (
                        <article key={func.id} className="card">
                            <h3>
                                {func.codigo_funcion ? `[${func.codigo_funcion}] ` : ""}
                                {func.nombre}
                            </h3>
                            <p>{func.descripcion || "Sin descripción"}</p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export function FuncionesPage() {
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarFunciones()
            .then(setFunciones)
            .catch(() => setError("No se pudieron cargar las funciones."));
    }, []);

    const handleFuncionCreada = (nuevaFuncion: FuncionDispositivo) => {
        setFunciones([nuevaFuncion, ...funciones]);
    };

    return (
        <div>
            <FuncionForm onFuncionCreada={handleFuncionCreada} />
            <hr className="divider" />
            {error ? <p className="error">{error}</p> : <FuncionList funciones={funciones} />}
        </div>
    );
}
