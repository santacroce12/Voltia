/**
 * CatalogoPage.tsx
 * Vista inicial del catalogo de dispositivos: muestra Marcas, Categorias y Funciones.
 */
import { useEffect, useState } from "react";
import {
    listarMarcas,
    listarCategorias,
    listarFunciones,
    type Marca,
    type Categoria,
    type FuncionDispositivo,
} from "../services/api";

export function CatalogoPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias(), listarFunciones()])
            .then(([datosMarcas, datosCategorias, datosFunciones]) => {
                setMarcas(datosMarcas);
                setCategorias(datosCategorias);
                setFunciones(datosFunciones);
            })
            .catch(() => setError("No se pudo cargar la informacion del catalogo."))
            .finally(() => setCargando(false));
    }, []);

    if (cargando) {
        return <p>Cargando catalogo...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="catalogo-grid">
            <section className="cards-wrapper">
                <h2>Marcas Registradas</h2>
                {marcas.length === 0 ? (
                    <p className="placeholder">Aun no hay marcas cargadas.</p>
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

            <section className="cards-wrapper">
                <h2>Categorias de Dispositivo</h2>
                {categorias.length === 0 ? (
                    <p className="placeholder">Aun no hay categorias cargadas.</p>
                ) : (
                    <div className="cards small-cards">
                        {categorias.map((cat) => (
                            <article key={cat.id} className="card">
                                <h3>{cat.categoria_principal}</h3>
                                <p>{cat.subcategoria}</p>
                                {cat.descripcion && <small>{cat.descripcion}</small>}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="cards-wrapper">
                <h2>Funciones Disponibles</h2>
                {funciones.length === 0 ? (
                    <p className="placeholder">Aun no hay funciones cargadas.</p>
                ) : (
                    <div className="cards small-cards">
                        {funciones.map((funcion) => (
                            <article key={funcion.id} className="card">
                                <h3>{funcion.nombre}</h3>
                                {funcion.codigo_funcion && <p>Codigo: {funcion.codigo_funcion}</p>}
                                {funcion.descripcion && <small>{funcion.descripcion}</small>}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
