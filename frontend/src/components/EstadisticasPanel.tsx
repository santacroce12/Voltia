import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InstanciaDispositivo } from "../services/api";

type EstadisticasPanelProps = {
    instancias: InstanciaDispositivo[];
};

export function EstadisticasPanel({ instancias }: EstadisticasPanelProps) {
    const stats = instancias.reduce(
        (acc, instancia) => {
            const marca = instancia.marca_dispositivo || "Sin Marca";
            const nombre = instancia.nombre_dispositivo?.trim() || "Sin nombre";
            const key = String(instancia.catalogo);

            acc.porMarca[marca] = (acc.porMarca[marca] || 0) + 1;
            const actual = acc.porDispositivo[key] || { nombre, marca, total: 0 };
            actual.nombre = nombre;
            actual.marca = marca;
            actual.total += 1;
            acc.porDispositivo[key] = actual;
            acc.total += 1;
            return acc;
        },
        {
            total: 0,
            porMarca: {} as Record<string, number>,
            porDispositivo: {} as Record<
                string,
                {
                    nombre: string;
                    marca: string;
                    total: number;
                }
            >,
        },
    );

    const marcasOrdenadas = Object.entries(stats.porMarca).sort(([, a], [, b]) => b - a);
    const dispositivosOrdenados = Object.values(stats.porDispositivo).sort((a, b) => b.total - a.total);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">TOTAL DE DISPOSITIVOS</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-primary">{stats.total}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-3 border-b">
                    <CardTitle className="text-base">Desglose por Dispositivo</CardTitle>
                </CardHeader>
                <CardContent className="p-0 max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dispositivo</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dispositivosOrdenados.map((disp, index) => (
                                <TableRow key={`${disp.nombre}-${index}`}>
                                    <TableCell>{disp.nombre}</TableCell>
                                    <TableCell>{disp.marca}</TableCell>
                                    <TableCell className="text-right font-bold">{disp.total}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={2} className="font-semibold">
                                    Total general
                                </TableCell>
                                <TableCell className="text-right font-bold">{stats.total}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-3 border-b">
                    <CardTitle className="text-base">Desglose por Marca</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {marcasOrdenadas.map(([marca, total]) => (
                                <TableRow key={marca}>
                                    <TableCell>{marca}</TableCell>
                                    <TableCell className="text-right font-bold">{total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
