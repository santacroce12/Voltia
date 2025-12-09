/**
 * Layout.tsx
 * Dashboard profesional con barra lateral expandida.
 * CORRECCIÓN: Íconos importados correctamente para evitar el "?"
 */
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    Home,           // Dashboard
    Building,       // Clientes
    HardHat,        // Obras
    ClipboardList,  // Proyectos
    Factory,        // Ingeniería
    Package,        // Dispositivos (Catálogo)
    LogOut,         // Cerrar Sesión
    Bolt,           // Logo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { limpiarToken } from "../services/api";
import { cn } from "@/lib/utils";

// Definición de rutas y sus íconos
const navLinks = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/clientes", label: "Clientes", icon: Building },
    { to: "/obras", label: "Obras", icon: HardHat },
    { to: "/proyectos", label: "Proyectos", icon: ClipboardList },
    { to: "/ingenieria", label: "Ingeniería", icon: Factory },
    { to: "/catalogo", label: "Dispositivos", icon: Package }, // Catálogo
];

export function Layout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        limpiarToken();
        navigate("/login");
    };

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            {/* --- 1. BARRA LATERAL --- */}
            <div className="hidden border-r bg-muted/40 md:block h-screen sticky top-0 overflow-hidden flex flex-col">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    {/* Logo */}
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <span className="flex items-center gap-3 font-bold text-xl">
                            <span className="rounded-full bg-yellow-400/20 p-2 text-yellow-500 flex items-center justify-center">
                                <Bolt className="h-6 w-6" />
                            </span>
                            <span className="tracking-tight">VOLTIA</span>
                        </span>
                    </div>

                    {/* Navegación */}
                    <div className="flex-1 overflow-auto py-2">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                                            isActive && "bg-muted text-primary font-semibold"
                                        )
                                    }
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Footer Sidebar: Cerrar Sesión */}
                    <div className="mt-auto p-4 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- 2. CONTENIDO PRINCIPAL --- */}
            <div className="flex flex-col h-screen overflow-hidden">
                {/* Header Superior */}
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 shrink-0">
                    <div className="w-full flex-1">
                        <Breadcrumbs />
                    </div>
                    <ThemeToggle />
                </header>

                {/* Área de Scroll para el contenido */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

