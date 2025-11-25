import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Building,
  HardHat,
  ClipboardList,
  Factory,
  BookMarked,
  Bolt,
  Menu,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { limpiarToken } from "../services/api";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/clientes", label: "Clientes", icon: Building },
  { to: "/obras", label: "Obras", icon: HardHat },
  { to: "/proyectos", label: "Proyectos", icon: ClipboardList },
  { to: "/catalogo", label: "Dispositivos", icon: BookMarked },
  { to: "/ingenieria", label: "Ingenieria", icon: Factory },
];

export function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    limpiarToken();
    navigate("/login");
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Bolt className="h-6 w-6 text-primary" />
              <span>VOLTIA</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/90 transition-all hover:text-primary",
                      isActive && "bg-muted text-primary",
                    )
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
          <Breadcrumbs />
          <form className="ml-auto hidden w-full max-w-sm md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-full appearance-none rounded-lg bg-background pl-8 shadow-none"
              />
            </div>
          </form>
          <ThemeToggle />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
          >
            Cerrar Sesion
          </Button>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
