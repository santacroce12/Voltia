import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    listarCatalogoDispositivos,
    listarMarcas,
    listarCategorias,
    listarFunciones,
    crearCatalogoDispositivo,
    listarAtributosMaestros,
    type CatalogoDispositivo,
    type CatalogoDispositivoPayload,
    type Marca,
    type Categoria,
    type FuncionDispositivo,
    type AtributoMaestro,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicAttributeForm } from "../components/DynamicAttributeForm";

type DispositivoFormProps = {
    marcas: Marca[];
    categorias: Categoria[];
    funciones: FuncionDispositivo[];
    atributos: AtributoMaestro[];
    onDispositivoCreado: (dispositivo: CatalogoDispositivo) => void;
};

function DispositivoForm({ marcas, categorias, funciones, atributos, onDispositivoCreado }: DispositivoFormProps) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [url, setUrl] = useState("");
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [valoresEAV, setValoresEAV] = useState<Record<number, string>>({});
    const [funcionesIds, setFuncionesIds] = useState<number[]>([]);
    const [busquedaFunciones, setBusquedaFunciones] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState<string | null>(null);

    const funcionesFiltradas = useMemo(() => {
        const termino = busquedaFunciones.trim().toLowerCase();
        if (!termino) return funciones;
        return funciones.filter((f) => `${f.codigo_funcion ?? ""} ${f.nombre}`.toLowerCase().includes(termino));
    }, [funciones, busquedaFunciones]);

    const toggleFuncion = (id: number) => {
        setFuncionesIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!marcaId || !categoriaId) {
            setError("Faltan datos obligatorios.");
            return;
        }
        setCargando(true);
        setError(null);
        setExito(null);

        const payload: CatalogoDispositivoPayload = {
            modelo,
            nombre_completo_producto: nombre,
            url_ficha_tecnica: url,
            marca: Number(marcaId),
            categoria: Number(categoriaId),
            especificaciones_set: Object.entries(valoresEAV).map(([attrId, valor]) => ({
                atributo: Number(attrId),
                valor,
            })),
            funciones_soportadas: funcionesIds,
        };

        try {
            const nuevo = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevo);
            setModelo("");
            setNombre("");
            setUrl("");
            setMarcaId("");
            setCategoriaId("");
            setFuncionesIds([]);
            setValoresEAV({});
            setExito("Dispositivo guardado correctamente.");
        } catch (err: any) {
            setError(err?.message ?? "Error al guardar.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registrar Nuevo Dispositivo</CardTitle>
                <CardDescription>Anade un nuevo modelo al catalogo maestro.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="disp-form" className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Marca</Label>
                        <Select value={marcaId} onValueChange={setMarcaId}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar Marca" /></SelectTrigger>
                            <SelectContent>
                                {marcas.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Categoria</Label>
                        <Select value={categoriaId} onValueChange={setCategoriaId}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar Categoria" /></SelectTrigger>
                            <SelectContent>
                                {categorias.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.categoria_principal} - {c.subcategoria}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Modelo</Label>
                        <Input value={modelo} onChange={(e) => setModelo(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Nombre Comercial</Label>
                        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label>Ficha Tecnica (URL)</Label>
                        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label>Funciones Soportadas</Label>
                        <Input
                            placeholder="Buscar funcion..."
                            value={busquedaFunciones}
                            onChange={(e) => setBusquedaFunciones(e.target.value)}
                        />
                        <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
                            {funcionesFiltradas.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-4">No hay coincidencias.</p>
                            ) : (
                                funcionesFiltradas.map((f) => (
                                    <label key={f.id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={funcionesIds.includes(f.id)}
                                            onCheckedChange={() => toggleFuncion(f.id)}
                                        />
                                        <span className="cursor-pointer select-none">
                                            {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                            {f.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label>Datos tecnicos (texto)</Label>
                        <DynamicAttributeForm
                            todosLosAtributos={atributos}
                            valores={valoresEAV}
                            onChange={setValoresEAV}
                        />
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                {exito && <p className="text-emerald-600 text-sm mt-2">{exito}</p>}
            </CardContent>
            <CardFooter>
                <Button form="disp-form" type="submit" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar Dispositivo"}
                </Button>
            </CardFooter>
        </Card>
    );
}

export function DispositivosPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [atributos, setAtributos] = useState<AtributoMaestro[]>([]);
    const [dispositivos, setDispositivos] = useState<CatalogoDispositivo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            listarCatalogoDispositivos(),
            listarMarcas(),
            listarCategorias(),
            listarFunciones(),
            listarAtributosMaestros(),
        ])
            .then(([disp, m, c, f, attrs]) => {
                setDispositivos(disp);
                setMarcas(m);
                setCategorias(c);
                setFunciones(f);
                setAtributos(attrs);
            })
            .catch(() => setError("No se pudieron cargar los datos del catalogo."))
            .finally(() => setCargando(false));
    }, []);

    if (cargando) {
        return <p className="text-muted-foreground">Cargando catalogo...</p>;
    }

    if (error) {
        return <p className="text-destructive">{error}</p>;
    }

    return (
        <div className="space-y-6">
            <DispositivoForm
                marcas={marcas}
                categorias={categorias}
                funciones={funciones}
                atributos={atributos}
                onDispositivoCreado={(d) => setDispositivos((prev) => [d, ...prev])}
            />
            <Separator />
            <h3 className="text-lg font-semibold">Ultimos Agregados</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {dispositivos.slice(0, 6).map((d) => (
                    <Card key={d.id} className="p-4">
                        <h4 className="font-bold">{d.modelo}</h4>
                        <p className="text-sm text-muted-foreground">{d.nombre_completo_producto}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
