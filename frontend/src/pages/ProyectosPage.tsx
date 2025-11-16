/**
 * ProyectosPage.tsx
 * Página dedicada a la gestión de Proyectos.
 */
import { useEffect, useState } from "react";
import { ProjectList } from "../components/ProjectList";
import { ProyectoForm } from "../components/ProyectoForm";
import { listarProyectos, type Proyecto } from "../services/api";

export function ProyectosPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarProyectos()
            .then(setProyectos)
            .catch(() => setError("No se pudieron cargar los proyectos."));
    }, []);

    const handleProyectoCreado = (nuevoProyecto: Proyecto) => {
        setProyectos([nuevoProyecto, ...proyectos]);
    };

    return (
        <>
            <ProyectoForm onProyectoCreado={handleProyectoCreado} />

            <section className="cards-wrapper">
                <h2>Listado de Proyectos</h2>
                {error ? <p className="error">{error}</p> : <ProjectList proyectos={proyectos} />}
            </section>
        </>
    );
}
