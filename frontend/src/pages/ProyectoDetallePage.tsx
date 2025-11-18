import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarServicios,
    crearServicio,
    listarUrls,
    crearUrl,
    listarProyectos,
    type ServicioProyecto,
    type ServicioPayload,
    type UrlExterna,
    type Proyecto,
} from "../services/api";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, ExternalLink, FileText, Briefcase, Clock } from "lucide-react";

export function ProyectoDetallePage() {
    const { proyectoId } = useParams<{ proyectoId: string }>();
    const pid = Number(proyectoId);

    const [servicios, setServicios] = useState<ServicioProyecto[]>([]);
    const [urls, setUrls] = useState<UrlExterna[]>([]);
    const [svcItem, setSvcItem] = useState("");
    const [svcHoras, setSvcHoras] = useState("");
    const [urlTipo, setUrlTipo] = useState("");
    const [urlLink, setUrlLink] = useState("");
    const [obraId, setObraId] = useState<number | null>(null);
    const [cargando, setCargando] = useState(false);
    const [cargandoInicial, setCargandoInicial] = useState(true);

    useEffect(() => {
        if (!pid) return;
        Promise.all([listarServicios(pid), listarUrls(pid), listarProyectos()])
            .then(([s, u, proyectos]) => {
                setServicios(s);
                setUrls(u);
                const proyectoActual = (proyectos as Proyecto[]).find((p) => p.id === pid);
                if (proyectoActual) {
                    setObraId(proyectoActual.obra);
                } else if (s.length > 0) {
                    setObraId(s[0].obra);
                }
            })
            .catch((error) => console.error("Error cargando datos del proyecto:", error))
            .finally(() => setCargandoInicial(false));
    }, [pid]);

    const handleServicioSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!obraId) return;
        setCargando(true);
        try {
            const payload: ServicioPayload = {
                proyecto: pid,
                obra: obraId,
                item_servicio: svcItem,
                horas_estimadas: Number(svcHoras) || 0,
            };
            const nuevo = await crearServicio(payload);
            setServicios((prev) => [...prev, nuevo]);
            setSvcItem("");
            setSvcHoras("");
        } catch (error) {
            console.error("Error creando servicio:", error);
        } finally {
            setCargando(false);
        }
    };

    const handleUrlSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        try {
            const nueva = await crearUrl({ proyecto: pid, tipo_enlace: urlTipo, url: urlLink });
            setUrls((prev) => [...prev, nueva]);
            setUrlTipo("");
            setUrlLink("");
        } catch (error) {
            console.error("Error creando URL:", error);
        } finally {
            setCargando(false);
        }
    };

    if (cargandoInicial) {
        return <div className="p-6 text-muted-foreground">Cargando proyecto...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/proyectos">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestion del Proyecto #{pid}</h2>
                    <p className="text-muted-foreground">Administracion de recursos, servicios y documentacion tecnica.</p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="flex flex-col h-full border-l-4 border-l-yellow-500">
                    <CardHeader className="bg-muted/10 pb-3">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-yellow-600" />
                            <CardTitle className="text-lg">Servicios e Ingenieria</CardTitle>
                        </div>
                        <CardDescription>Detalle de items y horas estimadas.</CardDescription>
                    </CardHeader>

                    <div className="p-4 border-b bg-background">
                        <form onSubmit={handleServicioSubmit} className="flex gap-3 items-end">
                            <div className="grid gap-1.5 flex-1">
                                <Label htmlFor="svc" className="text-xs">
                                    Item / Tarea
                                </Label>
                                <Input
                                    id="svc"
                                    value={svcItem}
                                    onChange={(e) => setSvcItem(e.target.value)}
                                    placeholder="Ej: Configuracion"
                                    required
                                    className="h-9"
                                />
                            </div>
                            <div className="grid gap-1.5 w-24">
                                <Label htmlFor="hrs" className="text-xs">
                                    Horas
                                </Label>
                                <Input
                                    id="hrs"
                                    type="number"
                                    value={svcHoras}
                                    onChange={(e) => setSvcHoras(e.target.value)}
                                    placeholder="0"
                                    className="h-9"
                                />
                            </div>
                            <Button type="submit" disabled={cargando || !obraId} size="sm" className="h-9 w-9 p-0 shrink-0">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </form>
                        {!obraId && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Cargando informacion del proyecto para asignar la obra...
                            </p>
                        )}
                    </div>

                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Descripcion</TableHead>
                                        <TableHead className="text-right w-[100px]">
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            Hs
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {servicios.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground h-32">
                                                No se han cargado servicios.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        servicios.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-medium">{s.item_servicio}</TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">
                                                    {s.horas_estimadas}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full border-l-4 border-l-blue-500">
                    <CardHeader className="bg-muted/10 pb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">Planos y Documentacion</CardTitle>
                        </div>
                        <CardDescription>Repositorio de enlaces externos.</CardDescription>
                    </CardHeader>

                    <div className="p-4 border-b bg-background">
                        <form onSubmit={handleUrlSubmit} className="flex gap-3 items-end">
                            <div className="grid gap-1.5 w-1/3">
                                <Label htmlFor="tipo" className="text-xs">
                                    Tipo Doc.
                                </Label>
                                <Input
                                    id="tipo"
                                    value={urlTipo}
                                    onChange={(e) => setUrlTipo(e.target.value)}
                                    placeholder="Plano"
                                    required
                                    className="h-9"
                                />
                            </div>
                            <div className="grid gap-1.5 flex-1">
                                <Label htmlFor="url" className="text-xs">
                                    URL
                                </Label>
                                <Input
                                    id="url"
                                    type="url"
                                    value={urlLink}
                                    onChange={(e) => setUrlLink(e.target.value)}
                                    placeholder="https://..."
                                    required
                                    className="h-9"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={cargando}
                                size="sm"
                                className="h-9 w-9 p-0 shrink-0 bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>

                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Documento</TableHead>
                                        <TableHead className="text-right w-[100px]">Accion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {urls.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground h-32">
                                                No hay documentacion adjunta.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        urls.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">{u.tipo_enlace}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                    >
                                                        <a href={u.url} target="_blank" rel="noreferrer">
                                                            Abrir <ExternalLink className="ml-1 h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
