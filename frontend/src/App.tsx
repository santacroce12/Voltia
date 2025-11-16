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
        // Si no hay token, redirigimos al login
        // Guardamos la ruta a la que queria ir (location.pathname)
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si hay token, renderiza la ruta hija (p.ej. <Layout />)
    return <Outlet />;
}
