import { useEffect, useState, type FormEvent } from "react";
import { listarMarcas, crearMarca, type Marca } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

function MarcaList({ marcas }: { marcas: Marca[] }) {
    if (marcas.length === 0) return <div className="text-center text-muted-foreground py-12 border rounded-lg bg-muted/10">No hay marcas registradas.</div>;
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {marcas.map((m) => (
                <Card key={m.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                    <CardContent className="p-6 flex items-center justify-center text-center">
                        <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {m.nombre}
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    useEffect(() => { listarMarcas().then(setMarcas).catch(console.error); }, []);
    return (
        <div className="space-y-8">
            <MarcaForm onMarcaCreada={(m) => setMarcas([m, ...marcas])} />
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Marcas Registradas</h3>
                <MarcaList marcas={marcas} />
            </div>
        </div>
    );
}
