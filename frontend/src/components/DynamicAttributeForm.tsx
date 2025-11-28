import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { type AtributoMaestro } from "../services/api";

type Props = {
    todosLosAtributos: AtributoMaestro[];
    // Ya no recibimos "sugeridosIds" porque esa logica se elimino
    valores: Record<number, string>;
    onChange: (nuevosValores: Record<number, string>) => void;
};

export function DynamicAttributeForm({ todosLosAtributos, valores, onChange }: Props) {
    // Los campos visibles son simplemente los que tienen algun valor o los que el usuario agregue
    // (Se maneja externamente o se asume que 'valores' trae lo que hay que mostrar)
    
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
    const atributosVisibles = todosLosAtributos.filter(a => valores.hasOwnProperty(a.id));
    
    // Opciones para el Combobox (los que NO estan visibles)
    const opcionesDisponibles = todosLosAtributos
        .filter(a => !valores.hasOwnProperty(a.id))
        .map(a => ({ value: String(a.id), label: a.nombre }));

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/5">
            <div className="grid gap-4">
                {atributosVisibles.map((attr) => (
                    <div key={attr.id} className="flex items-end gap-2 animate-in fade-in slide-in-from-top-1">
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                                {attr.nombre} {attr.unidad ? `(${attr.unidad})` : ''}
                            </Label>
                            <Input 
                                className="h-8 bg-background"
                                type="text" // SIEMPRE TEXTO
                                value={valores[attr.id] || ''}
                                onChange={(e) => handleChange(attr.id, e.target.value)}
                            />
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

            {/* Selector para Agregar Mas */}
            <div className="mt-4 pt-4 border-t bg-muted/20 -mx-4 px-4 pb-2 rounded-b-md">
                <Label className="text-xs mb-2 block text-muted-foreground">Agregar atributo:</Label>
                <div className="flex gap-2 w-full">
                    <div className="flex-1">
                        <Combobox 
                            options={opcionesDisponibles} 
                            onChange={handleAgregarCampo} 
                            placeholder="Buscar atributo..."
                            emptyText="No hay mas atributos disponibles."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
