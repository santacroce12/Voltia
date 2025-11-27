import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    crearCatalogoDispositivo,
    listarMarcas,
    listarCategorias,
    listarFunciones,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicAttributeForm } from "./DynamicAttributeForm";

export function CatalogoFormModule({ onDispositivoCreado }: { onDispositivoCreado: (d: CatalogoDispositivo) => void }) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [valoresEAV, setValoresEAV] = useState<Record<number, string>>({});
    const [atributosSugeridosIds, setAtributosSugeridosIds] = useState<number[]>([]);
    const [funcionesIds, setFuncionesIds] = useState<number[]>([]);
    const [busquedaFunciones, setBusquedaFunciones] = useState("");
    
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias(), listarFunciones(), listarAtributosMaestros()])
            .then(([m, c, f, attrs]) => {
                setMarcas(m); setCategorias(c); setFunciones(f); setAtributosMaestros(attrs);
            })
            .catch(console.error);
    }, []);

    const funcionesFiltradas = useMemo(() => {
        const termino = busquedaFunciones.trim().toLowerCase();
        if (!termino) return funciones;
        return funciones.filter((f) => `${f.codigo_funcion ?? ""} ${f.nombre}`.toLowerCase().includes(termino));
    }, [funciones, busquedaFunciones]);

    const toggleFuncion = (id: number) => {
        setFuncionesIds((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setCargando(true);
        const payload: CatalogoDispositivoPayload = {
            modelo,
            nombre_completo_producto: nombre,
            marca: Number(marcaId),
            categoria: Number(categoriaId),
            especificaciones_set: Object.entries(valoresEAV)
                .filter(([, v]) => v !== undefined)
                .map(([attrId, valor]) => ({ atributo: Number(attrId), valor })),
            funciones_soportadas: funcionesIds,
            atributos_sugeridos: atributosSugeridosIds,
        };
        try {
            const nuevo = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevo);
            setModelo("");
            setNombre("");
            setMarcaId("");
            setCategoriaId("");
            setValoresEAV({});
            setFuncionesIds([]);
            setBusquedaFunciones("");
            setAtributosSugeridosIds([]);
        } catch (e) {
            console.error(e);
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Marca</Label>
                    <Select value={marcaId} onValueChange={setMarcaId}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                            {marcas.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                    {m.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select value={categoriaId} onValueChange={setCategoriaId}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                            {categorias.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.categoria_principal}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Modelo</Label>
                <Input value={modelo} onChange={(e) => setModelo(e.target.value)} required />
            </div>
            <div className="grid gap-2">
                <Label>Nombre comercial</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <DynamicAttributeForm definiciones={atributosMaestros} valores={valoresEAV} onChange={setValoresEAV} />
            <div className="grid gap-2">
                <Label>Atributos Variables (Plantilla para instancias)</Label>
                <div className="rounded-md border p-3 space-y-2 max-h-48 overflow-y-auto bg-muted/30">
                    {atributosMaestros.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay atributos maestros creados.</p>
                    ) : (
                        atributosMaestros.map((attr) => (
                            <label key={attr.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={atributosSugeridosIds.includes(attr.id)}
                                    onCheckedChange={() =>
                                        setAtributosSugeridosIds((prev) =>
                                            prev.includes(attr.id)
                                                ? prev.filter((id) => id !== attr.id)
                                                : [...prev, attr.id],
                                        )
                                    }
                                />
                                <span>
                                    {attr.nombre}
                                    {attr.unidad ? ` (${attr.unidad})` : ""}
                                </span>
                            </label>
                        ))
                    )}
                </div>
            </div>
            <div className="grid gap-2">
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
                                    id={`func-${f.id}`}
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
            <Button type="submit" disabled={cargando}>
                Guardar Dispositivo
            </Button>
        </form>
    );
}
