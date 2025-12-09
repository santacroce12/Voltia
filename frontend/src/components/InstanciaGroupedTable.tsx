import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Pencil } from "lucide-react";
import { type InstanciaDispositivo, borrarInstancia } from "../services/api";
import { cn } from "@/lib/utils";

type GroupedInstance = {
    count: number;
    catalogoId: number;
    marca: string;
    nombre: string;
    instanciaIds: number[];
    funcionesKey: string;
    funcionesCount: number;
};

type Props = {
    instancias: InstanciaDispositivo[];
    onRefresh: () => void;
    onVerDetalle: (instanciaId: number) => void;
};

export function InstanciaGroupedTable({ instancias, onRefresh, onVerDetalle }: Props) {
    const [seleccionados, setSeleccionados] = useState<number[]>([]);

    const grupos = useMemo(() => {
        const groups = new Map<string, GroupedInstance>();
        instancias.forEach((inst) => {
            const sortedFuncs = inst.funciones_usadas.slice().sort().join(",");
            const key = `${inst.catalogo}_${sortedFuncs}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    count: 0,
                    catalogoId: inst.catalogo,
                    marca: inst.marca_dispositivo || "Sin Marca",
                    nombre: inst.nombre_dispositivo || "Desconocido",
                    instanciaIds: [],
                    funcionesKey: sortedFuncs,
                    funcionesCount: inst.funciones_usadas.length,
                });
            }
            const grupo = groups.get(key)!;
            grupo.count += 1;
            grupo.instanciaIds.push(inst.id);
        });
        return Array.from(groups.values());
    }, [instancias]);

    const handleToggleGroup = (grupo: GroupedInstance, checked: boolean) => {
        setSeleccionados((prev) => {
            const set = new Set(prev);
            grupo.instanciaIds.forEach((id) => {
                if (checked) set.add(id);
                else set.delete(id);
            });
            return Array.from(set);
        });
    };

    const handleBorradoLote = async () => {
        if (!seleccionados.length || !confirm(`?Seguro que quieres borrar ${seleccionados.length} dispositivos?`)) return;
        for (const id of seleccionados) {
            try {
                await borrarInstancia(id);
            } catch (e) {
                console.error(`Fallo al borrar instancia ${id}`, e);
            }
        }
        setSeleccionados([]);
        onRefresh();
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Inventario de Dispositivos (Agrupado)</CardTitle>
                <Button variant="destructive" size="sm" onClick={handleBorradoLote} disabled={!seleccionados.length}>
                    <Trash2 className="h-4 w-4 mr-2" /> Borrar Lote ({seleccionados.length})
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={seleccionados.length === instancias.length && instancias.length > 0}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSeleccionados(instancias.map((i) => i.id));
                                        else setSeleccionados([]);
                                    }}
                                />
                            </TableHead>
                            <TableHead>Marca / Modelo</TableHead>
                            <TableHead className="text-center">Configuración de Funciones</TableHead>
                            <TableHead className="text-right w-24">TOTAL</TableHead>
                            <TableHead className="w-12 text-center">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grupos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                    No hay dispositivos cargados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            grupos.map((grupo) => (
                                <TableRow
                                    key={grupo.catalogoId + grupo.funcionesKey}
                                    className={cn("hover:bg-primary/5")}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={grupo.instanciaIds.every((id) => seleccionados.includes(id))}
                                            onCheckedChange={(checked) => handleToggleGroup(grupo, Boolean(checked))}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {grupo.nombre}
                                        <div className="text-xs text-muted-foreground">{grupo.marca}</div>
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        {grupo.funcionesCount === 0 ? "Sin configuración" : `${grupo.funcionesCount} funciones`}
                                    </TableCell>
                                    <TableCell className="text-right text-xl font-bold text-primary">{grupo.count}</TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onVerDetalle(grupo.instanciaIds[0])}
                                            title="Editar / Ver detalle"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
