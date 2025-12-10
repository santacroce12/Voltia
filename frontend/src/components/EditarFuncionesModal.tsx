import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { type FuncionDispositivo, type CatalogoDispositivo, updateCatalogoFunciones } from "../services/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    dispositivo: CatalogoDispositivo | null;
    masterFunciones: FuncionDispositivo[];
    onUpdateExitoso: (d: CatalogoDispositivo) => void;
};

export function EditarFuncionesModal({ isOpen, onClose, dispositivo, masterFunciones, onUpdateExitoso }: Props) {
    const [seleccionIds, setSeleccionIds] = useState<number[]>(dispositivo?.funciones_soportadas || []);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        setSeleccionIds(dispositivo?.funciones_soportadas || []);
    }, [dispositivo]);

    const handleToggle = (fid: number) => {
        setSeleccionIds((prev) => (prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid]));
    };

    const handleSave = async () => {
        if (!dispositivo) return;
        setCargando(true);
        try {
            const actualizado = await updateCatalogoFunciones(dispositivo.id, seleccionIds);
            onUpdateExitoso(actualizado);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setCargando(false);
        }
    };

    if (!dispositivo) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Funciones Soportadas: ${dispositivo.modelo}`}>
            <div className="flex flex-col gap-4">
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                    Marca las funciones que este modelo de dispositivo <b>es capaz de realizar</b> (Catálogo). Esto habilita las
                    opciones para Ingeniería.
                </div>

                <div className="rounded-md border h-[400px] overflow-y-auto p-4 space-y-1 bg-background">
                    {masterFunciones.map((func) => (
                        <div
                            key={func.id}
                            className={cn(
                                "flex items-start space-x-3 p-3 rounded-md transition-colors hover:bg-muted/50 cursor-pointer",
                                seleccionIds.includes(func.id) && "bg-muted/30",
                            )}
                            onClick={() => handleToggle(func.id)}
                        >
                            <Checkbox
                                id={`master-func-${func.id}`}
                                checked={seleccionIds.includes(func.id)}
                                onCheckedChange={() => handleToggle(func.id)}
                            />
                            <div className="grid gap-1 leading-none">
                                <Label
                                    htmlFor={`master-func-${func.id}`}
                                    className="text-sm font-medium cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {func.nombre}
                                </Label>
                                {func.codigo_funcion && (
                                    <p className="text-xs text-muted-foreground">Código ANSI: {func.codigo_funcion}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-2 border-t">
                    <Button onClick={handleSave} disabled={cargando} className="w-full sm:w-auto">
                        {cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Configuración de Catálogo
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
