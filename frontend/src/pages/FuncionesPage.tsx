import { useEffect, useState, type FormEvent } from "react";
import { listarFunciones, crearFuncion, type FuncionDispositivo } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
            setCodigo(""); setNombre("");
        } catch { console.error("Error"); } 
        finally { setCargando(false); }
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader><CardTitle>Nueva Funcion</CardTitle></CardHeader>
            <CardContent>
                <form id="func-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Codigo (ANSI)</Label>
                        <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: 50/51" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Nombre</Label>
                        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Sobrecorriente" required />
                    </div>
                </form>
            </CardContent>
            <CardFooter><Button form="func-form" disabled={cargando}>Guardar</Button></CardFooter>
        </Card>
    );
}

export function FuncionesPage() {
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    useEffect(() => { listarFunciones().then(setFunciones).catch(console.error); }, []);
    return (
        <div className="space-y-8">
            <FuncionForm onFuncionCreada={(f) => setFunciones([f, ...funciones])} />
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Funciones Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {funciones.map((f) => (
                        <Card key={f.id} className="p-3 flex items-center gap-3 hover:bg-accent/5 transition-colors">
                            <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-muted font-mono text-xs font-bold text-primary">
                                {f.codigo_funcion || "#"}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate font-medium text-sm" title={f.nombre}>
                                    {f.nombre}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
