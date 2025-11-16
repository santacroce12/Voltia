/**
 * ProyectosPage.tsx
 * Página de gestión de Proyectos (Flujo Master-Detail).
 */
import { useEffect, useState } from "react";
import { ProjectList } from "../components/ProjectList";
import { ProyectoForm } from "../components/ProyectoForm";
import { ObraList } from "../components/ObraList";
import { listarProyectos, listarObras, type Proyecto, type Obra } from "../services/api";

export function ProyectosPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [obras, setObras] = useState<Obra[]>([]);
    const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([listarObras(), listarProyectos()])
            .then(([listaObras, listaProyectos]) => {
                setObras(listaObras);
                setProyectos(listaProyectos);
            })
            .catch(() => setError("No se pudieron cargar los datos."));
    }, []);

    const handleProyectoCreado = (nuevoProyecto: Proyecto) => {
        setProyectos([nuevoProyecto, ...proyectos]);
    };

    const handleVolver = () => {
        setObraSeleccionada(null);
    };

    if (!obraSeleccionada) {
        return (
            <>
                <h2 className="page-title">Gestión de Proyectos</h2>
                <p>Por favor, seleccione una obra para ver sus proyectos.</p>
                {error ? (
                    <p className="error">{error}</p>
                ) : (
                    <ObraList obras={obras} onObraSeleccionada={setObraSeleccionada} />
                )}
            </>
        );
    }

    const proyectosFiltrados = proyectos.filter((p) => p.obra === obraSeleccionada.id);

    return (
        <>
            <button className="back-button" onClick={handleVolver}>
                &larr; Volver a la lista de Obras
            </button>

            <ProyectoForm obra={obraSeleccionada} onProyectoCreado={handleProyectoCreado} />

            <hr className="divider" />

            <section className="cards-wrapper">
                <h2>Proyectos en {obraSeleccionada.nombre_obra}</h2>
                <ProjectList proyectos={proyectosFiltrados} />
            </section>
        </>
    );
}
