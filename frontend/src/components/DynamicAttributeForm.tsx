import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { listarAtributosMaestros, type AtributoMaestro } from "../services/api";

type Props = {
    valores: Record<number, string>;
    onChange: (nuevosValores: Record<number, string>) => void;
};

export function DynamicAttributeForm({ valores, onChange }: Props) {
    const [atributos, setAtributos] = useState<AtributoMaestro[]>([]);

    useEffect(() => {
        listarAtributosMaestros().then(setAtributos).catch(console.error);
    }, []);

    const handleChange = (id: number, valor: string) => {
        onChange({ ...valores, [id]: valor });
    };

    return (
        <div className="grid gap-4 py-2 border rounded-md p-4 bg-muted/10">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Atributos Tecnicos</h4>
            {atributos.map((attr) => (
                <div key={attr.id} className="grid gap-2">
                    <Label className="text-xs">
                        {attr.nombre} {attr.unidad ? `(${attr.unidad})` : ""}
                    </Label>

                    {attr.tipo_dato === "bool" ? (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={valores[attr.id] === "true"}
                                onCheckedChange={(checked) => handleChange(attr.id, String(checked))}
                            />
                            <span className="text-xs text-muted-foreground">Si/No</span>
                        </div>
                    ) : (
                        <Input
                            className="h-8"
                            type={attr.tipo_dato === "int" || attr.tipo_dato === "dec" ? "number" : "text"}
                            value={valores[attr.id] || ""}
                            onChange={(e) => handleChange(attr.id, e.target.value)}
                            placeholder="..."
                        />
                    )}
                </div>
            ))}
            {atributos.length === 0 && (
                <p className="text-xs text-muted-foreground">No hay atributos definidos. Crea uno en el Catalogo.</p>
            )}
        </div>
    );
}
