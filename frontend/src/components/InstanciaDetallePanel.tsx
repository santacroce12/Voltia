import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Loader2, Save, Edit } from "lucide-react";
import {
    getInstanciaDetalle,
    updateInstancia,
    borrarInstancia,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type FuncionDispositivo,
} from "../services/api";

type Props = {
    instanciaId: number;
    masterFunciones: FuncionDispositivo[];
    onCerrar: () => void;
    onUpdate: (updatedInstance: InstanciaDispositivo) => void;
    onDelete: (deletedId: number) => void;
    proyectoNombre?: string;
};

export function InstanciaDetallePanel({
    instanciaId,
    masterFunciones,
    onCerrar,
    onUpdate,
    onDelete,
    proyectoNombre,
}: Props) {
    const [instancia, setInstancia] = useState<InstanciaDispositivo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tag, setTag] = useState("");
    const [atributos, setAtributos] = useState("{}");
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);
    const [busquedaFuncion, setBusquedaFuncion] = useState("");

    useEffect(() => {
        setLoading(true);
        getInstanciaDetalle(instanciaId)
            .then((data) => {
                setInstancia(data);
                setTag(data.tag_dispositivo || "");
                setAtributos(JSON.stringify(data.atributos, null, 2));
                setFuncionesSeleccionadas(data.funciones_usadas || []);
            })
            .catch(() => setError("No se pudo cargar el detalle."))
            .finally(() => setLoading(false));
    }, [instanciaId]);

    const funcionesAsignadas = useMemo(() => {
        return masterFunciones.filter((f) => funcionesSeleccionadas.includes(f.id));
    }, [funcionesSeleccionadas, masterFunciones]);

    const funcionesFiltradas = useMemo(() => {
        const term = busquedaFuncion.toLowerCase();
        return masterFunciones.filter((f) =>
            `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(term),
        );
    }, [masterFunciones, busquedaFuncion]);

    const toggleFuncionSeleccionada = (id: number) => {
        setFuncionesSeleccionadas((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            JSON.parse(atributos);
            const payload: Partial<InstanciaPayload> = {
                tag_dispositivo: tag,
                atributos,
                funciones_usadas: funcionesSeleccionadas,
            };
            const updated = await updateInstancia(instanciaId, payload);
            setInstancia(updated);
            onUpdate(updated);
        } catch (e: any) {
            setError(e.message || "Error al guardar cambios.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Confirma la eliminación de esta instancia?")) return;
        setSaving(true);
        try {
            await borrarInstancia(instanciaId);
            onDelete(instanciaId);
            onCerrar();
        } catch (e: any) {
            setError(e.message || "Error al borrar.");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
            </div>
        );
    }
    if (error) return <p className="text-destructive p-4">{error}</p>;
    if (!instancia) return null;

    return (
        <Card className="shadow-none border border-border bg-card">
            <CardHeader className="flex flex-row items-start justify-between gap-4 bg-muted/30 rounded-md p-4">
                <div>
                    <CardTitle className="text-2xl font-bold">
                        Detalle: {instancia.tag_dispositivo || `ID #${instancia.id}`}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {instancia.nombre_dispositivo} · {instancia.marca_dispositivo}
                    </CardDescription>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                    <Trash2 className="h-4 w-4 mr-2" /> Borrar
                </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                        <p className="text-muted-foreground font-medium">Nombre del proyecto</p>
                        <p className="font-semibold text-primary">
                            {proyectoNombre || instancia.nombre_proyecto || "Sin nombre"}
                        </p>
                    </div>
                </div>

                <Separator />

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Editar atributos</h3>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inst-tag">TAG del dispositivo</Label>
                        <Input id="inst-tag" value={tag} onChange={(e) => setTag(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inst-atributos">Atributos únicos (JSON)</Label>
                        <Textarea
                            id="inst-atributos"
                            value={atributos}
                            onChange={(e) => setAtributos(e.target.value)}
                            rows={5}
                            className="font-mono text-sm"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <CardFooter className="p-0 flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Guardar Cambios
                        </Button>
                    </CardFooter>
                </form>

                <Separator />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            Funciones Asignadas ({funcionesSeleccionadas.length})
                        </h3>
                        <Input
                            placeholder="Buscar función..."
                            value={busquedaFuncion}
                            onChange={(e) => setBusquedaFuncion(e.target.value)}
                            className="w-56"
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-md border border-border p-3 space-y-2 bg-background">
                        {funcionesFiltradas.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay funciones que coincidan.</p>
                        ) : (
                            funcionesFiltradas.map((f) => (
                                <label key={f.id} className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={funcionesSeleccionadas.includes(f.id)}
                                        onCheckedChange={() => toggleFuncionSeleccionada(f.id)}
                                    />
                                    <span>
                                        {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                        {f.nombre}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {funcionesAsignadas.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Ninguna función marcada para uso.</p>
                        ) : (
                            funcionesAsignadas.map((f) => (
                                <span
                                    key={f.id}
                                    className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                                >
                                    {f.codigo_funcion ? `${f.codigo_funcion} ` : ""}
                                    {f.nombre}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
