import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2, Save, Box, Settings2 } from "lucide-react";
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
    const [tag, setTag] = useState("");
    const [valoresVariables, setValoresVariables] = useState<Record<number, string>>({});

    useEffect(() => {
        setLoading(true);
        getInstanciaDetalle(instanciaId)
            .then(async (inst) => {
                setInstancia(inst);
                setTag(inst.tag_dispositivo || "");

                const mapaValores: Record<number, string> = {};
                (inst.atributos_set || []).forEach((attr: any) => {
                    if (attr.atributo) mapaValores[attr.atributo] = attr.valor;
                });
                setValoresVariables(mapaValores);

                try {
                    const cat = await getCatalogoDetalle(inst.catalogo);
                    setCatalogoItem(cat);
                } catch (e) {
                    console.error("Error cargando catalogo", e);
                }
            })
            .finally(() => setLoading(false));
    }, [instanciaId]);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const atributosArray = Object.entries(valoresVariables).map(([idAttr, val]) => ({
                atributo: Number(idAttr),
                valor: val,
            }));

            const payload: Partial<InstanciaPayload> = {
                tag_dispositivo: tag,
                atributos_set: atributosArray,
            };

            const updated = await updateInstancia(instanciaId, payload);
            onUpdate(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Eliminar esta instancia?")) return;
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

    if (loading || !instancia) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
        );
    }

    const funcionesActivas = useMemo(
        () => masterFunciones.filter((f) => instancia.funciones_usadas.includes(f.id)),
        [instancia.funciones_usadas, masterFunciones],
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        {instancia.nombre_dispositivo}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {instancia.marca_dispositivo} - {catalogoItem?.modelo}
                    </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                    <Trash2 className="h-4 w-4 mr-2" /> Borrar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-primary h-fit">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Settings2 className="h-4 w-4" /> Configuracion de Instalacion
                        </CardTitle>
                        <CardDescription>Datos unicos de este equipo fisico.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="edit-form" onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>TAG / Identificador</Label>
                                <Input value={tag} onChange={(e) => setTag(e.target.value)} />
                            </div>
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
                    <CardContent className="pt-0">
                        <Button form="edit-form" type="submit" disabled={saving} className="w-full">
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Box className="h-4 w-4" /> Especificaciones de Fabrica
                            </CardTitle>
                            <CardDescription>Valores fijos del modelo (Solo lectura).</CardDescription>
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
                                <p className="text-xs text-muted-foreground italic">
                                    No hay especificaciones tecnicas cargadas en el catalogo.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Funciones Habilitadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {funcionesActivas.map((f) => (
                                    <Badge key={f.id} variant="secondary">
                                        {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                        {f.nombre}
                                    </Badge>
                                ))}
                                {funcionesActivas.length === 0 && (
                                    <span className="text-xs text-muted-foreground">Ninguna</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            <div className="flex justify-end">
                <Button variant="outline" onClick={onCerrar}>
                    Cerrar
                </Button>
            </div>
        </div>
    );
}
