/**
 * Vista principal que consume la API de Django y entrega feedback en pantalla.
 * Se agregan comentarios para explicar cada bloque clave.
 */
import { useEffect, useState } from "react";
import { ProjectList } from "./components/ProjectList";
import type { Proyecto } from "./services/api";
import { listarProyectos, obtenerSalud } from "./services/api";

export default function App() {
    const [mensajeSalud, setMensajeSalud] = useState<string>("Consultando API...");
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        /**
         * Ejecutamos ambas peticiones en paralelo para optimizar tiempo de carga.
         */
        async function cargarDatos() {
            try {
                const [estado, lista] = await Promise.all([obtenerSalud(), listarProyectos()]);
                setMensajeSalud(`${estado.mensaje} (Proyectos: ${estado.total_proyectos})`);
                setProyectos(lista);
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar informacion desde el backend.");
            }
        }

        cargarDatos();
    }, []);

    return (
        <main className="layout">
            <header className="hero">
                <h1>Sistema VOLTIA</h1>
                <p>Base lista para iterar entre Django + PostgreSQL + React.</p>
                <span className="status">{mensajeSalud}</span>
            </header>

            {error ? <p className="error">{error}</p> : <ProjectList proyectos={proyectos} />}
        </main>
    );
}
