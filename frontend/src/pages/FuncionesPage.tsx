import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listarFunciones, crearFuncion, actualizarFuncion, type FuncionDispositivo } from "../services/api";
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

function FuncionForm({ onFuncionCreada }: { onFuncionCreada: (f: FuncionDispositivo) => void }) {
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        try {
            const nueva = await crearFuncion({ codigo_funcion: codigo, nombre });
            onFuncionCreada(nueva);
            setCodigo("");
            setNombre("");
        } catch {
            console.error("Error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Nueva Funcion</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="func-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Codigo</Label>
                        <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: 50/51" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Nombre</Label>
                        <Input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Sobrecorriente"
                            required
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button form="func-form" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar"}
                </Button>
            </CardFooter>
        </Card>
    );
}

type SortField = "codigo" | "nombre";

export function FuncionesPage() {
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [funcionEditando, setFuncionEditando] = useState<FuncionDispositivo | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editCodigo, setEditCodigo] = useState("");
    const [editNombre, setEditNombre] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [sortField, setSortField] = useState<SortField>("nombre");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        listarFunciones().then(setFunciones).catch(console.error);
    }, []);

    const abrirEditor = (funcion: FuncionDispositivo) => {
        setFuncionEditando(funcion);
        setEditCodigo(funcion.codigo_funcion || "");
        setEditNombre(funcion.nombre);
        setEditError(null);
        setEditOpen(true);
    };

    const cerrarEditor = () => {
        setEditOpen(false);
        setFuncionEditando(null);
        setEditError(null);
    };

    const handleEditarFuncion = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!funcionEditando) return;
        setEditLoading(true);
        setEditError(null);
        try {
            const actualizada = await actualizarFuncion(funcionEditando.id, {
                codigo_funcion: editCodigo,
                nombre: editNombre,
            });
            setFunciones((prev) => prev.map((f) => (f.id === actualizada.id ? actualizada : f)));
            cerrarEditor();
        } catch (err) {
            console.error(err);
            setEditError("No se pudo actualizar la funcion.");
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

    const funcionesProcesadas = useMemo(() => {
        const termino = busqueda.toLowerCase();
        const filtradas = funciones.filter(
            (f) =>
                (f.codigo_funcion || "").toLowerCase().includes(termino) ||
                f.nombre.toLowerCase().includes(termino),
        );
        const sorted = [...filtradas].sort((a, b) => {
            const valorA =
                sortField === "codigo"
                    ? (a.codigo_funcion || "").toLowerCase()
                    : a.nombre.toLowerCase();
            const valorB =
                sortField === "codigo"
                    ? (b.codigo_funcion || "").toLowerCase()
                    : b.nombre.toLowerCase();
            return sortDirection === "asc" ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        });
        return sorted;
    }, [funciones, busqueda, sortField, sortDirection]);

    const indicador = (field: SortField) =>
        sortField === field ? <span className="ml-1 text-xs">{sortDirection === "asc" ? "^" : "v"}</span> : null;

    return (
        <div className="space-y-8">
            <FuncionForm onFuncionCreada={(f) => setFunciones([f, ...funciones])} />
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Funciones Disponibles</h3>
                <Input
                    placeholder="Buscar por codigo o nombre..."
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
                                    onClick={() => handleSort("codigo")}
                                >
                                    Codigo {indicador("codigo")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => handleSort("nombre")}
                                >
                                    Nombre {indicador("nombre")}
                                </TableHead>
                                <TableHead className="text-right">Editar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {funcionesProcesadas.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-mono font-semibold">{f.codigo_funcion || "#"}</TableCell>
                                    <TableCell>{f.nombre}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" type="button" onClick={() => abrirEditor(f)}>
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {funcionEditando ? `Editar funcion: ${funcionEditando.nombre}` : "Editar funcion"}
                        </DialogTitle>
                        <DialogDescription>Actualiza el codigo y el nombre de la funcion.</DialogDescription>
                    </DialogHeader>
                    {funcionEditando && (
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEditarFuncion}>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-func-codigo">Codigo</Label>
                                <Input
                                    id="edit-func-codigo"
                                    value={editCodigo}
                                    onChange={(e) => setEditCodigo(e.target.value)}
                                    placeholder="Ej: 50/51"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-func-nombre">Nombre</Label>
                                <Input
                                    id="edit-func-nombre"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
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
