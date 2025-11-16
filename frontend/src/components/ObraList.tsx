/**
 * Componente presentacional para mostrar un listado de Obras.
 * Ahora es interactivo: permite seleccionar una obra.
 */
import type { Obra } from "../services/api";

type ObraListProps = {
    obras: Obra[];
    onObraSeleccionada: (obra: Obra) => void;
};

export function ObraList({ obras, onObraSeleccionada }: ObraListProps) {
    if (obras.length === 0) {
        return <p className="placeholder">No hay obras cargadas.</p>;
    }

    return (
        <section className="cards-wrapper">
            <h2>Obras Existentes</h2>
            <div className="cards small-cards clickable-cards">
                {obras.map((obra) => (
                    <article
                        key={obra.id}
                        className="card"
                        onClick={() => onObraSeleccionada(obra)}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" ? onObraSeleccionada(obra) : null)}
                    >
                        <header>
                            <h3>{obra.nombre_obra}</h3>
                            <small>Cliente ID: {obra.cliente}</small>
                        </header>
                        <p>Estado: {obra.estado_obra}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
