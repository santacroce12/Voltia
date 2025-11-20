import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listarCategorias, crearCategoria, actualizarCategoria, type Categoria } from "../services/api";
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

function CategoriaForm({ onCategoriaCreada }: { onCategoriaCreada: (cat: Categoria) => void }) {
    const [principal, setPrincipal] = useState("");
    const [subcategoria, setSubcategoria] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        setError(null);
        try {
            const nueva = await crearCategoria({ categoria_principal: principal, subcategoria });
            onCategoriaCreada(nueva);
            setPrincipal("");
            setSubcategoria("");
        } catch {
            setError("Error al guardar.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Registrar Nueva Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="cat-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Categoria Principal</Label>
                        <Input
                            value={principal}
                            onChange={(e) => setPrincipal(e.target.value)}
                            placeholder="Ej: Reles"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Sub-Categoria</Label>
                        <Input
                            value={subcategoria}
                            onChange={(e) => setSubcategoria(e.target.value)}
                            placeholder="Ej: Proteccion"
                            required
                        />
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="cat-form" type="submit" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar Categoria"}
                </Button>
            </CardFooter>
        </Card>
    );
}

type SortField = "categoria" | "subcategoria";

export function CategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editPrincipal, setEditPrincipal] = useState("");
    const [editSub, setEditSub] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [sortField, setSortField] = useState<SortField>("categoria");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        listarCategorias().then(setCategorias).catch(console.error);
    }, []);

    const abrirEditor = (categoria: Categoria) => {
        setCategoriaEditando(categoria);
        setEditPrincipal(categoria.categoria_principal);
        setEditSub(categoria.subcategoria);
        setEditError(null);
        setEditOpen(true);
    };

    const cerrarEditor = () => {
        setEditOpen(false);
        setCategoriaEditando(null);
        setEditError(null);
    };

    const handleEditarCategoria = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!categoriaEditando) return;
        setEditLoading(true);
        setEditError(null);
        try {
            const actualizada = await actualizarCategoria(categoriaEditando.id, {
                categoria_principal: editPrincipal,
                subcategoria: editSub,
            });
            setCategorias((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)));
            cerrarEditor();
        } catch (err) {
            console.error(err);
            setEditError("No se pudo actualizar la categoria.");
        } finally {
            setEditLoading(false);
        }
    };

    const handleSort = (field: SortField) => {
        setSortField((prev) => {
            if (prev === field) {
                setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
                return prev;
            }
            setSortDirection("asc");
            return field;
        });
    };

    const categoriasProcesadas = useMemo(() => {
        const termino = busqueda.toLowerCase();
        const filtradas = categorias.filter(
            (c) =>
                c.categoria_principal.toLowerCase().includes(termino) ||
                c.subcategoria.toLowerCase().includes(termino),
        );
        const sorted = [...filtradas].sort((a, b) => {
            const valorA =
                sortField === "categoria"
                    ? a.categoria_principal.toLowerCase()
                    : a.subcategoria.toLowerCase();
            const valorB =
                sortField === "categoria"
                    ? b.categoria_principal.toLowerCase()
                    : b.subcategoria.toLowerCase();
            return sortDirection === "asc" ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        });
        return sorted;
    }, [categorias, busqueda, sortField, sortDirection]);

    const indicador = (field: SortField) =>
        sortField === field ? <span className="ml-1 text-xs">{sortDirection === "asc" ? "^" : "v"}</span> : null;

    return (
        <div className="space-y-8">
            <CategoriaForm onCategoriaCreada={(c) => setCategorias([c, ...categorias])} />
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categorias Disponibles</h3>
                <Input
                    placeholder="Filtrar por categoria o subcategoria..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="max-w-md"
                />
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => handleSort("categoria")}
                                >
                                    Categoria {indicador("categoria")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => handleSort("subcategoria")}
                                >
                                    Subcategoria {indicador("subcategoria")}
                                </TableHead>
                                <TableHead className="text-right">Editar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categoriasProcesadas.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.categoria_principal}</TableCell>
                                    <TableCell>{c.subcategoria}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" type="button" onClick={() => abrirEditor(c)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Dialog open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : cerrarEditor())}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>
                            {categoriaEditando
                                ? `Editar categoria: ${categoriaEditando.categoria_principal}`
                                : "Editar categoria"}
                        </DialogTitle>
                        <DialogDescription>Actualiza los datos principales de la categoria.</DialogDescription>
                    </DialogHeader>
                    {categoriaEditando && (
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEditarCategoria}>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-cat-principal">Categoria Principal</Label>
                                <Input
                                    id="edit-cat-principal"
                                    value={editPrincipal}
                                    onChange={(e) => setEditPrincipal(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-cat-sub">Subcategoria</Label>
                                <Input
                                    id="edit-cat-sub"
                                    value={editSub}
                                    onChange={(e) => setEditSub(e.target.value)}
                                    required
                                />
                            </div>
                            {editError && <p className="text-sm text-destructive md:col-span-2">{editError}</p>}
                            <DialogFooter className="md:col-span-2">
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
