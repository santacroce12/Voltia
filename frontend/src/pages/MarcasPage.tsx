import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listarMarcas, crearMarca, actualizarMarca, type Marca } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function MarcaForm({ onMarcaCreada }: { onMarcaCreada: (marca: Marca) => void }) {
    const [nombre, setNombre] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true); setError(null);
        try {
            const nuevaMarca = await crearMarca({ nombre });
            onMarcaCreada(nuevaMarca);
            setNombre("");
        } catch { setError("Error al guardar la marca."); } 
        finally { setCargando(false); }
    };

    return (
        <Card className="max-w-lg">
            <CardHeader><CardTitle>Registrar Nueva Marca</CardTitle></CardHeader>
            <CardContent>
                <form id="marca-form" className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="nombre">Nombre de la Marca</Label>
                        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="marca-form" type="submit" disabled={cargando}>{cargando ? "Guardando..." : "Guardar Marca"}</Button>
            </CardFooter>
        </Card>
    );
}

type MarcaListProps = {
    marcas: Marca[];
    onEditar: (marca: Marca) => void;
    sortField: "id" | "nombre";
    sortDirection: "asc" | "desc";
    onSortChange: (field: "id" | "nombre") => void;
};

function MarcaList({ marcas, onEditar, sortField, sortDirection, onSortChange }: MarcaListProps) {
    if (marcas.length === 0)
        return <div className="text-center text-muted-foreground py-12 border rounded-lg bg-muted/10">No hay marcas registradas.</div>;
    const renderIndicator = (field: "id" | "nombre") =>
        sortField === field ? <span className="ml-1 text-xs">{sortDirection === "asc" ? "^" : "v"}</span> : null;

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => onSortChange("id")}
                        >
                            ID {renderIndicator("id")}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => onSortChange("nombre")}
                        >
                            Nombre {renderIndicator("nombre")}
                        </TableHead>
                        <TableHead className="text-right">Editar</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {marcas.map((m) => (
                        <TableRow key={m.id}>
                            <TableCell className="font-mono">{m.id}</TableCell>
                            <TableCell className="font-medium">{m.nombre}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" type="button" onClick={() => onEditar(m)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [marcaEditando, setMarcaEditando] = useState<Marca | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editNombre, setEditNombre] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [sortField, setSortField] = useState<"id" | "nombre">("nombre");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    useEffect(() => { listarMarcas().then(setMarcas).catch(console.error); }, []);

    const handleSortChange = (field: "id" | "nombre") => {
        setSortField((prev) => {
            if (prev === field) {
                setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
                return prev;
            }
            setSortDirection("asc");
            return field;
        });
    };

    const marcasProcesadas = useMemo(() => {
        const filtradas = marcas.filter((m) =>
            m.nombre.toLowerCase().includes(busqueda.toLowerCase()),
        );
        const sorted = [...filtradas].sort((a, b) => {
            const valA = sortField === "id" ? String(a.id) : a.nombre.toLowerCase();
            const valB = sortField === "id" ? String(b.id) : b.nombre.toLowerCase();
            return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
        return sorted;
    }, [marcas, busqueda, sortField, sortDirection]);

    const abrirEditor = (marca: Marca) => {
        setMarcaEditando(marca);
        setEditNombre(marca.nombre);
        setEditError(null);
        setEditOpen(true);
    };

    const cerrarEditor = () => {
        setEditOpen(false);
        setMarcaEditando(null);
        setEditError(null);
    };

    const handleEditarMarca = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!marcaEditando) return;
        setEditLoading(true);
        setEditError(null);
        try {
            const actualizada = await actualizarMarca(marcaEditando.id, { nombre: editNombre });
            setMarcas((prev) => prev.map((m) => (m.id === actualizada.id ? actualizada : m)));
            cerrarEditor();
        } catch (err) {
            console.error(err);
            setEditError("No se pudo actualizar la marca.");
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <MarcaForm onMarcaCreada={(m) => setMarcas([m, ...marcas])} />
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Marcas Registradas</h3>
                <Input
                    placeholder="Filtrar por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="max-w-sm"
                />
                <MarcaList
                    marcas={marcasProcesadas}
                    onEditar={abrirEditor}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                />
            </div>
            <Dialog open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : cerrarEditor())}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>
                            {marcaEditando ? `Editar marca: ${marcaEditando.nombre}` : "Editar marca"}
                        </DialogTitle>
                        <DialogDescription>Actualiza el nombre de la marca seleccionada.</DialogDescription>
                    </DialogHeader>
                    {marcaEditando && (
                        <form className="space-y-4" onSubmit={handleEditarMarca}>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-marca-nombre">Nombre</Label>
                                <Input
                                    id="edit-marca-nombre"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    required
                                />
                            </div>
                            {editError && <p className="text-sm text-destructive">{editError}</p>}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={cerrarEditor} disabled={editLoading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editLoading}>
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
