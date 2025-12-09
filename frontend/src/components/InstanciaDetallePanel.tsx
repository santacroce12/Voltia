import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Loader2, Box, Settings2 } from "lucide-react";
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
    const [valoresVariables, setValoresVariables] = useState<Record<number, string>>({});
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);
    const [busquedaFuncion, setBusquedaFuncion] = useState("");

    const funcionesActivas = useMemo(
        () => masterFunciones.filter((f) => funcionesSeleccionadas.includes(f.id)),
        [funcionesSeleccionadas, masterFunciones],
    );

    const funcionesFiltradas = useMemo(
        () =>
            masterFunciones.filter((f) =>
                `${f.codigo_funcion || ""} ${f.nombre}`.toLowerCase().includes(busquedaFuncion.toLowerCase()),
            ),
        [masterFunciones, busquedaFuncion],
    );

    useEffect(() => {
        setLoading(true);
        getInstanciaDetalle(instanciaId)
            .then(async (inst) => {
                setInstancia(inst);

                const mapaValores: Record<number, string> = {};
                (inst.atributos_set || []).forEach((attr: any) => {
                    if (attr.atributo) mapaValores[attr.atributo] = attr.valor;
                });
                setValoresVariables(mapaValores);
                setFuncionesSeleccionadas(inst.funciones_usadas || []);

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
                atributos_set: atributosArray,
                funciones_usadas: funcionesSeleccionadas,
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

    return (
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        {instancia.nombre_dispositivo || "Detalle de dispositivo"}
                    </h2>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>ID #{instancia.id} · {instancia.marca_dispositivo} · Modelo {catalogoItem?.modelo}</p>
                        <p className="text-xs">
                            Proyecto: {instancia.nombre_proyecto ?? "N/D"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                        <Trash2 className="h-4 w-4 mr-2" /> Borrar este dispositivo
                    </Button>
                    <Button variant="outline" size="sm" onClick={onCerrar}>
                        Cerrar
                    </Button>
                </div>
            </div>

            <Separator />

            <Card className="border-l-4 border-l-primary bg-card/60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Settings2 className="h-4 w-4" /> Configuración de Instalación
                    </CardTitle>
                    <CardDescription>Datos editables de este equipo físico.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="edit-form" onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold">Atributos Variables</Label>
                            <DynamicAttributeForm
                                todosLosAtributos={masterAtributos}
                                valores={valoresVariables}
                                onChange={setValoresVariables}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold">Funciones habilitadas</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Buscar funcion..."
                                    value={busquedaFuncion}
                                    onChange={(e) => setBusquedaFuncion(e.target.value)}
                                    className="max-w-xs"
                                    disabled={masterFunciones.length === 0}
                                />
                            </div>
                            <div className="max-h-40 overflow-y-auto rounded-md border bg-muted/30 p-2 space-y-1">
                                {masterFunciones.length === 0 && (
                                    <p className="text-xs text-muted-foreground px-1">No hay funciones disponibles.</p>
                                )}
                                {masterFunciones.length > 0 && funcionesFiltradas.length === 0 && (
                                    <p className="text-xs text-muted-foreground px-1">Sin coincidencias.</p>
                                )}
                                {funcionesFiltradas.map((f) => (
                                    <label
                                        key={f.id}
                                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-background text-sm"
                                    >
                                        <Checkbox
                                            checked={funcionesSeleccionadas.includes(f.id)}
                                            onCheckedChange={() =>
                                                setFuncionesSeleccionadas((prev) =>
                                                    prev.includes(f.id)
                                                        ? prev.filter((id) => id !== f.id)
                                                        : [...prev, f.id],
                                                )
                                            }
                                        />
                                        <span>
                                            {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                            {f.nombre}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardContent className="pt-0">
                    <Button form="edit-form" type="submit" disabled={saving} className="w-full">
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Funciones Habilitadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {funcionesActivas.map((f) => (
                            <span
                                key={f.id}
                                className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                            >
                                {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                {f.nombre}
                            </span>
                        ))}
                        {funcionesActivas.length === 0 && (
                            <span className="text-xs text-muted-foreground">Ninguna</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
