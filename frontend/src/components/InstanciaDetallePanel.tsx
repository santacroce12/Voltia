import { useState, useEffect, useMemo, type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Loader2, Save, Settings2, Edit2 } from "lucide-react";
import {
    getInstanciaDetalle,
    updateInstancia,
    borrarInstancia,
    getCatalogoDetalle,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type FuncionDispositivo,
    type AtributoMaestro,
    type CatalogoDispositivo,
} from "../services/api";
import { DynamicAttributeForm } from "./DynamicAttributeForm";
import { EditarFuncionesModal } from "./EditarFuncionesModal";

type Props = {
    instanciaId: number;
    masterFunciones: FuncionDispositivo[];
    masterAtributos: AtributoMaestro[];
    onCerrar: () => void;
    onUpdate: (updatedInstance: InstanciaDispositivo) => void;
    onDelete: (deletedId: number) => void;
};

export function InstanciaDetallePanel({ instanciaId, masterFunciones, masterAtributos, onCerrar, onUpdate, onDelete }: Props) {
    const [instancia, setInstancia] = useState<InstanciaDispositivo | null>(null);
    const [catalogoItem, setCatalogoItem] = useState<CatalogoDispositivo | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tag, setTag] = useState("");
    const [valoresVariables, setValoresVariables] = useState<Record<number, string>>({});
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [modalFuncionesOpen, setModalFuncionesOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        getInstanciaDetalle(instanciaId)
            .then(async (inst) => {
                setInstancia(inst);
                setTag(inst.tag_dispositivo || "");
                setFuncionesUsadasIds(inst.funciones_usadas || []);

                const mapaValores: Record<number, string> = {};
                if (inst.atributos_set) {
                    inst.atributos_set.forEach((attr: any) => {
                        mapaValores[attr.atributo] = attr.valor;
                    });
                }
                setValoresVariables(mapaValores);

                try {
                    const cat = await getCatalogoDetalle(inst.catalogo);
                    setCatalogoItem(cat);
                } catch (e) {
                    console.error("Error cargando catálogo", e);
                }
            })
            .catch(() => setError("Error cargando detalles."))
            .finally(() => setLoading(false));
    }, [instanciaId]);

    const funcionesDisponibles = useMemo(() => {
        if (!catalogoItem) return [];
        const soportadas = catalogoItem.funciones_soportadas || [];
        return masterFunciones.filter((f) => soportadas.includes(f.id));
    }, [catalogoItem, masterFunciones]);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const atributosArray = Object.entries(valoresVariables).map(([idAttr, val]) => ({
                atributo: Number(idAttr),
                valor: val,
            }));

            const payload: Partial<InstanciaPayload> = {
                tag_dispositivo: tag,
                atributos_set: atributosArray,
                funciones_usadas: funcionesUsadasIds,
            };

            const updated = await updateInstancia(instanciaId, payload);
            onUpdate(updated);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Eliminar esta instancia?")) return;
        setSaving(true);
        try {
            await borrarInstancia(instanciaId);
            onDelete(instanciaId);
            onCerrar();
        } catch (e) {
            console.error(e);
            setSaving(false);
        }
    };

    const handleFuncionesChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const opts = Array.from(e.target.selectedOptions, (o) => Number(o.value));
        setFuncionesUsadasIds(opts);
    };

    const handleCatalogoUpdated = (catActualizado: CatalogoDispositivo) => {
        setCatalogoItem(catActualizado);
    };

    if (loading || !instancia) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">{instancia.nombre_dispositivo}</h2>
                    <p className="text-sm text-muted-foreground">
                        {instancia.marca_dispositivo} • {catalogoItem?.modelo}
                    </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                    <Trash2 className="h-4 w-4 mr-2" /> Borrar
                </Button>
            </div>

            {error && <p className="text-destructive text-sm bg-destructive/10 p-2 rounded">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-primary h-fit">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Settings2 className="h-4 w-4" /> Configuración
                        </CardTitle>
                        <CardDescription>Datos técnicos y funciones de esta instancia.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="edit-form" onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>TAG / Identificador</Label>
                                <Input value={tag} onChange={(e) => setTag(e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Funciones Habilitadas (Ctrl+Click)</Label>
                                <div className="flex gap-2 items-start">
                                    <select
                                        multiple
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={funcionesUsadasIds.map(String)}
                                        onChange={handleFuncionesChange}
                                    >
                                        {funcionesDisponibles.length === 0 && <option disabled>No hay funciones soportadas.</option>}
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
                                        onClick={() => setModalFuncionesOpen(true)}
                                        title="Modificar funciones soportadas (Catálogo)"
                                        className="shrink-0"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    * Modificar las soportadas afecta a todos los dispositivos de este modelo.
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-2">
                                <Label>Atributos Variables</Label>
                                <DynamicAttributeForm
                                    todosLosAtributos={masterAtributos}
                                    valores={valoresVariables}
                                    onChange={setValoresVariables}
                                />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <Button form="edit-form" type="submit" disabled={saving} className="w-full">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Especificaciones de Fábrica</CardTitle>
                            <CardDescription>Valores fijos del modelo {catalogoItem?.modelo}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {catalogoItem?.especificaciones_set && catalogoItem.especificaciones_set.length > 0 ? (
                                <div className="grid gap-2">
                                    {catalogoItem.especificaciones_set.map((spec: any) => (
                                        <div key={spec.id} className="flex justify-between text-sm border-b pb-1 last:border-0">
                                            <span className="text-muted-foreground">{spec.nombre_atributo}:</span>
                                            <span className="font-medium">
                                                {spec.valor} {spec.unidad_atributo}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No hay especificaciones técnicas cargadas.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <EditarFuncionesModal
                isOpen={modalFuncionesOpen}
                onClose={() => setModalFuncionesOpen(false)}
                dispositivo={catalogoItem}
                masterFunciones={masterFunciones}
                onUpdateExitoso={handleCatalogoUpdated}
            />
        </div>
    );
}
