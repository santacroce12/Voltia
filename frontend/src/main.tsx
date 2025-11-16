/**
 * Punto de entrada de la aplicacion de React.
 * Ahora configura el ROUTER principal.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./style.css";

// Importamos los componentes de página y layout
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientesPage } from "./pages/ClientesPage";
import { ObrasPage } from "./pages/ObrasPage";
import { ProyectosPage } from "./pages/ProyectosPage";
import { LoginForm } from "./components/LoginForm";

// Definicion de todas las rutas de la aplicacion
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />, // App ahora es el "portero" de seguridad
        children: [
            // --- Rutas Protegidas ---
            // Usan el Layout principal (con header y navegacion)
            {
                element: <Layout />,
                children: [
                    {
                        path: "/",
                        element: <DashboardPage />,
                    },
                    {
                        path: "/clientes",
                        element: <ClientesPage />,
                    },
                    {
                        path: "/obras",
                        element: <ObrasPage />,
                    },
                    {
                        path: "/proyectos",
                        element: <ProyectosPage />,
                    },
                    // (Aqui agregaremos /obras y /catalogo despues)
                ],
            },
            // --- Rutas Publicas ---
            // No usan el Layout principal
            {
                path: "/login",
                element: <LoginForm onLoginExitoso={() => (window.location.href = "/")} />,
            },
        ],
    },
]);

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("No se encontro el elemento root en index.html");
}

createRoot(rootElement).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
