import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    crearInstancia,
    type CatalogoDispositivo,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type FuncionDispositivo,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    onInstanciasCreadas: (instancias: InstanciaDispositivo[]) => void;
};

export function BatchInstanciaForm({ proyectoId, catalogo, masterFunciones, onInstanciasCreadas }: Props) {
    const [catalogoId, setCatalogoId] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [tagBase, setTagBase] = useState("DEV");
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

    const funcionesFiltradas = useMemo(() => {
        const term = busquedaFuncion.trim().toLowerCase();
        return funcionesDisponibles.filter((f) =>
            `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(term),
        );
    }, [funcionesDisponibles, busquedaFuncion]);

    const toggleFuncion = (id: number) => {
        setFuncionesUsadasIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!catalogoId) return;

        setCargando(true);
        setError(null);

        const promesas: Promise<InstanciaDispositivo>[] = [];

        for (let i = 0; i < cantidad; i++) {
            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                tag_dispositivo: `${tagBase}-${String(i + 1).padStart(3, "0")}`,
                atributos: "{}",
                funciones_usadas: funcionesUsadasIds,
            };
            promesas.push(crearInstancia(payload));
        }

        try {
            const nuevasInstancias = await Promise.all(promesas);
            onInstanciasCreadas(nuevasInstancias);
            setTagBase("DEV");
            setCantidad(1);
            setCatalogoId("");
            setFuncionesUsadasIds([]);
            setBusquedaFuncion("");
        } catch (err: any) {
            setError("Error en la carga en lote: " + err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle className="text-base">Carga en Lote</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="batch-form" className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Dispositivo</Label>
                        <Select value={catalogoId} onValueChange={setCatalogoId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {catalogo.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {(d as any).marca_nombre || `Marca #${d.marca}`} {d.modelo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Cantidad</Label>
                            <Input
                                type="number"
                                min="1"
                                max="50"
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>TAG Base</Label>
                            <Input value={tagBase} onChange={(e) => setTagBase(e.target.value)} placeholder="Ej: REL" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Funciones a habilitar</Label>
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
                                        <p className="text-sm text-muted-foreground">No hay coincidencias con el filtro.</p>
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
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="batch-form" variant="secondary" type="submit" disabled={cargando} className="w-full">
                    {cargando ? `Anadiendo...` : `Generar Lote (${cantidad})`}
                </Button>
            </CardFooter>
        </Card>
    );
}
