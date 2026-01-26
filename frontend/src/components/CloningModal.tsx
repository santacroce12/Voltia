import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowDown, Copy } from "lucide-react";
import { clonarProyecto, type Proyecto, type Obra, type Cliente } from "../services/api";

type CloningModalProps = {
    isOpen: boolean;
    onClose: () => void;
    sourceProject: Proyecto | null;
    clientes: Cliente[];
    allObras: Obra[];
    onCloneExitoso: (newProject: Proyecto) => void;
};

export function CloningModal({ isOpen, onClose, sourceProject, clientes, allObras, onCloneExitoso }: CloningModalProps) {
    const [clienteId, setClienteId] = useState("");
    const [targetObraId, setTargetObraId] = useState("");
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !sourceProject) return;
        const obraOrigen = allObras.find((obra) => obra.id === sourceProject.obra);
        if (obraOrigen) {
            setClienteId(String(obraOrigen.cliente));
            setTargetObraId(String(obraOrigen.id));
        } else {
            setClienteId("");
            setTargetObraId("");
        }
        setNuevoNombre("");
        setError(null);
    }, [isOpen, sourceProject, allObras]);

    const obrasFiltradas = clienteId
        ? allObras.filter((obra) => String(obra.cliente) === clienteId)
        : [];

    if (!sourceProject) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!clienteId || !targetObraId) return;
        setCargando(true);
        setError(null);
        const payload = {
            source_project_id: sourceProject.id,
            target_obra_id: Number(targetObraId),
            nuevo_nombre: nuevoNombre.trim() || undefined,
        };
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
                    <Label htmlFor="target-cliente">Cliente destino</Label>
                    <Select
                        value={clienteId}
                        onValueChange={(value) => {
                            setClienteId(value);
                            setTargetObraId("");
                        }}
                    >
                        <SelectTrigger id="target-cliente">
                            <SelectValue placeholder="Seleccione un cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {clientes.map((cliente) => (
                                <SelectItem key={cliente.id} value={String(cliente.id)}>
                                    {cliente.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="target-obra">Obra destino</Label>
                    <Select value={targetObraId} onValueChange={setTargetObraId} disabled={!clienteId}>
                        <SelectTrigger id="target-obra">
                            <SelectValue placeholder="Seleccione una obra" />
                        </SelectTrigger>
                        <SelectContent>
                            {obrasFiltradas.map((obra) => (
                                <SelectItem key={obra.id} value={String(obra.id)}>
                                    {obra.nombre_obra}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="nuevo-nombre">Nombre opcional para el clon</Label>
                    <Input
                        id="nuevo-nombre"
                        placeholder={`${sourceProject.nombre_proyecto} (copia)`}
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Dejalo vacio para usar el nombre original con sufijo.</p>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button type="submit" disabled={cargando || !clienteId || !targetObraId}>
                    {cargando ? "Clonando..." : "Confirmar Clonacion"}
                </Button>
            </form>
        </Modal>
    );
}
