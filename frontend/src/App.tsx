/**
 * App.tsx
 * Componente "portero" (Guardian de Ruta).
 * Verifica si hay un token. Si no, redirige a /login.
 * Si hay token, renderiza el <Outlet> (Layout o la pagina que corresponda).
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "./services/api";

export default function App() {
    const token = getAuthToken();
    const location = useLocation();

    if (!token) {
        // Permitimos acceder al login sin token
        if (location.pathname === "/login") {
            return <Outlet />;
        }
        // Si no hay token y la ruta no es /login, redirigimos
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si hay token, renderiza la ruta hija (p.ej. <Layout />)
    return <Outlet />;
}
