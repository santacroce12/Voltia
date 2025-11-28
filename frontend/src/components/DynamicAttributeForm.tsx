import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { type AtributoMaestro } from "../services/api";

type Props = {
    todosLosAtributos: AtributoMaestro[];
    sugeridosIds: number[];
    valores: Record<number, string>;
    onChange: (nuevosValores: Record<number, string>) => void;
};

export function DynamicAttributeForm({ todosLosAtributos, sugeridosIds, valores, onChange }: Props) {
    const listaAtributos = todosLosAtributos ?? [];
    const sugeridos = sugeridosIds ?? [];
    const [camposVisibles, setCamposVisibles] = useState<number[]>([]);

    useEffect(() => {
        const conValor = Object.keys(valores).map(Number);
        const iniciales = Array.from(new Set([...sugeridos, ...conValor]));
        setCamposVisibles(iniciales);
    }, [sugeridos, valores]);

    const handleChange = (id: number, valor: string) => {
        onChange({ ...valores, [id]: valor });
    };

    const handleAgregarCampo = (idStr: string) => {
        const id = Number(idStr);
        if (id && !camposVisibles.includes(id)) {
            setCamposVisibles([...camposVisibles, id]);
        }
    };

    const handleQuitarCampo = (id: number) => {
        setCamposVisibles((prev) => prev.filter((i) => i !== id));
        const nuevosValores = { ...valores };
        delete nuevosValores[id];
        onChange(nuevosValores);
    };

    const atributosVisibles = listaAtributos.filter((a) => camposVisibles.includes(a.id));
    const opcionesDisponibles = listaAtributos
        .filter((a) => !camposVisibles.includes(a.id))
        .map((a) => ({ value: String(a.id), label: a.nombre }));

    if (listaAtributos.length === 0)
        return <p className="text-xs text-muted-foreground">No hay atributos definidos en el sistema.</p>;

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/5">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-primary">Datos Técnicos (Especificaciones fijas)</h4>
                    <button
                        type="button"
                        className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 border border-primary/40 flex items-center justify-center"
                        title="AquÃ­ CARGAS UN VALOR. Concepto: Son datos que NUNCA CAMBIAN para este modelo. Ejemplo: Si estÃ¡s creando el 'RelÃ© P5', la Potencia siempre serÃ¡ 100W."
                        onClick={() =>
                            alert(
                                "AquÃ­ CARGAS UN VALOR.\nConcepto: Son datos que NUNCA CAMBIAN para este modelo.\nEjemplo: Si estÃ¡s creando el 'RelÃ© P5', la Potencia siempre serÃ¡ 100W."
                            )
                        }
                    >
                        ?
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {atributosVisibles.map((attr) => (
                    <div key={attr.id} className="flex items-end gap-2">
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                                {attr.nombre} {attr.unidad ? `(${attr.unidad})` : ""}
                            </Label>

                            {attr.tipo_dato === "bool" ? (
                                <div className="flex items-center h-9">
                                    <Checkbox
                                        checked={valores[attr.id] === "true"}
                                        onCheckedChange={(checked) => handleChange(attr.id, String(checked))}
                                    />
                                    <span className="ml-2 text-sm">SÃ­/No</span>
                                </div>
                            ) : (
                                <Input
                                    className="h-8 bg-background"
                                    type={attr.tipo_dato === "int" || attr.tipo_dato === "dec" ? "number" : "text"}
                                    value={valores[attr.id] || ""}
                                    onChange={(e) => handleChange(attr.id, e.target.value)}
                                />
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleQuitarCampo(attr.id)}
                            title="Quitar campo"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {opcionesDisponibles.length > 0 && (
                <div className="mt-4 pt-4 border-t bg-muted/20 -mx-4 px-4 pb-2 rounded-b-md">
                    <Label className="text-xs mb-2 block text-muted-foreground">Agregar otro atributo:</Label>
                    <div className="flex gap-2 w-full">
                        <div className="flex-1">
                            <Combobox
                                options={opcionesDisponibles}
                                onChange={handleAgregarCampo}
                                placeholder="Buscar atributo extra..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {atributosVisibles.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Este dispositivo no requiere datos variables estándar.</p>
            )}
        </div>
    );
}
