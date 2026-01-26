import { useEffect, useState, type FormEvent } from "react";
import {
    listarCatalogoDispositivos,
    listarMarcas,
    listarCategorias,
    listarFunciones,
    actualizarCatalogoDispositivo,
    listarAtributosMaestros,
    getCatalogoDetalle,
    type CatalogoDispositivo,
    type Marca,
    type Categoria,
    type FuncionDispositivo,
    type AtributoMaestro,
} from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, DollarSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { DynamicAttributeForm } from "@/components/DynamicAttributeForm";

export function DispositivosListadoPage() {
    const [dispositivos, setDispositivos] = useState<CatalogoDispositivo[]>([]);
    const [filtro, setFiltro] = useState("");
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);

    const [editDispositivo, setEditDispositivo] = useState<CatalogoDispositivo | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editMarcaId, setEditMarcaId] = useState<number | null>(null);
    const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);
    const [editModelo, setEditModelo] = useState("");
    const [editNombre, setEditNombre] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");
    const [editPrecioHistorico, setEditPrecioHistorico] = useState<number>(0);
    const [editPrecioActual, setEditPrecioActual] = useState<number | null>(null);
    const [editFunciones, setEditFunciones] = useState<number[]>([]);
    const [editEspecificaciones, setEditEspecificaciones] = useState<Record<number, string>>({});
    const [busquedaFuncion, setBusquedaFuncion] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const [viewOpen, setViewOpen] = useState(false);
    const [viewDispositivo, setViewDispositivo] = useState<CatalogoDispositivo | null>(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [viewError, setViewError] = useState<string | null>(null);

    const [priceOpen, setPriceOpen] = useState(false);
    const [priceDispositivo, setPriceDispositivo] = useState<CatalogoDispositivo | null>(null);
    const [priceHistorico, setPriceHistorico] = useState<number>(0);
    const [priceActual, setPriceActual] = useState<number | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [priceError, setPriceError] = useState<string | null>(null);

    useEffect(() => {
        listarCatalogoDispositivos().then(setDispositivos).catch(console.error);
    }, []);

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias(), listarFunciones(), listarAtributosMaestros()])
            .then(([listaMarcas, listaCategorias, listaFunciones, attrs]) => {
                setMarcas(listaMarcas);
                setCategorias(listaCategorias);
                setFunciones(listaFunciones);
                setAtributosMaestros(attrs);
            })
            .catch(console.error);
    }, []);

    const filtrados = dispositivos.filter(
        (d) =>
            d.nombre_completo_producto.toLowerCase().includes(filtro.toLowerCase()) ||
            d.modelo.toLowerCase().includes(filtro.toLowerCase()),
    );

    const abrirEditorDispositivo = (dispositivo: CatalogoDispositivo) => {
        setEditDispositivo(dispositivo);
        setEditMarcaId(dispositivo.marca);
        setEditCategoriaId(dispositivo.categoria);
        setEditModelo(dispositivo.modelo);
        setEditNombre(dispositivo.nombre_completo_producto);
        setEditUrl(dispositivo.url_ficha_tecnica || "");
        setEditDescripcion(dispositivo.descripcion_funcional || "");
        setEditPrecioHistorico(dispositivo.precio_historico ?? 0);
        setEditPrecioActual(dispositivo.precio_actual ?? null);
        setEditFunciones(dispositivo.funciones_soportadas || []);
        const especMap: Record<number, string> = {};
        (dispositivo.especificaciones_set || []).forEach((e) => {
            if (e.atributo) especMap[e.atributo] = e.valor;
        });
        setEditEspecificaciones(especMap);
        setBusquedaFuncion("");
        setEditError(null);
        setEditOpen(true);
    };

    const cerrarEditorDispositivo = () => {
        setEditOpen(false);
        setEditDispositivo(null);
        setEditError(null);
    };

    const abrirEditorPrecios = (dispositivo: CatalogoDispositivo) => {
        setPriceDispositivo(dispositivo);
        setPriceHistorico(dispositivo.precio_historico ?? 0);
        setPriceActual(dispositivo.precio_actual ?? null);
        setPriceError(null);
        setPriceOpen(true);
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
            // Enviamos TODOS los atributos visibles, incluso si el valor está vacío, para mantener plantilla/valores
            const especArray = Object.entries(editEspecificaciones).map(([attrId, val]) => ({
                atributo: Number(attrId),
                valor: val,
            }));

            const actualizado = await actualizarCatalogoDispositivo(editDispositivo.id, {
                marca: editMarcaId,
                categoria: editCategoriaId,
                modelo: editModelo,
                nombre_completo_producto: editNombre,
                url_ficha_tecnica: editUrl || undefined,
                descripcion_funcional: editDescripcion || undefined,
                precio_historico: editPrecioHistorico,
                precio_actual: editPrecioActual ?? null,
                funciones_soportadas: editFunciones,
                especificaciones_set: especArray,
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
                                <TableHead className="text-right">Precio Historico</TableHead>
                                <TableHead className="text-right">Precio Actual</TableHead>
                                <TableHead className="text-right">Funciones</TableHead>
                                <TableHead className="text-right">Atributos fijos</TableHead>
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
                                    <TableCell className="text-right font-medium text-green-600">
                                        {d.precio_historico !== undefined
                                            ? `$${Number(d.precio_historico).toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {d.precio_actual !== undefined && d.precio_actual !== null
                                            ? `$${Number(d.precio_actual).toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">{d.funciones_soportadas.length}</TableCell>
                                    <TableCell className="text-right">{(d as any).especificaciones_set?.length ?? 0}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => {
                                                setViewDispositivo(null);
                                                setViewError(null);
                                                setViewLoading(true);
                                                setViewOpen(true);
                                                getCatalogoDetalle(d.id)
                                                    .then((detalle) => setViewDispositivo(detalle))
                                                    .catch(() => setViewError("No se pudo cargar el detalle."))
                                                    .finally(() => setViewLoading(false));
                                            }}
                                            title="Ver detalle"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" type="button" onClick={() => abrirEditorDispositivo(d)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => abrirEditorPrecios(d)}
                                            title="Editar precios"
                                        >
                                            <DollarSign className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : cerrarEditorDispositivo())}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-xl">
                            {editDispositivo ? `Editar: ${editDispositivo.nombre_completo_producto}` : "Editar dispositivo"}
                        </DialogTitle>
                        <DialogDescription>Actualiza datos generales, funciones y especificaciones.</DialogDescription>
                    </DialogHeader>
                    {editDispositivo && (
                        <form className="space-y-6" onSubmit={handleActualizarDispositivo}>
                            <div className="grid gap-4 lg:grid-cols-2 bg-muted/30 p-4 rounded-md border">
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
                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="edit-url">URL Ficha tecnica</Label>
                                    <Input
                                        id="edit-url"
                                        type="url"
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-precio">Precio historico (USD)</Label>
                                    <Input
                                        id="edit-precio"
                                        type="number"
                                        step="0.01"
                                        value={Number.isFinite(editPrecioHistorico) ? editPrecioHistorico : ""}
                                        onChange={(e) => setEditPrecioHistorico(Number(e.target.value))}
                                        placeholder="Ej: 45.00"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-precio-actual">Precio actual (USD)</Label>
                                    <Input
                                        id="edit-precio-actual"
                                        type="number"
                                        step="0.01"
                                        value={editPrecioActual ?? ""}
                                        onChange={(e) => setEditPrecioActual(e.target.value === "" ? null : Number(e.target.value))}
                                        placeholder="Ej: 50.00"
                                    />
                                </div>
                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="edit-desc">Descripcion funcional</Label>
                                    <Textarea
                                        id="edit-desc"
                                        value={editDescripcion}
                                        onChange={(e) => setEditDescripcion(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-4">
                                <div className="grid gap-2 rounded-md border p-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <Label>Funciones soportadas</Label>
                                        <Input
                                            className="h-8 w-40"
                                            placeholder="Buscar..."
                                            value={busquedaFuncion}
                                            onChange={(e) => setBusquedaFuncion(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-56 overflow-y-auto rounded-md border bg-background p-2 space-y-1">
                                        {funciones
                                            .filter((f) =>
                                                `${f.codigo_funcion || ""} ${f.nombre}`
                                                    .toLowerCase()
                                                    .includes(busquedaFuncion.toLowerCase()),
                                            )
                                            .map((f) => (
                                                <label
                                                    key={f.id}
                                                    className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-muted text-sm"
                                                >
                                                    <Checkbox
                                                        checked={editFunciones.includes(f.id)}
                                                        onCheckedChange={() =>
                                                            setEditFunciones((prev) =>
                                                                prev.includes(f.id)
                                                                    ? prev.filter((id) => id !== f.id)
                                                                    : [...prev, f.id],
                                                            )
                                                        }
                                                    />
                                                    <div className="leading-tight">
                                                        <div className="font-medium">
                                                            {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                                            {f.nombre}
                                                        </div>
                                                        {f.descripcion && (
                                                            <div className="text-xs text-muted-foreground line-clamp-2">
                                                                {f.descripcion}
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                    </div>
                                </div>

                                <div className="grid gap-2 rounded-md border p-3 bg-muted/20">
                                    <Label>Especificaciones fijas</Label>
                                    <DynamicAttributeForm
                                    todosLosAtributos={atributosMaestros}
                                    valores={editEspecificaciones}
                                    onChange={setEditEspecificaciones}
                                />
                                </div>
                            </div>

                            {editError && <p className="text-sm text-destructive">{editError}</p>}

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={cerrarEditorDispositivo} disabled={editLoading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editLoading || !editMarcaId || !editCategoriaId}>
                                    {editLoading ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={priceOpen} onOpenChange={(open) => (open ? setPriceOpen(true) : setPriceOpen(false))}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Editar precios</DialogTitle>
                        <DialogDescription>
                            {priceDispositivo ? `Actualizar precios para ${priceDispositivo.nombre_completo_producto}.` : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Precio historico (USD)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={Number.isFinite(priceHistorico) ? priceHistorico : ""}
                                onChange={(e) => setPriceHistorico(Number(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Precio actual (USD)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={priceActual ?? ""}
                                onChange={(e) => setPriceActual(e.target.value === "" ? null : Number(e.target.value))}
                            />
                        </div>
                        {priceError && <p className="text-sm text-destructive">{priceError}</p>}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setPriceOpen(false)} disabled={priceLoading}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!priceDispositivo) return;
                                setPriceLoading(true);
                                setPriceError(null);
                                try {
                                    const actualizado = await actualizarCatalogoDispositivo(priceDispositivo.id, {
                                        precio_historico: priceHistorico,
                                        precio_actual: priceActual ?? null,
                                    });
                                    setDispositivos((prev) =>
                                        prev.map((d) => (d.id === actualizado.id ? { ...d, ...actualizado } : d)),
                                    );
                                    setPriceOpen(false);
                                } catch (err) {
                                    console.error(err);
                                    setPriceError("No se pudo actualizar los precios.");
                                } finally {
                                    setPriceLoading(false);
                                }
                            }}
                            disabled={priceLoading}
                        >
                            {priceLoading ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewOpen} onOpenChange={(open) => (open ? setViewOpen(true) : setViewOpen(false))}>
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>Detalle del dispositivo</DialogTitle>
                        <DialogDescription>Información completa del dispositivo seleccionado.</DialogDescription>
                    </DialogHeader>
                    {viewDispositivo && (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <p>
                                    <strong>Marca:</strong> {(viewDispositivo as any).marca_nombre ?? viewDispositivo.marca}
                                </p>
                                <p>
                                    <strong>Modelo:</strong> {viewDispositivo.modelo}
                                </p>
                                <p>
                                    <strong>Nombre:</strong> {viewDispositivo.nombre_completo_producto}
                                </p>
                                <p>
                                    <strong>Categoria:</strong>{" "}
                                    {(viewDispositivo as any).categoria_nombre ?? viewDispositivo.categoria}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Funciones soportadas</h4>
                                {viewLoading && <p className="text-xs text-muted-foreground">Cargando funciones...</p>}
                                {viewError && <p className="text-xs text-destructive">{viewError}</p>}
                                {!viewLoading && !viewError && (
                                    viewDispositivo.funciones_soportadas && viewDispositivo.funciones_soportadas.length > 0 ? (
                                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                            {viewDispositivo.funciones_soportadas.map((fid) => {
                                                const f = funciones.find((fun) => fun.id === fid);
                                                if (!f) return <li key={fid}>{`Funcion #${fid}`}</li>;
                                                return (
                                                    <li key={fid}>
                                                        {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                                        {f.nombre}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Sin funciones configuradas.</p>
                                    )
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Especificaciones</h4>
                                {viewLoading && <p className="text-xs text-muted-foreground">Cargando especificaciones...</p>}
                                {viewError && <p className="text-xs text-destructive">{viewError}</p>}
                                {!viewLoading && !viewError && viewDispositivo && (
                                    viewDispositivo.especificaciones_set && viewDispositivo.especificaciones_set.length > 0 ? (
                                        <ul className="list-disc pl-4 space-y-1">
                                            {viewDispositivo.especificaciones_set.map((e) => (
                                                <li key={e.id || e.atributo}>
                                                    {e.nombre_atributo || `Atributo #${e.atributo}`}:{" "}
                                                    {e.valor && e.valor.trim() !== "" ? e.valor : "-"} {e.unidad_atributo || ""}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground text-xs">Sin especificaciones cargadas.</p>
                                    )
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setViewOpen(false)}>
                                    Cerrar
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
