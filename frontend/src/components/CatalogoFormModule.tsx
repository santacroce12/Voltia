import { useEffect, useState, type FormEvent } from "react";
import {
    crearCatalogoDispositivo,
    listarMarcas,
    listarCategorias,
    listarAtributosMaestros,
    type CatalogoDispositivo,
    type CatalogoDispositivoPayload,
    type Marca,
    type Categoria,
    type AtributoMaestro,
} from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Formulario para crear un dispositivo del catálogo con pestañas de datos fijos/variables
export function CatalogoFormModule({ onDispositivoCreado }: { onDispositivoCreado: (d: CatalogoDispositivo) => void }) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");

    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);
    const [especificaciones, setEspecificaciones] = useState<Record<number, string>>({});
    const [variablesIds, setVariablesIds] = useState<number[]>([]);

    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargando, setCargando] = useState(false);
    const [tab, setTab] = useState<"fijos" | "variables">("fijos");

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias(), listarAtributosMaestros()])
            .then(([m, c, a]) => {
                setMarcas(m);
                setCategorias(c);
                setAtributosMaestros(a);
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setCargando(true);

        const especificacionesSet = Object.entries(especificaciones)
            .filter(([, val]) => val.trim() !== "")
            .map(([id, val]) => ({ atributo: Number(id), valor: val }));

        const payload: CatalogoDispositivoPayload = {
            modelo,
            nombre_completo_producto: nombre,
            marca: Number(marcaId),
            categoria: Number(categoriaId),
            especificaciones_set: especificacionesSet,
            atributos_sugeridos: variablesIds,
            funciones_soportadas: [],
            url_ficha_tecnica: "",
        };

        try {
            const nuevo = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevo);
        } catch (e) {
            console.error(e);
        } finally {
            setCargando(false);
        }
    };

    const handleSpecChange = (id: number, val: string) => {
        setEspecificaciones((prev) => ({ ...prev, [id]: val }));
    };

    const handleVarToggle = (id: number, checked: boolean) => {
        setVariablesIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    };

    const textoFijos =
        'Aquí CARGAS UN VALOR. Concepto: Son datos que NUNCA CAMBIAN para este modelo. Ejemplo: Si estás creando el "Relé P5", la Potencia siempre será 100W.';
    const textoVariables =
        "Aquí ASIGNAS UNA OBLIGACIÓN (Marcas un checkbox). Concepto: Son datos que CAMBIAN en cada instalación física. No puedes saberlos ahora porque dependen de la obra (la IP, el número de serie, la ubicación).";

    return (
        <form className="grid gap-6 py-4" onSubmit={handleSubmit}>
            {/* Datos básicos */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Marca</Label>
                    <Select value={marcaId} onValueChange={setMarcaId}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>{marcas.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Categoría</Label>
                    <Select value={categoriaId} onValueChange={setCategoriaId}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>{categorias.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.categoria_principal}</SelectItem>)}</SelectContent>
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
            </div>

            <Separator />

            {/* Tabs */}
            <div className="grid w-full grid-cols-2 rounded-md border bg-muted/40">
                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-l-md ${tab === "fijos" ? "bg-background" : "text-muted-foreground"}`}
                    onClick={() => setTab("fijos")}
                >
                    1. Especificaciones (Fijas)
                    <span
                        className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/40 flex items-center justify-center"
                        title={textoFijos}
                        onClick={(e) => {
                            e.stopPropagation();
                            alert(textoFijos);
                        }}
                    >
                        ?
                    </span>
                </button>
                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-r-md ${tab === "variables" ? "bg-background" : "text-muted-foreground"}`}
                    onClick={() => setTab("variables")}
                >
                    2. Variables de Obra
                    <span
                        className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/40 flex items-center justify-center"
                        title={textoVariables}
                        onClick={(e) => {
                            e.stopPropagation();
                            alert(textoVariables);
                        }}
                    >
                        ?
                    </span>
                </button>
            </div>

            {tab === "fijos" && (
                <div className="border rounded-md p-4 bg-muted/10">
                    <p className="text-sm text-muted-foreground mb-4">
                        Ingrese los valores técnicos fijos de este modelo (Ej: Potencia, Voltaje). Si el valor depende de la instalación, déjelo vacío y configúrelo en la pestaña "Variables".
                    </p>
                    <div className="grid gap-3">
                        {atributosMaestros.map((attr) => (
                            <div key={attr.id} className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right">
                                    {attr.nombre} ({attr.unidad || "-"})
                                </Label>
                                <Input
                                    className="col-span-2 h-8"
                                    placeholder="Valor fijo..."
                                    value={especificaciones[attr.id] || ""}
                                    onChange={(e) => handleSpecChange(attr.id, e.target.value)}
                                    disabled={variablesIds.includes(attr.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "variables" && (
                <div className="border rounded-md p-4 bg-muted/10">
                    <p className="text-sm text-muted-foreground mb-4">
                        Seleccione qué datos son únicos por cada dispositivo y deben ser ingresados por Ingeniería (Ej: IP, Serial, Ubicación).
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        {atributosMaestros.map((attr) => (
                            <div key={attr.id} className="flex items-center space-x-2 border p-2 rounded bg-background">
                                <Checkbox
                                    id={`var-${attr.id}`}
                                    checked={variablesIds.includes(attr.id)}
                                    onCheckedChange={(checked) => handleVarToggle(attr.id, Boolean(checked))}
                                />
                                <Label htmlFor={`var-${attr.id}`} className="cursor-pointer flex-1">
                                    {attr.nombre}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit */}
            <Button type="submit" disabled={cargando} className="w-full mt-4">
                Guardar Definición de Dispositivo
            </Button>
        </form>
    );
}
