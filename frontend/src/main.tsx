/**
 * Punto de entrada de la aplicacion de React.
 * Ahora configura el ROUTER principal.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./style.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";

// Importamos los componentes de pagina y layout
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientesPage } from "./pages/ClientesPage";
import { ObrasPage } from "./pages/ObrasPage";
import { ProyectosPage } from "./pages/ProyectosPage";
import { ProyectoDetallePage } from "./pages/ProyectoDetallePage";
import { IngenieriaPage } from "./pages/IngenieriaPage";
import { IngenieriaDetallePage } from "./pages/IngenieriaDetallePage";
import { CatalogoLayout } from "./pages/CatalogoLayout";
import { MarcasPage } from "./pages/MarcasPage";
import { CategoriasPage } from "./pages/CategoriasPage";
import { FuncionesPage } from "./pages/FuncionesPage";
import { DispositivosPage } from "./pages/DispositivosPage";
import { DispositivosListadoPage } from "./pages/DispositivosListadoPage";
import { LoginPage } from "./pages/LoginPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                element: <Layout />,
                children: [
                    {
                        path: "/",
                        element: <DashboardPage />,
                        handle: { crumb: () => "Inicio" },
                    },
                    {
                        path: "/clientes",
                        element: <ClientesPage />,
                        handle: { crumb: () => "Clientes" },
                    },
                    {
                        path: "/obras",
                        element: <ObrasPage />,
                        handle: { crumb: () => "Obras" },
                    },
                    {
                        path: "/proyectos",
                        element: <ProyectosPage />,
                        handle: { crumb: () => "Proyectos" },
                    },
                    {
                        path: "/proyecto/:proyectoId",
                        element: <ProyectoDetallePage />,
                        handle: { crumb: (data: any) => `Proyecto #${data.params.proyectoId}` },
                    },
                    {
                        path: "/ingenieria",
                        element: <IngenieriaPage />,
                        handle: { crumb: () => "Ingenieria" },
                    },
                    {
                        path: "/ingenieria/proyecto/:proyectoId",
                        element: <IngenieriaDetallePage />,
                        handle: { crumb: (data: any) => `Ing. Proyecto #${data.params.proyectoId}` },
                    },
                    {
                        path: "/catalogo",
                        element: <CatalogoLayout />,
                        handle: { crumb: () => "Catalogo" },
                        children: [
                            {
                                path: "marcas",
                                element: <MarcasPage />,
                                handle: { crumb: () => "Marcas" },
                            },
                            {
                                path: "categorias",
                                element: <CategoriasPage />,
                                handle: { crumb: () => "Categorias" },
                            },
                            {
                                path: "funciones",
                                element: <FuncionesPage />,
                                handle: { crumb: () => "Funciones" },
                            },
                            {
                                path: "dispositivos",
                                element: <DispositivosPage />,
                                handle: { crumb: () => "Crear Dispositivo" },
                            },
                            {
                                path: "dispositivos/listar",
                                element: <DispositivosListadoPage />,
                                handle: { crumb: () => "Listar Dispositivos" },
                            },
                        ],
                    },
                ],
            },
            {
                path: "/login",
                element: <LoginPage />,
                handle: { crumb: () => "Login" },
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
        <ThemeProvider defaultTheme="light" storageKey="voltia-theme">
            <TooltipProvider>
                <RouterProvider router={router} />
            </TooltipProvider>
        </ThemeProvider>
    </StrictMode>,
);
