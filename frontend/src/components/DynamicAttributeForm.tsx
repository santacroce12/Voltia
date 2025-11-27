import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { type AtributoMaestro } from "../services/api";

type Props = {
    definiciones: AtributoMaestro[];
    valores: Record<number, string>;
    onChange: (nuevosValores: Record<number, string>) => void;
};

export function DynamicAttributeForm({ definiciones, valores, onChange }: Props) {
    const handleChange = (id: number, valor: string) => {
        onChange({ ...valores, [id]: valor });
    };

    if (definiciones.length === 0) {
        return <p className="text-xs text-muted-foreground italic">No hay atributos variables definidos para este dispositivo.</p>;
    }

    return (
        <div className="grid gap-4 py-2 border rounded-md p-4 bg-muted/10">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Datos Variables</h4>
            {definiciones.map((attr) => (
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
                            <span className="text-xs text-muted-foreground">Sí</span>
                        </div>
                    ) : (
                        <Input
                            className="h-8 bg-background"
                            type={attr.tipo_dato === "int" || attr.tipo_dato === "dec" ? "number" : "text"}
                            value={valores[attr.id] || ""}
                            onChange={(e) => handleChange(attr.id, e.target.value)}
                            placeholder="..."
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
