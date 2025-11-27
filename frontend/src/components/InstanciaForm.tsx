import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import {
    crearInstancia,
    type InstanciaDispositivo,
    type CatalogoDispositivo,
    type FuncionDispositivo,
    type InstanciaPayload,
    listarAtributosMaestros,
    type AtributoMaestro,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicAttributeForm } from "@/components/DynamicAttributeForm";

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
    const [valoresEAV, setValoresEAV] = useState<Record<number, string>>({});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [funcionesDisponibles, setFuncionesDisponibles] = useState<FuncionDispositivo[]>([]);
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);

    useEffect(() => {
        if (catalogoId) {
            const disp = catalogo.find((d) => d.id === Number(catalogoId));
            const idsSoportados = disp?.funciones_soportadas || [];
            setFuncionesDisponibles(masterFunciones.filter((f) => idsSoportados.includes(f.id)));
        } else {
            setFuncionesDisponibles([]);
        }
        setFuncionesUsadasIds([]);
    }, [catalogoId, catalogo, masterFunciones]);

    useEffect(() => {
        listarAtributosMaestros().then(setAtributosMaestros).catch(console.error);
    }, []);

    const definicionesFiltradas = (() => {
        const disp = catalogo.find((d) => d.id === Number(catalogoId));
        if (!disp) return [];
        if (!disp.atributos_sugeridos || disp.atributos_sugeridos.length === 0) return [];
        return atributosMaestros.filter((a) => disp.atributos_sugeridos.includes(a.id));
    })();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!catalogoId) return;
        setCargando(true);
        setError(null);

        try {
            const atributosArray = Object.entries(valoresEAV).map(([idAttr, val]) => ({
                atributo: Number(idAttr),
                valor: val,
            }));

            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                tag_dispositivo: tag,
                atributos_set: atributosArray,
                funciones_usadas: funcionesUsadasIds,
            };

            const nueva = await crearInstancia(payload);
            onInstanciaCreada(nueva);

            setTag("");
            setValoresEAV({});
            setFuncionesUsadasIds([]);
            setCatalogoId("");
        } catch (err: any) {
            setError(err.message || "Error al añadir instancia.");
        } finally {
            setCargando(false);
        }
    };

    const handleFuncionesChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const opts = Array.from(e.target.selectedOptions, (o) => Number(o.value));
        setFuncionesUsadasIds(opts);
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
                        <Label>Dispositivo del Catálogo</Label>
                        <div className="flex gap-2">
                            <Select value={catalogoId} onValueChange={setCatalogoId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Seleccionar Dispositivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogo.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.marca_nombre ? `${d.marca_nombre} - ` : ""} {d.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={onAbrirModalCatalogo}
                                title="Crear Nuevo en Catálogo"
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
                        <Label>Atributos Variables</Label>
                        <DynamicAttributeForm definiciones={definicionesFiltradas} valores={valoresEAV} onChange={setValoresEAV} />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <Label>Funciones a Habilitar (Usadas)</Label>
                        <div className="flex gap-2 items-start">
                            <select
                                multiple
                                className={cn(
                                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50",
                                    !catalogoId && "bg-muted",
                                )}
                                value={funcionesUsadasIds.map(String)}
                                onChange={handleFuncionesChange}
                                disabled={!catalogoId || funcionesDisponibles.length === 0}
                            >
                                {funcionesDisponibles.length === 0 && catalogoId && (
                                    <option disabled>Este dispositivo no tiene funciones soportadas</option>
                                )}
                                {funcionesDisponibles.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                        {f.nombre}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => onAbrirModalEditarFunciones(Number(catalogoId))}
                                disabled={!catalogoId}
                                title="Editar Soportadas en Catálogo"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="single-form" type="submit" disabled={cargando} className="w-full">
                    {cargando ? "Añadiendo..." : "Añadir Instancia"}
                </Button>
            </CardFooter>
        </Card>
    );
}
