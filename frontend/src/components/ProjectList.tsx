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
        return <p className="placeholder">Todavía no hay proyectos registrados.</p>;
    }

    return (
        <section className="cards">
            {proyectos.map((proyecto) => (
                <article key={proyecto.id} className="card">
                    <header>
                        <h3>{proyecto.nombre_proyecto}</h3>
                        <small>
                            Creado el {new Date(proyecto.fecha_creacion).toLocaleString()} por{" "}
                            {proyecto.usuario_creador}
                        </small>
                    </header>
                    <p>Tipo: {proyecto.tipo} - Obra #{proyecto.obra}</p>
                    <p>Estado: {proyecto.estado_proyecto}</p>
                    <p>Ubicación: {proyecto.ubicacion_fisica}</p>
                </article>
            ))}
        </section>
    );
}
