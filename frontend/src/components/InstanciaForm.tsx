import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    crearInstancia,
    type InstanciaDispositivo,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type InstanciaPayload,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    onInstanciaCreada: (instancia: InstanciaDispositivo) => void;
    onAbrirModalCatalogo: () => void;
    onAbrirModalEditarFunciones: (id: number) => void;
};

export function InstanciaForm({
    proyectoId,
    catalogo,
    masterFunciones,
    onInstanciaCreada,
    onAbrirModalCatalogo,
    onAbrirModalEditarFunciones,
}: Props) {
    const [catalogoId, setCatalogoId] = useState("");
    const [tag, setTag] = useState("");
    const [atributos, setAtributos] = useState("{}");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [busquedaFuncion, setBusquedaFuncion] = useState("");

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));
            const idsSoportados = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => idsSoportados.includes(f.id)));
        } else {
            setFuncionesDisponibles([]);
        }
        setFuncionesUsadasIds([]);
        setBusquedaFuncion("");
    }, [catalogoId, catalogo, masterFunciones]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!catalogoId) return;
        setCargando(true);
        setError(null);
        try {
            JSON.parse(atributos);
            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                tag_dispositivo: tag,
                atributos,
                funciones_usadas: funcionesUsadasIds,
            };
            const nueva = await crearInstancia(payload);
            onInstanciaCreada(nueva);
            setTag("");
            setAtributos("{}");
            setFuncionesUsadasIds([]);
            setCatalogoId("");
            setBusquedaFuncion("");
        } catch (err: any) {
            setError(err.message || "Error al anadir instancia.");
        } finally {
            setCargando(false);
        }
    };

    const funcionesFiltradas = useMemo(() => {
        const term = busquedaFuncion.trim().toLowerCase();
        return funcionesDisponibles.filter((f) =>
            `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(term),
        );
    }, [funcionesDisponibles, busquedaFuncion]);

    const toggleFuncion = (id: number) => {
        setFuncionesUsadasIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5" /> Carga Individual (1 a 1)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form id="single-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="grid gap-2 md:col-span-2">
                        <Label>Dispositivo del Catalogo</Label>
                        <div className="flex gap-2">
                            <Select value={catalogoId} onValueChange={setCatalogoId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Seleccionar Dispositivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogo.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {(d as any).marca_nombre || `Marca #${d.marca}`} {d.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={onAbrirModalCatalogo}
                                title="Crear Nuevo en Catalogo"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>TAG del Dispositivo</Label>
                        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ej: REL-001" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Atributos (JSON)</Label>
                        <Textarea
                            value={atributos}
                            onChange={(e) => setAtributos(e.target.value)}
                            rows={4}
                            className="font-mono text-xs"
                        />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <div className="flex items-center justify-between gap-2">
                            <Label>Funciones a habilitar</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => onAbrirModalEditarFunciones(Number(catalogoId))}
                                disabled={!catalogoId}
                                title="Editar funciones soportadas del catalogo"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid gap-2 rounded-md border bg-muted/40 p-3">
                            <Input
                                placeholder="Buscar por nombre o codigo..."
                                value={busquedaFuncion}
                                onChange={(e) => setBusquedaFuncion(e.target.value)}
                                disabled={!catalogoId || funcionesDisponibles.length === 0}
                            />
                            <div className="max-h-44 overflow-y-auto space-y-1">
                                {!catalogoId && (
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona un dispositivo para ver funciones.
                                    </p>
                                )}
                                {catalogoId && funcionesDisponibles.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Este dispositivo no tiene funciones soportadas.
                                    </p>
                                )}
                                {catalogoId &&
                                    funcionesDisponibles.length > 0 &&
                                    (funcionesFiltradas.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No hay coincidencias con el filtro.
                                        </p>
                                    ) : (
                                        funcionesFiltradas.map((f) => (
                                            <label
                                                key={f.id}
                                                className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-background"
                                            >
                                                <Checkbox
                                                    checked={funcionesUsadasIds.includes(f.id)}
                                                    onCheckedChange={() => toggleFuncion(f.id)}
                                                />
                                                <div className="leading-tight">
                                                    <div className="font-medium text-sm">
                                                        {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                                        {f.nombre}
                                                    </div>
                                                    {f.descripcion && (
                                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                                            {f.descripcion}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))
                                    ))}
                            </div>
                        </div>
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="single-form" type="submit" disabled={cargando} className="w-full">
                    {cargando ? "Anadiendo..." : "Anadir Instancia"}
                </Button>
            </CardFooter>
        </Card>
    );
}
