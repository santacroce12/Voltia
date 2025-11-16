/**
 * Layout.tsx
 * Componente principal que define la estructura visual de la app (header, navegacion).
 * Muestra el contenido de la ruta activa usando el componente <Outlet>.
 */
import { Link, Outlet, useNavigate } from "react-router-dom";
import { limpiarToken, obtenerSalud, type SaludAPI } from "../services/api";
import { useEffect, useState } from "react";

export function Layout() {
    const navigate = useNavigate();
    const [mensajeSalud, setMensajeSalud] = useState("Consultando API...");

    // Carga el estado de salud al montar el layout
    useEffect(() => {
        obtenerSalud()
            .then((estado: SaludAPI) =>
                setMensajeSalud(`${estado.mensaje} (Proyectos: ${estado.total_proyectos})`),
            )
            .catch(console.error);
    }, []);

    const handleLogout = () => {
        limpiarToken();
        navigate("/login"); // Redirige al login
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

            {/* Barra de Navegacion Principal */}
            <nav className="main-nav">
                <Link to="/">Dashboard</Link>
                <Link to="/clientes">Clientes</Link>
                <Link to="/obras">Obras</Link>
                <Link to="/proyectos">Proyectos</Link>
                <Link to="/catalogo">Catálogo</Link>
            </nav>

            {/* Contenedor principal donde se renderizará la página activa */}
            <main className="layout">
                {/* Outlet es el marcador de posicion de React Router */}
                <Outlet />
            </main>
        </>
    );
}
