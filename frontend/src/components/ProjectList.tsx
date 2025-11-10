/**
 * Componente presentacional para mostrar un listado de proyectos.
 * Recibe los datos ya transformados desde el hook del componente padre.
 */
import type { Proyecto } from "../services/api";

type ProyectoListProps = {
    proyectos: Proyecto[];
};

export function ProjectList({ proyectos }: ProyectoListProps) {
    if (proyectos.length === 0) {
        return <p className="placeholder">Todavia no hay proyectos registrados.</p>;
    }

    return (
        <section className="cards">
            {proyectos.map((proyecto) => (
                <article key={proyecto.id} className="card">
                    <header>
                        <h3>{proyecto.nombre}</h3>
                        <small>Creado: {new Date(proyecto.creado_en).toLocaleString()}</small>
                    </header>
                    <p>{proyecto.descripcion}</p>
                </article>
            ))}
        </section>
    );
}
