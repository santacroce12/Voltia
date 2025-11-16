/**
 * IngenieriaPage.tsx
 * Flujo de trabajo principal de Marcelo: Seleccionar Obra -> Seleccionar Proyecto -> Cargar.
 */
import { useEffect, useState } from "react";
import { ObraList } from "../components/ObraList";
import { ProjectList } from "../components/ProjectList";
import type { Obra, Proyecto } from "../services/api";
import { listarObras, listarProyectos } from "../services/api";

export function IngenieriaPage() {
    const [obras, setObras] = useState<Obra[]>([]);
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
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

    const handleVolver = () => setObraSeleccionada(null);

    if (!obraSeleccionada) {
        return (
            <>
                <h2 className="page-title">Ingeniería: Carga de Dispositivos</h2>
                <p>Paso 1: Seleccione una obra para ver sus proyectos.</p>
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
            <section className="cards-wrapper">
                <h2>Paso 2: Seleccione un Proyecto en {obraSeleccionada.nombre_obra}</h2>
                {proyectosFiltrados.length === 0 ? (
                    <p className="placeholder">No hay proyectos en esta obra.</p>
                ) : (
                    <ProjectList proyectos={proyectosFiltrados} linkPrefix="/ingenieria/proyecto" />
                )}
            </section>
        </>
    );
}
