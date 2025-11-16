/**
 * DashboardPage.tsx
 * Página principal que muestra la lista de proyectos.
 */
import { useEffect, useState } from "react";
import { ProjectList } from "../components/ProjectList";
import { listarProyectos, type Proyecto } from "../services/api";

export function DashboardPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarProyectos()
            .then(setProyectos)
            .catch(() => setError("No se pudieron cargar los proyectos."));
    }, []);

    return (
        <section className="cards-wrapper">
            <h2>Proyectos Existentes</h2>
            {error ? <p className="error">{error}</p> : <ProjectList proyectos={proyectos} />}
        </section>
    );
}
