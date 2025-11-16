/**
 * Pagina de gestion de Marcas.
 */
import { useEffect, useState, type FormEvent } from "react";
import { listarMarcas, crearMarca, type Marca, type MarcaPayload } from "../services/api";

function MarcaForm({ onMarcaCreada }: { onMarcaCreada: (marca: Marca) => void }) {
    const [nombre, setNombre] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        setError(null);

        const payload: MarcaPayload = { nombre };

        try {
            const nuevaMarca = await crearMarca(payload);
            onMarcaCreada(nuevaMarca);
            setNombre("");
        } catch {
            setError("Error al guardar la marca.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Registrar Nueva Marca</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="marca-nombre">Nombre de la Marca</label>
                    <input
                        id="marca-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={cargando} className="self-end">
                    {cargando ? "Guardando..." : "Guardar Marca"}
                </button>
            </div>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}

function MarcaList({ marcas }: { marcas: Marca[] }) {
    return (
        <section className="cards-wrapper">
            <h3>Marcas Registradas</h3>
            {marcas.length === 0 ? (
                <p className="placeholder">No hay marcas.</p>
            ) : (
                <div className="cards small-cards">
                    {marcas.map((marca) => (
                        <article key={marca.id} className="card">
                            <h3>{marca.nombre}</h3>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarMarcas()
            .then(setMarcas)
            .catch(() => setError("No se pudieron cargar las marcas."));
    }, []);

    const handleMarcaCreada = (nuevaMarca: Marca) => {
        setMarcas([nuevaMarca, ...marcas]);
    };

    return (
        <div>
            <MarcaForm onMarcaCreada={handleMarcaCreada} />
            <hr className="divider" />
            {error ? <p className="error">{error}</p> : <MarcaList marcas={marcas} />}
        </div>
    );
}
