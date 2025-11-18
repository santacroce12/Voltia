import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { type FuncionDispositivo, type CatalogoDispositivo, updateCatalogoFunciones } from "../services/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
        setSeleccionIds(prev => prev.includes(fid) ? prev.filter(id => id !== fid) : [...prev, fid]);
    };

    const handleSave = async () => {
        if (!dispositivo) return;
        setCargando(true);
        try {
            const actualizado = await updateCatalogoFunciones(dispositivo.id, seleccionIds);
            onUpdateExitoso(actualizado);
            onClose();
        } catch (e) { console.error(e); } 
        finally { setCargando(false); }
    };

    if (!dispositivo) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${dispositivo.modelo}`}>
            <div className="grid gap-4">
                <div className="max-h-[300px] overflow-y-auto grid gap-2 p-2 border rounded-md">
                    {masterFunciones.map(func => (
                        <div key={func.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`func-${func.id}`} 
                                checked={seleccionIds.includes(func.id)}
                                onCheckedChange={() => handleToggle(func.id)}
                            />
                            <Label htmlFor={`func-${func.id}`} className="text-sm font-normal cursor-pointer">
                                {func.codigo_funcion ? `[${func.codigo_funcion}] ` : ""}{func.nombre}
                            </Label>
                        </div>
                    ))}
                </div>
                <Button onClick={handleSave} disabled={cargando}>Guardar Cambios</Button>
            </div>
        </Modal>
    );
}
