/**
 * Pagina de gestion de Categorias.
 */
import { useEffect, useState, type FormEvent } from "react";
import {
    listarCategorias,
    crearCategoria,
    type Categoria,
    type CategoriaPayload,
} from "../services/api";

function CategoriaForm({ onCategoriaCreada }: { onCategoriaCreada: (cat: Categoria) => void }) {
    const [principal, setPrincipal] = useState("");
    const [subcategoria, setSubcategoria] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        setError(null);

        const payload: CategoriaPayload = {
            categoria_principal: principal,
            subcategoria,
        };

        try {
            const nuevaCategoria = await crearCategoria(payload);
            onCategoriaCreada(nuevaCategoria);
            setPrincipal("");
            setSubcategoria("");
        } catch {
            setError("Error al guardar la categoría.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Registrar Nueva Categoría</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="cat-principal">Categoría Principal</label>
                    <input
                        id="cat-principal"
                        type="text"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                        placeholder="Ej: Relés"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cat-sub">Sub-Categoría</label>
                    <input
                        id="cat-sub"
                        type="text"
                        value={subcategoria}
                        onChange={(e) => setSubcategoria(e.target.value)}
                        placeholder="Ej: Protección"
                        required
                    />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar Categoría"}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}

function CategoriaList({ categorias }: { categorias: Categoria[] }) {
    return (
        <section className="cards-wrapper">
            <h3>Categorías Registradas</h3>
            {categorias.length === 0 ? (
                <p className="placeholder">No hay categorías.</p>
            ) : (
                <div className="cards small-cards">
                    {categorias.map((cat) => (
                        <article key={cat.id} className="card">
                            <h3>{cat.categoria_principal}</h3>
                            <p>{cat.subcategoria}</p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export function CategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarCategorias()
            .then(setCategorias)
            .catch(() => setError("No se pudieron cargar las categorías."));
    }, []);

    const handleCategoriaCreada = (nuevaCategoria: Categoria) => {
        setCategorias([nuevaCategoria, ...categorias]);
    };

    return (
        <div>
            <CategoriaForm onCategoriaCreada={handleCategoriaCreada} />
            <hr className="divider" />
            {error ? <p className="error">{error}</p> : <CategoriaList categorias={categorias} />}
        </div>
    );
}
