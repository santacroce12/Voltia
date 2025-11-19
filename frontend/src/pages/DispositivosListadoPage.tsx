import { useEffect, useState, type FormEvent } from "react";
import {
    listarCatalogoDispositivos,
    listarMarcas,
    listarCategorias,
    actualizarCatalogoDispositivo,
    type CatalogoDispositivo,
    type Marca,
    type Categoria,
} from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function DispositivosListadoPage() {
    const [dispositivos, setDispositivos] = useState<CatalogoDispositivo[]>([]);
    const [filtro, setFiltro] = useState("");
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [editDispositivo, setEditDispositivo] = useState<CatalogoDispositivo | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editMarcaId, setEditMarcaId] = useState<number | null>(null);
    const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);
    const [editModelo, setEditModelo] = useState("");
    const [editNombre, setEditNombre] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    useEffect(() => {
        listarCatalogoDispositivos().then(setDispositivos).catch(console.error);
    }, []);

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias()])
            .then(([listaMarcas, listaCategorias]) => {
                setMarcas(listaMarcas);
                setCategorias(listaCategorias);
            })
            .catch(console.error);
    }, []);

    const filtrados = dispositivos.filter((d) =>
        d.nombre_completo_producto.toLowerCase().includes(filtro.toLowerCase()) ||
        d.modelo.toLowerCase().includes(filtro.toLowerCase())
    );

    const abrirEditorDispositivo = (dispositivo: CatalogoDispositivo) => {
        setEditDispositivo(dispositivo);
        setEditMarcaId(dispositivo.marca);
        setEditCategoriaId(dispositivo.categoria);
        setEditModelo(dispositivo.modelo);
        setEditNombre(dispositivo.nombre_completo_producto);
        setEditUrl(dispositivo.url_ficha_tecnica || "");
        setEditDescripcion(dispositivo.descripcion_funcional || "");
        setEditError(null);
        setEditOpen(true);
    };

    const cerrarEditorDispositivo = () => {
        setEditOpen(false);
        setEditDispositivo(null);
        setEditError(null);
    };

    const handleActualizarDispositivo = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editDispositivo || !editMarcaId || !editCategoriaId) {
            setEditError("Completa los campos obligatorios.");
            return;
        }
        setEditLoading(true);
        setEditError(null);
        try {
            const actualizado = await actualizarCatalogoDispositivo(editDispositivo.id, {
                marca: editMarcaId,
                categoria: editCategoriaId,
                modelo: editModelo,
                nombre_completo_producto: editNombre,
                url_ficha_tecnica: editUrl || undefined,
                descripcion_funcional: editDescripcion || undefined,
            });
            const enriched = {
                ...actualizado,
                marca_nombre: marcas.find((m) => m.id === actualizado.marca)?.nombre,
                categoria_nombre: categorias.find((c) => c.id === actualizado.categoria)?.categoria_principal,
            };
            setDispositivos((prev) => prev.map((d) => (d.id === actualizado.id ? { ...d, ...enriched } : d)));
            cerrarEditorDispositivo();
        } catch (err) {
            console.error(err);
            setEditError("No se pudo actualizar el dispositivo.");
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Catalogo Maestro</h2>
                <Input
                    placeholder="Buscar dispositivo..."
                    className="max-w-sm"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>

            <Card className="overflow-hidden border shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[150px]">Marca</TableHead>
                                <TableHead className="w-[150px]">Modelo</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Funciones</TableHead>
                                <TableHead className="text-right">Editar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtrados.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{(d as any).marca_nombre ?? d.marca}</TableCell>
                                    <TableCell>{d.modelo}</TableCell>
                                    <TableCell>{d.nombre_completo_producto}</TableCell>
                                    <TableCell>{(d as any).categoria_nombre ?? d.categoria}</TableCell>
                                    <TableCell className="text-right">{d.funciones_soportadas.length}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => abrirEditorDispositivo(d)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog
                open={editOpen}
                onOpenChange={(open) => (open ? setEditOpen(true) : cerrarEditorDispositivo())}
            >
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editDispositivo
                                ? `Editar dispositivo: ${editDispositivo.nombre_completo_producto}`
                                : "Editar dispositivo"}
                        </DialogTitle>
                        <DialogDescription>
                            Actualiza los datos principales del dispositivo seleccionado.
                        </DialogDescription>
                    </DialogHeader>
                    {editDispositivo && (
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleActualizarDispositivo}>
                            <div className="grid gap-2">
                                <Label>Marca</Label>
                                <Select
                                    value={editMarcaId ? String(editMarcaId) : ""}
                                    onValueChange={(value) => setEditMarcaId(Number(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {marcas.map((marca) => (
                                            <SelectItem key={marca.id} value={String(marca.id)}>
                                                {marca.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Categoria</Label>
                                <Select
                                    value={editCategoriaId ? String(editCategoriaId) : ""}
                                    onValueChange={(value) => setEditCategoriaId(Number(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.categoria_principal} / {cat.subcategoria}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-modelo">Modelo</Label>
                                <Input
                                    id="edit-modelo"
                                    value={editModelo}
                                    onChange={(e) => setEditModelo(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombre">Nombre comercial</Label>
                                <Input
                                    id="edit-nombre"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="edit-url">URL Ficha tecnica</Label>
                                <Input
                                    id="edit-url"
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="edit-desc">Descripcion funcional</Label>
                                <Textarea
                                    id="edit-desc"
                                    value={editDescripcion}
                                    onChange={(e) => setEditDescripcion(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            {editError && (
                                <p className="text-sm text-destructive md:col-span-2">{editError}</p>
                            )}
                            <DialogFooter className="md:col-span-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cerrarEditorDispositivo}
                                    disabled={editLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editLoading || !editMarcaId || !editCategoriaId}>
                                    {editLoading ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
