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
import { DynamicAttributeForm } from "./DynamicAttributeForm";

// Formulario para crear un dispositivo del catalogo con valores fijos
export function CatalogoFormModule({ onDispositivoCreado }: { onDispositivoCreado: (d: CatalogoDispositivo) => void }) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [atributosMaestros, setAtributosMaestros] = useState<AtributoMaestro[]>([]);
    const [especificaciones, setEspecificaciones] = useState<Record<number, string>>({});
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargando, setCargando] = useState(false);

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
            funciones_soportadas: [],
            url_ficha_tecnica: "",
        };

        try {
            const nuevo = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevo);
            setModelo("");
            setNombre("");
            setMarcaId("");
            setCategoriaId("");
            setEspecificaciones({});
        } catch (e) {
            console.error(e);
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
                        <SelectContent>{marcas.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Categoria</Label>
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

            <div className="border rounded-md p-4 bg-muted/10">
                <p className="text-sm text-muted-foreground mb-4">
                    Especificaciones fijas del modelo (texto libre).
                </p>
                <DynamicAttributeForm
                    todosLosAtributos={atributosMaestros}
                    valores={especificaciones}
                    onChange={setEspecificaciones}
                />
            </div>

            <Button type="submit" disabled={cargando} className="w-full mt-4">
                Guardar Definicion de Dispositivo
            </Button>
        </form>
    );
}
