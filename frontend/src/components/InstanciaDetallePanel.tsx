import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Save, Settings2, Edit2, Users, User } from "lucide-react";
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
    instancias: InstanciaDispositivo[];
    masterFunciones: FuncionDispositivo[];
    masterAtributos: AtributoMaestro[];
    onCerrar: () => void;
    onUpdate: (updatedInstance: InstanciaDispositivo) => void;
    onDelete: (deletedId: number) => void;
};

export function InstanciaDetallePanel({ instancias, masterFunciones, masterAtributos, onCerrar, onUpdate, onDelete }: Props) {
    const instanciaRef = instancias[0];
    const esGrupo = instancias.length > 1;

    const [instancia, setInstancia] = useState<InstanciaDispositivo | null>(null);
    const [catalogoItem, setCatalogoItem] = useState<CatalogoDispositivo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [valoresVariables, setValoresVariables] = useState<Record<number, string>>({});
    const [funcionesUsadasIds, setFuncionesUsadasIds] = useState<number[]>([]);
    const [modoEdicion, setModoEdicion] = useState<"todos" | "unico" | "parcial">("todos");
    const [cantidadParcial, setCantidadParcial] = useState<number>(2);
    const [modalFuncionesOpen, setModalFuncionesOpen] = useState(false);

    useEffect(() => {
        if (!instanciaRef) return;
        setLoading(true);
        getInstanciaDetalle(instanciaRef.id)
            .then(async (inst) => {
                setInstancia(inst);
                setFuncionesUsadasIds(inst.funciones_usadas || []);

                const mapaValores: Record<number, string> = {};
                inst.atributos_set?.forEach((attr: any) => {
                    mapaValores[attr.atributo] = attr.valor;
                });
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
    }, [instanciaRef]);

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

            const todosIds = instancias.map((inst) => inst.id);
            let idsAActualizar = [instanciaRef.id];
            if (esGrupo && modoEdicion === "todos") {
                idsAActualizar = [...todosIds];
            } else if (esGrupo && modoEdicion === "parcial") {
                const ordenados = [...todosIds].sort((a, b) => a - b);
                const cantidadSeguro = Number.isFinite(cantidadParcial) ? cantidadParcial : 1;
                const limite = Math.min(Math.max(cantidadSeguro, 1), ordenados.length);
                idsAActualizar = ordenados.slice(0, limite);
            }

            if (idsAActualizar.length > 1) {
                const actualizados = await Promise.all(idsAActualizar.map((id) => updateInstancia(id, payload)));
                onUpdate(actualizados[0]);
            } else {
                const updated = await updateInstancia(idsAActualizar[0], payload);
                onUpdate(updated);
            }
            onCerrar();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const todosIds = instancias.map((inst) => inst.id);
        let idsAEliminar = [instanciaRef.id];
        if (esGrupo && modoEdicion === "todos") {
            idsAEliminar = [...todosIds];
        } else if (esGrupo && modoEdicion === "parcial") {
            const ordenados = [...todosIds].sort((a, b) => a - b);
            const cantidadSeguro = Number.isFinite(cantidadParcial) ? cantidadParcial : 1;
            const limite = Math.min(Math.max(cantidadSeguro, 1), ordenados.length);
            idsAEliminar = ordenados.slice(0, limite);
        }

        const mensaje =
            idsAEliminar.length > 1 ? `Eliminar ${idsAEliminar.length} instancias seleccionadas?` : "Eliminar esta instancia?";
        if (!confirm(mensaje)) return;

        setSaving(true);
        try {
            if (idsAEliminar.length > 1) {
                await Promise.all(idsAEliminar.map((id) => borrarInstancia(id)));
                onDelete(idsAEliminar[0]);
            } else {
                await borrarInstancia(idsAEliminar[0]);
                onDelete(idsAEliminar[0]);
            }
            onCerrar();
        } catch (e) {
            console.error(e);
            setSaving(false);
        }
    };

    const handleFuncionesChange = (checked: boolean, id: number) => {
        setFuncionesUsadasIds((prev) => (checked ? [...prev, id] : prev.filter((f) => f !== id)));
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
                    {esGrupo && (
                        <div className="mt-2 flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full w-fit">
                            <Users className="h-4 w-4" />
                            Editando grupo de <strong>{instancias.length}</strong> dispositivos
                        </div>
                    )}
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                    <Trash2 className="h-4 w-4 mr-2" /> Borrar
                </Button>
            </div>

            {error && <p className="text-destructive text-sm bg-destructive/10 p-2 rounded">{error}</p>}

            <div className="space-y-6">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Settings2 className="h-4 w-4" /> Configuración
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form id="edit-form" onSubmit={handleSave} className="space-y-4">
                            {esGrupo && (
                                <div className="bg-muted p-3 rounded-md border flex flex-wrap gap-3 items-center justify-between">
                                    <div>
                                        <Label className="text-xs uppercase text-muted-foreground font-bold">Alcance de los cambios</Label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant={modoEdicion === "todos" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setModoEdicion("todos")}
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Users className="h-4 w-4" /> Grupo ({instancias.length})
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={modoEdicion === "parcial" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setModoEdicion("parcial")}
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Users className="h-4 w-4" /> Primeros
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={modoEdicion === "unico" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setModoEdicion("unico")}
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <User className="h-4 w-4" /> Solo esta
                                        </Button>
                                    </div>
                                    {modoEdicion === "parcial" && (
                                        <div className="flex items-center gap-2 w-full">
                                            <Input
                                                type="number"
                                                min={1}
                                                max={instancias.length}
                                                value={cantidadParcial}
                                                onChange={(e) => setCantidadParcial(Number(e.target.value))}
                                                className="h-8 w-20"
                                            />
                                            <span className="text-xs text-muted-foreground">dispositivos</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Funciones Habilitadas</Label>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Activa o desactiva las funciones de esta instancia.</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setModalFuncionesOpen(true)}
                                        className="h-6 text-xs text-muted-foreground hover:text-primary"
                                    >
                                        <Edit2 className="h-3 w-3 mr-1" /> Editar Catálogo
                                    </Button>
                                </div>

                                <div className="rounded-md border p-3 min-h-[120px] overflow-y-auto bg-background space-y-2">
                                    {funcionesDisponibles.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-4">No hay funciones soportadas en el catálogo.</p>
                                    ) : (
                                        funcionesDisponibles.map((f) => (
                                            <div key={f.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`func-edit-${f.id}`}
                                                    checked={funcionesUsadasIds.includes(f.id)}
                                                    onCheckedChange={(checked) => handleFuncionesChange(Boolean(checked), f.id)}
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
                        <CardDescription>Valores base del catálogo.</CardDescription>
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
                            <p className="text-xs text-muted-foreground italic">No hay especificaciones.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EditarFuncionesModal
                isOpen={modalFuncionesOpen}
                onClose={() => setModalFuncionesOpen(false)}
                dispositivo={catalogoItem}
                masterFunciones={masterFunciones}
                onUpdateExitoso={(cat) => setCatalogoItem(cat)}
            />
        </div>
    );
}
