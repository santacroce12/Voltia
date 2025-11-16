/**
 * Layout.tsx
 * Componente principal que define la estructura visual de la app (header, navegación).
 * Muestra el contenido de la ruta activa usando el componente <Outlet>.
 */
import { Link, Outlet, useNavigate } from "react-router-dom";
import { limpiarToken, obtenerSalud, type SaludAPI } from "../services/api";
import { useEffect, useState } from "react";

export function Layout() {
    const navigate = useNavigate();
    const [mensajeSalud, setMensajeSalud] = useState("Consultando API...");

    useEffect(() => {
        obtenerSalud()
            .then((estado: SaludAPI) =>
                setMensajeSalud(`${estado.mensaje} (Proyectos: ${estado.total_proyectos})`),
            )
            .catch(console.error);
    }, []);

    const handleLogout = () => {
        limpiarToken();
        navigate("/login");
    };

    return (
        <>
            <header className="hero">
                <h1>Sistema VOLTIA</h1>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
                </button>
                <span className="status">{mensajeSalud}</span>
            </header>

            <nav className="main-nav">
                <Link to="/">Dashboard</Link>
                <Link to="/clientes">Clientes</Link>
                <Link to="/obras">Obras</Link>
                <Link to="/proyectos">Proyectos</Link>
                <Link to="/catalogo">Catálogo</Link>
            </nav>

            <main className="layout">
                <Outlet />
            </main>
        </>
    );
}
