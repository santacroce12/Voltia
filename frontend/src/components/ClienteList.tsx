/**
 * Componente presentacional para mostrar un listado de Clientes.
 */
import type { Cliente } from "../services/api";

type ClienteListProps = {
    clientes: Cliente[];
};

export function ClienteList({ clientes }: ClienteListProps) {
    if (clientes.length === 0) {
        return <p className="placeholder">No hay clientes cargados.</p>;
    }

    return (
        <section className="cards-wrapper">
            <h2>Clientes Existentes</h2>
            <div className="cards small-cards">
                {clientes.map((cliente) => (
                    <article key={cliente.id} className="card">
                        <header>
                            <h3>{cliente.nombre}</h3>
                            <small>ID: {cliente.id}</small>
                        </header>
                        <p>CUIT: {cliente.cuil}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
