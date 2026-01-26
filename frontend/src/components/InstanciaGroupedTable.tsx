import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { type InstanciaDispositivo, type AtributoMaestro, borrarInstancia } from "../services/api";
import { cn } from "@/lib/utils";

type GroupedInstance = {
    count: number;
    catalogoId: number;
    marca: string;
    nombre: string;
    instanciaIds: number[];
    instancias: InstanciaDispositivo[];
    funcionesKey: string;
    funcionesCount: number;
};

type Props = {
    instancias: InstanciaDispositivo[];
    masterAtributos: AtributoMaestro[];
    onRefresh: () => void;
    onEdit: (instancias: InstanciaDispositivo[]) => void;
};

export function InstanciaGroupedTable({ instancias, masterAtributos, onRefresh, onEdit }: Props) {
    const [seleccionados, setSeleccionados] = useState<number[]>([]);

    const atributosMap = useMemo(() => {
        const map = new Map<number, AtributoMaestro>();
        masterAtributos.forEach((attr) => map.set(attr.id, attr));
        return map;
    }, [masterAtributos]);

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
                    instancias: [],
                    funcionesKey: sortedFuncs,
                    funcionesCount: inst.funciones_usadas.length,
                });
            }
            const grupo = groups.get(key)!;
            grupo.count += 1;
            grupo.instanciaIds.push(inst.id);
            grupo.instancias.push(inst);
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
        if (!seleccionados.length || !confirm(`Seguro que quieres borrar ${seleccionados.length} dispositivos?`)) return;
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

    const normalizePrice = (value: unknown): number | null => {
        if (value === null || value === undefined) return null;
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const formatPrice = (value: number | null): string => {
        if (value === null) return "N/A";
        return `$${value.toFixed(2)}`;
    };

    const renderAtributos = (grupo: GroupedInstance) => {
        const lista = new Map<string, { label: string }>();
        grupo.instancias.forEach((inst) => {
            inst.atributos_set?.forEach((attr) => {
                const maestro = atributosMap.get(attr.atributo);
                const nombre = maestro?.nombre || attr.nombre_atributo || `Atributo #${attr.atributo}`;
                const unidad = maestro?.unidad || attr.unidad_atributo || "";
                const label = `${nombre}: ${attr.valor}${unidad ? ` ${unidad}` : ""}`;
                lista.set(`${attr.atributo}-${attr.valor}`, { label });
            });
        });

        const valores = Array.from(lista.values());
        if (valores.length === 0) {
            return <span className="text-xs text-muted-foreground italic">- Sin atributos -</span>;
        }

        const visibles = valores.slice(0, 3);
        const restantes = valores.length - visibles.length;
        const tooltip = restantes > 0 ? valores.slice(3).map((v) => v.label).join(", ") : "";

        return (
            <>
                {visibles.map((v) => (
                    <span
                        key={v.label}
                        className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                        {v.label}
                    </span>
                ))}
                {restantes > 0 && (
                    <span
                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
                        title={tooltip}
                    >
                        +{restantes} mas
                    </span>
                )}
            </>
        );
    };

    const renderPrecio = (grupo: GroupedInstance) => {
        const precios = grupo.instancias
            .map((inst) => normalizePrice(inst.precio_real))
            .filter((value): value is number => value !== null);
        const unique = Array.from(new Set(precios.map((value) => value.toFixed(2))));

        let precioReal: number | null = null;
        let precioLabel = "N/A";
        if (unique.length === 1 && precios.length > 0) {
            precioReal = precios[0];
            precioLabel = formatPrice(precioReal);
        } else if (unique.length > 1) {
            precioLabel = "Varios";
        }

        const precioRef = normalizePrice(grupo.instancias[0]?.catalogo_precio_historico);
        const mostrarRef = precioRef !== null;

        return (
            <div className="flex flex-col">
                <span
                    className={cn(
                        "font-semibold",
                        precioLabel !== "N/A" && precioLabel !== "Varios" && "text-green-600",
                        precioLabel === "N/A" && "text-muted-foreground",
                    )}
                >
                    {precioLabel}
                </span>
                {mostrarRef && (
                    <span className="text-xs text-muted-foreground line-through">
                        Ref: {formatPrice(precioRef)}
                    </span>
                )}
            </div>
        );
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
                            <TableHead className="text-center">Configuracion de Funciones</TableHead>
                            <TableHead>Atributos</TableHead>
                            <TableHead className="text-right">Costos (USD)</TableHead>
                            <TableHead className="text-right w-24">TOTAL</TableHead>
                            <TableHead className="w-12 text-center">Accion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grupos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                                    No hay dispositivos cargados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            grupos.map((grupo) => (
                                <TableRow key={grupo.catalogoId + grupo.funcionesKey} className={cn("hover:bg-primary/5")}>
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
                                        {grupo.funcionesCount === 0 ? "Sin configuracion" : `${grupo.funcionesCount} funciones`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">{renderAtributos(grupo)}</div>
                                    </TableCell>
                                    <TableCell className="text-right">{renderPrecio(grupo)}</TableCell>
                                    <TableCell className="text-right text-xl font-bold text-primary">{grupo.count}</TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(grupo.instancias)}
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
