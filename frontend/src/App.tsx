/**
 * Vista principal que actúa como "portero".
 * Muestra el Login si no hay token, o la app principal si el usuario está logueado.
 */
import { useEffect, useState } from "react";
import { ProjectList } from "./components/ProjectList";
import { LoginForm } from "./components/LoginForm"; // Importamos el Login
import {
    listarProyectos,
    obtenerSalud,
    getAuthToken, // Importamos utilidades
    limpiarToken,
} from "./services/api";
import type { Proyecto, SaludAPI } from "./services/api";

export default function App() {
    // 1. Estado de autenticación. Leemos el token de localStorage al iniciar.
    const [token, setToken] = useState<string | null>(() => getAuthToken());

    // 2. Estados de datos (como antes)
    const [mensajeSalud, setMensajeSalud] = useState<string>("Consultando API...");
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [error, setError] = useState<string | null>(null);

    // 3. Efecto para cargar datos (solo si estamos logueados)
    useEffect(() => {
        async function cargarDatos() {
            if (token) {
                // Solo cargamos datos protegidos si tenemos token
                try {
                    setError(null);
                    // 'obtenerSalud' es pública, 'listarProyectos' es protegida
                    const [estado, lista] = await Promise.all([
                        obtenerSalud(),
                        listarProyectos(),
                    ]);

                    setMensajeSalud(`${estado.mensaje} (Proyectos: ${estado.total_proyectos})`);
                    setProyectos(lista);
                } catch (err) {
                    console.error(err);
                    setError(
                        "No se pudo cargar información desde el backend. (Tu sesión puede haber expirado)",
                    );
                    // Si falla (ej. 401), limpiamos el token para forzar login
                    limpiarToken();
                    setToken(null);
                }
            } else {
                // Si no hay token, solo cargamos datos públicos
                obtenerSalud()
                    .then((estado: SaludAPI) =>
                        setMensajeSalud(`${estado.mensaje} (Proyectos: ${estado.total_proyectos})`),
                    )
                    .catch(console.error);
            }
        }

        cargarDatos();
    }, [token]); // Este efecto se re-ejecuta si el 'token' cambia

    // 4. Funciones de Login/Logout
    const handleLoginExitoso = (nuevoToken: string) => {
        setToken(nuevoToken); // Esto dispara el useEffect de arriba
    };

    const handleLogout = () => {
        limpiarToken();
        setToken(null);
        setProyectos([]); // Limpiamos datos
    };

    // --- Renderizado Condicional ---

    // Si NO hay token, mostramos el formulario de Login
    if (!token) {
        return (
            <main className="layout">
                <LoginForm onLoginExitoso={handleLoginExitoso} />
            </main>
        );
    }

    // Si HAY token, mostramos la aplicación principal
    return (
        <main className="layout">
            <header className="hero">
                <h1>Sistema VOLTIA</h1>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
                </button>
                <span className="status">{mensajeSalud}</span>
            </header>

            {error ? <p className="error">{error}</p> : <ProjectList proyectos={proyectos} />}
        </main>
    );
}
