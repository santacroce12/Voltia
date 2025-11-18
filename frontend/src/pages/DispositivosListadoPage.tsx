import { useEffect, useState } from "react";
import { listarCatalogoDispositivos, type CatalogoDispositivo } from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function DispositivosListadoPage() {
    const [dispositivos, setDispositivos] = useState<CatalogoDispositivo[]>([]);
    const [filtro, setFiltro] = useState("");

    useEffect(() => {
        listarCatalogoDispositivos().then(setDispositivos).catch(console.error);
    }, []);

    const filtrados = dispositivos.filter((d) =>
        d.nombre_completo_producto.toLowerCase().includes(filtro.toLowerCase()) ||
        d.modelo.toLowerCase().includes(filtro.toLowerCase())
    );

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
                                <TableHead className="text-right">Funciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtrados.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{(d as any).marca_nombre ?? d.marca}</TableCell>
                                    <TableCell>{d.modelo}</TableCell>
                                    <TableCell>{d.nombre_completo_producto}</TableCell>
                                    <TableCell>{(d as any).categoria_nombre ?? d.categoria}</TableCell>
                                    <TableCell className="text-right">{d.funciones_soportadas.length}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
