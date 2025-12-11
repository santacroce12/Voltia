import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    Tags,
    Shapes,
    Settings2,
    Hash,
    Package,
    List,
    ArrowRight,
} from "lucide-react";

const subRoutes = [
    { to: "/catalogo/marcas", label: "Marcas", icon: Tags },
    { to: "/catalogo/categorias", label: "Categorias", icon: Shapes },
    { to: "/catalogo/funciones", label: "Funciones", icon: Settings2 },
    { to: "/catalogo/atributos", label: "Atributos", icon: Hash },
    { to: "/catalogo/dispositivos", label: "Dispositivos", icon: Package },
    { to: "/catalogo/dispositivos/listar", label: "Listar Dispositivos", icon: List },
];

export function CatalogoLayout() {
    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catalogo maestro</p>
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Dispositivos</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                        Explora <ArrowRight className="h-3 w-3" /> edita <ArrowRight className="h-3 w-3" /> publica
                    </span>
                    <span>Administra marcas, categorías, funciones y modelos desde aquí.</span>
                </div>
            </div>

            <nav className="flex flex-wrap gap-3">
                {subRoutes.map((route) => (
                    <NavLink
                        key={route.to}
                        to={route.to}
                        className={({ isActive }) =>
                            cn(
                                "group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                                "hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]",
                                isActive
                                    ? "bg-primary/15 text-primary border-primary/40 shadow-[0_6px_16px_rgba(245,158,11,0.35)] dark:bg-primary/25"
                                    : "bg-muted/60 text-muted-foreground border-muted/70 hover:border-muted-foreground/20"
                            )
                        }
                    >
                        <route.icon className="h-4 w-4" />
                        {route.label}
                    </NavLink>
                ))}
            </nav>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
                <Outlet />
            </div>
        </section>
    );
}
