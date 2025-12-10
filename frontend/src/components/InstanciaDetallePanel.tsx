import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";

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

    const [valoresVariables, setValoresVariables] = useState<Record<number, string>>({});
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [modalFuncionesOpen, setModalFuncionesOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        getInstanciaDetalle(instanciaId)
            .then(async (inst) => {
                setInstancia(inst);
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
                    console.error("Error cargando catalogo", e);
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

            <div className="space-y-6">
                <Card className="border-l-4 border-l-primary h-fit">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Settings2 className="h-4 w-4" /> Configuración
                        </CardTitle>
                        <CardDescription>Datos técnicos y funciones de esta instancia.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="edit-form" onSubmit={handleSave} className="space-y-4">
                            {/* --- SECCIÓN DE FUNCIONES (CHECKBOXES) --- */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label>Funciones Habilitadas</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setModalFuncionesOpen(true)}
                                        className="h-6 text-xs text-muted-foreground hover:text-primary"
                                    >
                                        <Edit2 className="h-3 w-3 mr-1" /> Editar Funciones Soportadas
                                    </Button>
                                </div>

                                <div className="rounded-md border p-3 h-40 overflow-y-auto bg-background space-y-2">
                                    {funcionesDisponibles.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-4">
                                            No hay funciones soportadas en el catálogo.
                                        </p>
                                    ) : (
                                        funcionesDisponibles.map((f) => (
                                            <div key={f.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`func-edit-${f.id}`}
                                                    checked={funcionesUsadasIds.includes(f.id)}
                                                    onCheckedChange={(checked) => {
                                                        setFuncionesUsadasIds((prev) =>
                                                            checked ? [...prev, f.id] : prev.filter((id) => id !== f.id),
                                                        );
                                                    }}
                                                />
                                                <Label htmlFor={`func-edit-${f.id}`} className="text-sm cursor-pointer font-normal">
                                                    {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                                    {f.nombre}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">* Selecciona las funciones activas para esta instancia.</p>
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
