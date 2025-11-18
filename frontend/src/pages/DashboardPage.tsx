import { useEffect, useState, useMemo } from "react";
import { 
    listarProyectos, listarObras, listarClientes, 
    type Proyecto, type Obra, type Cliente 
} from "../services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from "recharts";
import { Building, ClipboardList, Users, Activity } from "lucide-react";

// Colores del tema (Amarillo Voltia y variantes para graficos)
const COLORS = ["#EAB308", "#3B82F6", "#22C55E", "#EF4444", "#A855F7"];

export function DashboardPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [obras, setObras] = useState<Obra[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([listarProyectos(), listarObras(), listarClientes()])
            .then(([dataProyectos, dataObras, dataClientes]) => {
                setProyectos(dataProyectos);
                setObras(dataObras);
                setClientes(dataClientes);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const obrasPorEstado = useMemo(() => {
        const stats: Record<string, number> = { pendiente: 0, realizada: 0, rechazada: 0 };
        obras.forEach(obra => {
            const estado = obra.estado_obra.toLowerCase();
            if (stats[estado] !== undefined) stats[estado]++;
            else stats[estado] = 1;
        });
        return Object.keys(stats).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: stats[key]
        }));
    }, [obras]);

    const proyectosPorTipo = useMemo(() => {
        const stats: Record<string, number> = {};
        proyectos.forEach(p => {
            const tipo = p.tipo;
            if (stats[tipo]) stats[tipo]++;
            else stats[tipo] = 1;
        });
        return Object.keys(stats).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            cantidad: stats[key]
        }));
    }, [proyectos]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando tablero de control...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tablero de Control</h2>
                <p className="text-muted-foreground">Resumen operativo del sistema Voltia.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Obras" value={obras.length} subtitle="Registradas en el sistema" icon={Building} />
                <MetricCard title="Total Proyectos" value={proyectos.length} subtitle="En todas las etapas" icon={ClipboardList} />
                <MetricCard title="Clientes Activos" value={clientes.length} subtitle="Cartera actual" icon={Users} />
                <MetricCard 
                    title="Eficiencia"
                    value={obras.length > 0 
                        ? `${Math.round((obras.filter(o => o.estado_obra === 'realizada').length / obras.length) * 100)}%`
                        : "0%"}
                    subtitle="Tasa de obras realizadas"
                    icon={Activity}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Tipologia de Proyectos</CardTitle>
                        <CardDescription>Distribucion de proyectos segun su especialidad tecnica.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={proyectosPorTipo}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="cantidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Estado de Obras</CardTitle>
                        <CardDescription>Panorama general del avance de obras.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={obrasPorEstado} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {obrasPorEstado.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, subtitle, icon: Icon }: { title: string; value: string | number; subtitle: string; icon: any }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
        </Card>
    );
}
