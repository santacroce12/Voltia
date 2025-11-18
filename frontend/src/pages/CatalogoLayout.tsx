import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const subRoutes = [
    { to: "/catalogo/marcas", label: "Marcas" },
    { to: "/catalogo/categorias", label: "Categorias" },
    { to: "/catalogo/funciones", label: "Funciones" },
    { to: "/catalogo/dispositivos", label: "Dispositivos" },
    { to: "/catalogo/dispositivos/listar", label: "Listar Dispositivos" },
];

export function CatalogoLayout() {
    return (
        <section className="space-y-6">
            <div className="space-y-1">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Catalogo maestro</p>
                <h2 className="text-3xl font-bold tracking-tight">Gestion de Dispositivos</h2>
                <p className="text-muted-foreground">Administra marcas, categorias, funciones y modelos desde aqui.</p>
            </div>

            <nav className="flex flex-wrap gap-2">
                {subRoutes.map((route) => (
                    <NavLink
                        key={route.to}
                        to={route.to}
                        className={({ isActive }) =>
                            cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )
                        }
                    >
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
