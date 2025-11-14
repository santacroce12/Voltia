/**
 * Vista principal que actúa como "portero".
 * Ahora también gestiona la lista de Clientes y Proyectos.
 */
import { useEffect, useState } from "react";
// Importamos los nuevos componentes
import { ClienteList } from "./components/ClienteList";
import { ClienteForm } from "./components/ClienteForm";
import { ProjectList } from "./components/ProjectList";
import { LoginForm } from "./components/LoginForm";
import {
    listarProyectos,
    obtenerSalud,
    getAuthToken,
    limpiarToken,
    listarClientes,
} from "./services/api";
import type { Proyecto, SaludAPI, Cliente } from "./services/api";

export default function App() {
    // --- Estados de Autenticación ---
    const [token, setToken] = useState<string | null>(() => getAuthToken());

    // --- Estados de Datos ---
    const [mensajeSalud, setMensajeSalud] = useState<string>("Consultando API...");
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [error, setError] = useState<string | null>(null);

    // --- Efecto para Cargar Datos ---
    useEffect(() => {
        async function cargarDatos() {
            if (token) {
                try {
                    setError(null);
                    // Ahora cargamos clientes Y proyectos en paralelo
                    const [estado, listaProy, listaCli] = await Promise.all([
                        obtenerSalud(),
                        listarProyectos(),
                        listarClientes(),
                    ]);

                    setMensajeSalud(`${estado.mensaje} (Proyectos: ${estado.total_proyectos})`);
                    setProyectos(listaProy);
                    setClientes(listaCli);
                } catch (err) {
                    console.error(err);
                    setError(
                        "No se pudo cargar información desde el backend. (Tu sesión puede haber expirado)",
                    );
                    limpiarToken();
                    setToken(null);
                }
            } else {
                obtenerSalud()
                    .then((estado: SaludAPI) =>
                        setMensajeSalud(`${estado.mensaje} (Proyectos: ${estado.total_proyectos})`),
                    )
                    .catch(console.error);
            }
        }

        cargarDatos();
    }, [token]);

    // --- Funciones de Login/Logout ---
    const handleLoginExitoso = (nuevoToken: string) => {
        setToken(nuevoToken);
    };

    const handleLogout = () => {
        limpiarToken();
        setToken(null);
        setProyectos([]);
        setClientes([]);
    };

    // --- Callback para el formulario ---
    const handleClienteCreado = (nuevoCliente: Cliente) => {
        setClientes([...clientes, nuevoCliente]);
    };

    // --- Renderizado ---
    if (!token) {
        return (
            <main className="layout">
                <LoginForm onLoginExitoso={handleLoginExitoso} />
            </main>
        );
    }

    return (
        <main className="layout">
            <header className="hero">
                <h1>Sistema VOLTIA</h1>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
                </button>
                <span className="status">{mensajeSalud}</span>
            </header>

            {error && <p className="error">{error}</p>}

            {/* Seccion de Clientes */}
            <ClienteForm onClienteCreado={handleClienteCreado} />
            <ClienteList clientes={clientes} />

            {/* Separador */}
            <hr className="divider" />

            {/* Seccion de Proyectos */}
            <section className="cards-wrapper">
                <h2>Proyectos Existentes</h2>
                <ProjectList proyectos={proyectos} />
            </section>
        </main>
    );
}
