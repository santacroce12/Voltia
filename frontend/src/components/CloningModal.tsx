import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowDown, Copy } from "lucide-react";
import { clonarProyecto, type Proyecto, type Obra } from "../services/api";

type CloningModalProps = {
    isOpen: boolean;
    onClose: () => void;
    sourceProject: Proyecto | null;
    allObras: Obra[];
    onCloneExitoso: (newProject: Proyecto) => void;
};

export function CloningModal({
    isOpen,
    onClose,
    sourceProject,
    allObras,
    onCloneExitoso,
}: CloningModalProps) {
    const [targetObraId, setTargetObraId] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!sourceProject) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!targetObraId) return;
        setCargando(true);
        setError(null);
        const payload = { source_project_id: sourceProject.id, target_obra_id: Number(targetObraId) };
        try {
            const newProject = await clonarProyecto(payload);
            onCloneExitoso(newProject);
            onClose();
        } catch (err: any) {
            setError(err.message || "Error desconocido al clonar.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Clonar Proyecto: ${sourceProject.nombre_proyecto}`}>
            <form onSubmit={handleSubmit} className="grid gap-6">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Copy className="h-4 w-4" /> Proyecto Origen
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold text-primary">{sourceProject.nombre_proyecto}</p>
                        <p className="text-sm text-muted-foreground">Obra ID: {sourceProject.obra}</p>
                    </CardContent>
                </Card>

                <div className="text-center text-muted-foreground">
                    <ArrowDown className="h-5 w-5 inline-block" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="target-obra">Obra Destino</Label>
                    <Select value={targetObraId} onValueChange={setTargetObraId}>
                        <SelectTrigger id="target-obra">
                            <SelectValue placeholder="Seleccione la nueva Obra" />
                        </SelectTrigger>
                        <SelectContent>
                            {allObras.map((obra) => (
                                <SelectItem key={obra.id} value={String(obra.id)}>
                                    {obra.nombre_obra}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button type="submit" disabled={cargando || !targetObraId}>
                    {cargando ? "Clonando y copiando..." : "Confirmar Clonación"}
                </Button>
            </form>
        </Modal>
    );
}
