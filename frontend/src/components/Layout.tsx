import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Building,
  HardHat,
  ClipboardList,
  Factory,
  BookMarked,
  LogOut,
  Bolt,
  Menu,
  Search,
  Gauge,
  ShieldCheck,
  PlugZap,
  BatteryCharging,
  Lightbulb,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { limpiarToken, obtenerSalud, type SaludAPI } from "../services/api";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/clientes", label: "Clientes", icon: Building },
  { to: "/obras", label: "Obras", icon: HardHat },
  { to: "/proyectos", label: "Proyectos", icon: ClipboardList },
  { to: "/catalogo", label: "Catalogo", icon: BookMarked },
  { to: "/ingenieria", label: "Ingenieria", icon: Factory },
];

export function Layout() {
  const navigate = useNavigate();
  const [salud, setSalud] = useState<SaludAPI | null>(null);
  const [apiMensaje, setApiMensaje] = useState("Consultando API...");

  useEffect(() => {
    obtenerSalud()
      .then((estado) => {
        setSalud(estado);
        setApiMensaje(`${estado.mensaje} · Proyectos: ${estado.total_proyectos}`);
      })
      .catch(() => setApiMensaje("No se pudo consultar el estado de la API"));
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        label: "Proyectos monitoreados",
        value: salud?.total_proyectos ?? "—",
        icon: Gauge,
      },
      {
        label: "Estado API",
        value: apiMensaje,
        icon: ShieldCheck,
      },
    ],
    [salud, apiMensaje],
  );

  const energyTiles = [
    {
      title: "Red operativa",
      value: "28 subestaciones",
      description: "Monitoreo en tiempo real",
      icon: PlugZap,
    },
    {
      title: "Catálogo activo",
      value: "312 dispositivos",
      description: "Equipos homologados",
      icon: BatteryCharging,
    },
    {
      title: "Ingeniería en curso",
      value: "6 flujos",
      description: "Planes sincronizados",
      icon: Lightbulb,
    },
    {
      title: "Resiliencia SLA",
      value: "99.1%",
      description: "Infraestructura disponible",
      icon: Waves,
    },
  ];

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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
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
          <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30">
            Cerrar Sesión
          </Button>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <section className="grid gap-4 md:grid-cols-2">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="flex items-center gap-4 rounded-2xl border bg-background p-4 shadow-sm"
              >
                <span className="rounded-full bg-yellow-500/20 p-3 text-yellow-600">
                  <card.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-semibold text-foreground">{card.value}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {energyTiles.map((tile) => (
              <div
                key={tile.title}
                className="rounded-2xl border border-yellow-500/20 bg-card/80 p-4 shadow-sm transition hover:-translate-y-[2px]"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-yellow-500/20 p-2 text-yellow-600">
                    <tile.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tile.title}</p>
                    <p className="text-xs text-muted-foreground">{tile.description}</p>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">{tile.value}</p>
              </div>
            ))}
          </section>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
