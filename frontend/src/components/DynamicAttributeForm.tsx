import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { type AtributoMaestro } from "../services/api";
import { useMemo, useState } from "react";

type Props = {
    todosLosAtributos: AtributoMaestro[];
    // Ya no recibimos "sugeridosIds" porque esa logica se elimino
    valores: Record<number, string>;
    onChange: (nuevosValores: Record<number, string>) => void;
};

export function DynamicAttributeForm({ todosLosAtributos, valores, onChange }: Props) {
    // Los campos visibles son simplemente los que tienen algun valor o los que el usuario agregue
    // (Se maneja externamente o se asume que 'valores' trae lo que hay que mostrar)
    const [busqueda, setBusqueda] = useState("");

    const handleChange = (id: number, valor: string) => {
        onChange({ ...valores, [id]: valor });
    };

    const handleAgregarCampo = (idStr: string) => {
        const id = Number(idStr);
        if (id && valores[id] === undefined) {
            // Inicializamos con string vacio para que aparezca el input
            onChange({ ...valores, [id]: "" });
        }
    };

    const handleQuitarCampo = (id: number) => {
        const nuevosValores = { ...valores };
        delete nuevosValores[id];
        onChange(nuevosValores);
    };

    // Atributos que ya tienen un campo visible (porque tienen clave en 'valores')
    const atributosVisibles = todosLosAtributos.filter((a) => valores.hasOwnProperty(a.id));

    const disponiblesFiltrados = useMemo(() => {
        const term = busqueda.toLowerCase();
        return todosLosAtributos
            .filter((a) => !valores.hasOwnProperty(a.id))
            .filter((a) => a.nombre.toLowerCase().includes(term) || (a.unidad || "").toLowerCase().includes(term));
    }, [todosLosAtributos, valores, busqueda]);
    
    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/5">
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Agregar atributo</Label>
                <Input
                    placeholder="Buscar atributo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="max-w-md"
                />
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 max-h-64 overflow-y-auto pr-1 items-stretch">
                    {disponiblesFiltrados.map((attr) => (
                        <Button
                            key={attr.id}
                            type="button"
                            variant="outline"
                            className="w-full min-w-0 justify-start text-sm text-left whitespace-normal leading-tight min-h-11"
                            onClick={() => handleAgregarCampo(String(attr.id))}
                            title={`${attr.nombre} ${attr.unidad ? `(${attr.unidad})` : ""}`.trim()}
                        >
                            <span className="inline-block text-left break-all leading-tight line-clamp-2">
                                {attr.nombre} {attr.unidad ? `(${attr.unidad})` : ""}
                            </span>
                        </Button>
                    ))}
                    {disponiblesFiltrados.length === 0 && (
                        <p className="text-xs text-muted-foreground sm:col-span-2 md:col-span-3">
                            No hay atributos que coincidan con la busqueda.
                        </p>
                    )}
                </div>
            </div>

            {atributosVisibles.length === 0 ? (
                <div className="rounded-md border border-dashed bg-background p-4 text-center text-sm text-muted-foreground">
                    Aun no hay atributos seleccionados. Usa el buscador de arriba para agregar alguno.
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm font-semibold">Atributos seleccionados</p>
                    <div className="grid gap-3 md:grid-cols-2">
                    {atributosVisibles.map((attr) => (
                        <div key={attr.id} className="flex items-end gap-2 rounded-md border bg-background p-3 shadow-sm">
                            <div className="grid gap-1.5 flex-1 min-w-0">
                                <Label
                                    className="text-xs font-medium text-muted-foreground break-all leading-tight line-clamp-2"
                                    title={`${attr.nombre} ${attr.unidad ? `(${attr.unidad})` : ""}`.trim()}
                                >
                                    {attr.nombre} {attr.unidad ? `(${attr.unidad})` : ""}
                                </Label>
                                <Input
                                    className="h-9"
                                    type="text"
                                    value={valores[attr.id] || ""}
                                    onChange={(e) => handleChange(attr.id, e.target.value)}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                onClick={() => handleQuitarCampo(attr.id)}
                                title="Quitar campo"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
}
