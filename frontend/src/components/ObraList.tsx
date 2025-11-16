/**
 * Componente presentacional para mostrar un listado de Obras.
 */
import type { Obra } from "../services/api";

type ObraListProps = {
    obras: Obra[];
};

export function ObraList({ obras }: ObraListProps) {
    if (obras.length === 0) {
        return <p className="placeholder">No hay obras cargadas.</p>;
    }

    return (
        <section className="cards-wrapper">
            <h2>Obras Existentes</h2>
            <div className="cards small-cards">
                {obras.map((obra) => (
                    <article key={obra.id} className="card">
                        <header>
                            <h3>{obra.nombre_obra}</h3>
                            <small>Cliente ID: {obra.cliente}</small>
                        </header>
                        <p>Estado: {obra.estado_obra}</p>
                        <p>Ubicación: {obra.ubicacion || "No especificada"}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
