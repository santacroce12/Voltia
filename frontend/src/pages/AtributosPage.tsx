import { useEffect, useState, type FormEvent } from "react";
import {
    listarAtributosMaestros,
    crearAtributoMaestro,
    actualizarAtributoMaestro,
    type AtributoMaestro,
    type AtributoMaestroPayload,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/Modal";
import { Pencil, Search } from "lucide-react";

// Formulario de creacion
function AtributoForm({ onCreado }: { onCreado: (a: AtributoMaestro) => void }) {
    const [nombre, setNombre] = useState("");
    const [unidad, setUnidad] = useState("");
    const [tipo, setTipo] = useState<"str" | "int" | "dec" | "bool">("str");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setCargando(true);
        try {
            const nuevo = await crearAtributoMaestro({ nombre, unidad: unidad || null, tipo_dato: tipo });
            onCreado(nuevo);
            setNombre("");
            setUnidad("");
            setTipo("str");
        } catch (e) {
            console.error(e);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nuevo Atributo Maestro</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
                    <div className="grid gap-2 flex-1 min-w-[200px]">
                        <Label>Nombre</Label>
                        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Potencia" required />
                    </div>
                    <div className="grid gap-2 w-32">
                        <Label>Unidad</Label>
                        <Input value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="Ej: W" />
                    </div>
                    <div className="grid gap-2 w-40">
                        <Label>Tipo</Label>
                        <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                            <SelectTrigger><SelectValue placeholder="Tipo de dato" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="str">Texto</SelectItem>
                                <SelectItem value="int">Entero</SelectItem>
                                <SelectItem value="dec">Decimal</SelectItem>
                                <SelectItem value="bool">Si/No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={cargando}>{cargando ? "Guardando..." : "Crear"}</Button>
                </form>
            </CardContent>
        </Card>
    );
}

export function AtributosPage() {
    const [atributos, setAtributos] = useState<AtributoMaestro[]>([]);
    const [filtro, setFiltro] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [atributoAEditar, setAtributoAEditar] = useState<AtributoMaestro | null>(null);
    const [editNombre, setEditNombre] = useState("");
    const [editUnidad, setEditUnidad] = useState("");
    const [editTipo, setEditTipo] = useState<"str" | "int" | "dec" | "bool">("str");
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        listarAtributosMaestros().then(setAtributos).catch(console.error);
    }, []);

    const handleEditClick = (attr: AtributoMaestro) => {
        setAtributoAEditar(attr);
        setEditNombre(attr.nombre);
        setEditUnidad(attr.unidad || "");
        setEditTipo(attr.tipo_dato);
        setEditModalOpen(true);
    };

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!atributoAEditar) return;
        setEditLoading(true);
        try {
            const payload: Partial<AtributoMaestroPayload> = {
                nombre: editNombre,
                unidad: editUnidad || null,
                tipo_dato: editTipo,
            };
            const actualizado = await actualizarAtributoMaestro(atributoAEditar.id, payload);
            setAtributos((prev) => prev.map((a) => (a.id === actualizado.id ? actualizado : a)));
            setEditModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setEditLoading(false);
        }
    };

    const filtrados = atributos.filter((a) => a.nombre.toLowerCase().includes(filtro.toLowerCase()));

    return (
        <div className="space-y-6">
            <AtributoForm onCreado={(a) => setAtributos((prev) => [a, ...prev])} />

            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar atributo..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Unidad</TableHead>
                            <TableHead>Tipo de Dato</TableHead>
                            <TableHead className="w-12 text-center">Editar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtrados.map((attr) => (
                            <TableRow key={attr.id}>
                                <TableCell className="font-medium">{attr.nombre}</TableCell>
                                <TableCell>{attr.unidad || "-"}</TableCell>
                                <TableCell className="font-mono text-xs">{attr.tipo_dato}</TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(attr)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtrados.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No se encontraron atributos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Atributo">
                <form onSubmit={handleUpdate} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Nombre</Label>
                        <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Unidad</Label>
                        <Input value={editUnidad} onChange={(e) => setEditUnidad(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Tipo</Label>
                        <Select value={editTipo} onValueChange={(v: any) => setEditTipo(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="str">Texto</SelectItem>
                                <SelectItem value="int">Entero</SelectItem>
                                <SelectItem value="dec">Decimal</SelectItem>
                                <SelectItem value="bool">Si/No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={editLoading}>{editLoading ? "Guardando..." : "Guardar Cambios"}</Button>
                </form>
            </Modal>
        </div>
    );
}
