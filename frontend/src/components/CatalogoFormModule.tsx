import { useEffect, useState, type FormEvent } from "react";
import {
    crearCatalogoDispositivo,
    listarMarcas,
    listarCategorias,
    listarAtributosMaestros,
    listarFunciones,
    type CatalogoDispositivo,
    type CatalogoDispositivoPayload,
    type Marca,
    type Categoria,
    type AtributoMaestro,
    type FuncionDispositivo,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DynamicAttributeForm } from "./DynamicAttributeForm";
import { Checkbox } from "@/components/ui/checkbox";

// Formulario para crear un dispositivo del catalogo con valores fijos
export function CatalogoFormModule({ onDispositivoCreado }: { onDispositivoCreado: (d: CatalogoDispositivo) => void }) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [urlFicha, setUrlFicha] = useState("");
    const [precioHistorico, setPrecioHistorico] = useState<number>(0);
    const [precioActual, setPrecioActual] = useState<number | null>(null);
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);
    const [especificaciones, setEspecificaciones] = useState<Record<number, string>>({});
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias(), listarAtributosMaestros(), listarFunciones()])
            .then(([m, c, a, f]) => {
                setMarcas(m);
                setCategorias(c);
                setAtributosMaestros(a);
                setFunciones(f);
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!marcaId || !categoriaId || !modelo.trim() || !nombre.trim()) {
            setError("Completa marca, categoria, modelo y nombre.");
            return;
        }
        setCargando(true);
        setError(null);

        const especificacionesSet = Object.entries(especificaciones).map(([id, val]) => ({
            atributo: Number(id),
            valor: val,
        }));

        const payload: CatalogoDispositivoPayload = {
            modelo,
            nombre_completo_producto: nombre,
            marca: Number(marcaId),
            categoria: Number(categoriaId),
            especificaciones_set: especificacionesSet,
            funciones_soportadas: funcionesSeleccionadas,
            url_ficha_tecnica: urlFicha || undefined,
            precio_historico: precioHistorico || 0,
            precio_actual: precioActual ?? null,
        };

        try {
            const nuevo = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevo);
            setModelo("");
            setNombre("");
            setUrlFicha("");
            setPrecioHistorico(0);
            setPrecioActual(null);
            setMarcaId("");
            setCategoriaId("");
            setEspecificaciones({});
            setFuncionesSeleccionadas([]);
            setError(null);
        } catch (e) {
            console.error(e);
            setError("No se pudo crear el dispositivo. Verifica los datos.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="grid gap-6 py-4" onSubmit={handleSubmit}>
            {/* Datos basicos */}
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
                            {categorias.map((c) => {
                                const label = c.subcategoria
                                    ? `${c.categoria_principal} > ${c.subcategoria}`
                                    : c.categoria_principal;
                                return (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {label}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Modelo</Label>
                    <Input value={modelo} onChange={(e) => setModelo(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label>Nombre Completo</Label>
                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div className="grid gap-2 col-span-2">
                    <Label>Ficha Tecnica (PDF/Link)</Label>
                    <Input
                        value={urlFicha}
                        onChange={(e) => setUrlFicha(e.target.value)}
                        placeholder="https://..."
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Precio Historico (Referencia USD) *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={precioHistorico || ""}
                        onChange={(e) => setPrecioHistorico(Number(e.target.value))}
                        placeholder="Ej: 30.00"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Precio Actual (USD)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={precioActual ?? ""}
                        onChange={(e) => setPrecioActual(e.target.value === "" ? null : Number(e.target.value))}
                        placeholder="Ej: 35.00"
                    />
                </div>
            </div>

            <div className="border rounded-md p-4 bg-muted/10">
                <p className="text-sm text-muted-foreground mb-2">
                    Agrega los atributos que aplican a este modelo. Si dejas el valor vacio se pedira en obra; si cargas un valor sera el defecto heredado.
                </p>
                <DynamicAttributeForm
                    todosLosAtributos={atributosMaestros}
                    valores={especificaciones}
                    onChange={setEspecificaciones}
                />
            </div>

            <div className="border rounded-md p-4 bg-muted/10 space-y-2">
                <Label className="text-sm font-semibold">Funciones soportadas</Label>
                <p className="text-xs text-muted-foreground">Selecciona las funciones que este modelo trae de fabrica.</p>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {funciones.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No hay funciones disponibles.</p>
                    ) : (
                        funciones.map((f) => (
                            <label key={f.id} className="flex items-center gap-2 text-sm rounded px-2 py-1 hover:bg-muted">
                                <Checkbox
                                    checked={funcionesSeleccionadas.includes(f.id)}
                                    onCheckedChange={() =>
                                        setFuncionesSeleccionadas((prev) =>
                                            prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id],
                                        )
                                    }
                                />
                                <span>
                                    {f.codigo_funcion ? `[${f.codigo_funcion}] ` : ""}
                                    {f.nombre}
                                </span>
                            </label>
                        ))
                    )}
                </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={cargando} className="w-full mt-4">
                Guardar Definicion de Dispositivo
            </Button>
        </form>
    );
}
