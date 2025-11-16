/**
 * DashboardPage.tsx
 * Página principal que muestra la lista de proyectos.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectList } from "../components/ProjectList";
import { listarProyectos, type Proyecto } from "../services/api";

export function DashboardPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        listarProyectos()
            .then(setProyectos)
            .catch(() => setError("No se pudieron cargar los proyectos."));
    }, []);

    return (
        <>
            <button className="primary-button" onClick={() => navigate("/catalogo")}>
                Gestionar Catálogo de Dispositivos
            </button>
            <section className="cards-wrapper">
                <h2>Proyectos Existentes</h2>
                {error ? <p className="error">{error}</p> : <ProjectList proyectos={proyectos} />}
            </section>
        </>
    );
}
