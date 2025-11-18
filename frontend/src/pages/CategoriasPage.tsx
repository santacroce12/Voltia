import { useEffect, useState, type FormEvent } from "react";
import { listarCategorias, crearCategoria, type Categoria } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function CategoriaForm({ onCategoriaCreada }: { onCategoriaCreada: (cat: Categoria) => void }) {
    const [principal, setPrincipal] = useState("");
    const [subcategoria, setSubcategoria] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true); setError(null);
        try {
            const nueva = await crearCategoria({ categoria_principal: principal, subcategoria });
            onCategoriaCreada(nueva);
            setPrincipal(""); setSubcategoria("");
        } catch { setError("Error al guardar."); } 
        finally { setCargando(false); }
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader><CardTitle>Registrar Nueva Categoria</CardTitle></CardHeader>
            <CardContent>
                <form id="cat-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Categoria Principal</Label>
                        <Input value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="Ej: Reles" required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Sub-Categoria</Label>
                        <Input value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)} placeholder="Ej: Proteccion" required />
                    </div>
                </form>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="cat-form" type="submit" disabled={cargando}>{cargando ? "Guardando..." : "Guardar Categoria"}</Button>
            </CardFooter>
        </Card>
    );
}

export function CategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    useEffect(() => { listarCategorias().then(setCategorias).catch(console.error); }, []);
    return (
        <div className="space-y-8">
            <CategoriaForm onCategoriaCreada={(c) => setCategorias([c, ...categorias])} />
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categorias Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categorias.map((c) => (
                        <Card key={c.id} className="hover:shadow-md transition-all border-l-4 hover:border-l-primary">
                            <CardHeader className="p-5">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {c.categoria_principal}
                                </p>
                                <CardTitle className="text-lg font-semibold leading-tight">
                                    {c.subcategoria}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
