/**
 * DashboardPage.tsx
 * Página de bienvenida (Inicio) con métricas clave.
 */
import { useEffect, useState } from "react";
import { listarProyectos, type Proyecto } from "../services/api";

export function DashboardPage() {
    const [totalProyectos, setTotalProyectos] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarProyectos()
            .then((data: Proyecto[]) => setTotalProyectos(data.length))
            .catch(() => setError("No se pudo obtener el resumen de proyectos."));
    }, []);

    return (
        <section className="inicio-panel">
            <div className="inicio-hero">
                <h2>Bienvenido al centro energético de VOLTIA</h2>
                <p>
                    Visualiza en un único lugar las obras activas, coordina los equipos de ingeniería y
                    asegura la trazabilidad de cada dispositivo desplegado.
                </p>
            </div>

            <div className="inicio-stats">
                <article className="stat-card">
                    <h3>Proyectos monitoreados</h3>
                    {error ? <p className="error">{error}</p> : <p className="stat-value">{totalProyectos}</p>}
                </article>
                <article className="stat-card">
                    <h3>Flujo operativo</h3>
                    <p className="stat-value">Ingeniería · Dispositivos · Catálogo</p>
                </article>
            </div>
        </section>
    );
}
