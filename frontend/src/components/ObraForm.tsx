import { useState, type FormEvent } from "react";
import { crearObra, type Obra, type ObraPayload, type Cliente } from "../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";

// --- DATOS GEOGRÁFICOS ---
const PAISES = ["Argentina", "Chile", "Perú", "Otro"];

const PROVINCIAS: Record<string, string[]> = {
    Argentina: [
        "Buenos Aires",
        "Catamarca",
        "Chaco",
        "Chubut",
        "CABA",
        "Córdoba",
        "Corrientes",
        "Entre Ríos",
        "Formosa",
        "Jujuy",
        "La Pampa",
        "La Rioja",
        "Mendoza",
        "Misiones",
        "Neuquén",
        "Río Negro",
        "Salta",
        "San Juan",
        "San Luis",
        "Santa Cruz",
        "Santa Fe",
        "Santiago del Estero",
        "Tierra del Fuego",
        "Tucumán",
    ],
    Chile: [
        "Arica y Parinacota",
        "Tarapacá",
        "Antofagasta",
        "Atacama",
        "Coquimbo",
        "Valparaíso",
        "Metropolitana",
        "O'Higgins",
        "Maule",
        "Ñuble",
        "Biobío",
        "Araucanía",
        "Los Ríos",
        "Los Lagos",
        "Aysén",
        "Magallanes",
    ],
    Perú: [
        "Amazonas",
        "Áncash",
        "Apurímac",
        "Arequipa",
        "Ayacucho",
        "Cajamarca",
        "Callao",
        "Cusco",
        "Huancavelica",
        "Huánuco",
        "Ica",
        "Junín",
        "La Libertad",
        "Lambayeque",
        "Lima",
        "Loreto",
        "Madre de Dios",
        "Moquegua",
        "Pasco",
        "Piura",
        "Puno",
        "San Martín",
        "Tacna",
        "Tumbes",
        "Ucayali",
    ],
};

type ObraFormProps = {
    cliente: Cliente;
    onObraCreada: (nuevaObra: Obra) => void;
};

export function ObraForm({ cliente, onObraCreada }: ObraFormProps) {
    const [nombre, setNombre] = useState("");

    const [pais, setPais] = useState("Argentina");
    const [provincia, setProvincia] = useState("");
    const [direccion, setDireccion] = useState("");

    const [estado, setEstado] = useState("pendiente");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const handlePaisChange = (nuevoPais: string) => {
        setPais(nuevoPais);
        setProvincia("");
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        const payload: ObraPayload = {
            nombre_obra: nombre,
            cliente: cliente.id,
            estado_obra: estado,
            pais,
            provincia,
            ubicacion: direccion,
        };

        try {
            const nuevaObra = await crearObra(payload);
            onObraCreada(nuevaObra);
            setNombre("");
            setDireccion("");
            setProvincia("");
        } catch (err) {
            setError("Error al crear la obra.");
        } finally {
            setCargando(false);
        }
    };

    const provinciasPais = PROVINCIAS[pais] || [];
    const provinciasOptions = PROVINCIAS[pais]?.map((p) => ({ value: p, label: p })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Crear Nueva Obra para: {cliente.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="obra-form" className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="obra-nombre">Nombre de la Obra</Label>
                        <Input id="obra-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>

                    <div className="grid gap-2">
                        <Label>País</Label>
                        <Select value={pais} onValueChange={handlePaisChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar País" />
                            </SelectTrigger>
                            <SelectContent>
                                {PAISES.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Provincia / Estado</Label>
                        {provinciasPais.length > 0 ? (
                            <Combobox
                                options={provinciasOptions}
                                value={provincia}
                                onChange={setProvincia}
                                placeholder="Buscar provincia..."
                                emptyText="No se encontró la provincia."
                            />
                        ) : (
                            <Input
                                placeholder="Escriba la provincia..."
                                value={provincia}
                                onChange={(e) => setProvincia(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="obra-dir">Dirección / Calle</Label>
                        <Input
                            id="obra-dir"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            placeholder="Ej: Av. San Martín 1234"
                        />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="obra-estado">Estado Inicial</Label>
                        <Select value={estado} onValueChange={setEstado}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="realizada">Realizada</SelectItem>
                                <SelectItem value="rechazada">Rechazada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </form>
                {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button form="obra-form" type="submit" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar Obra"}
                </Button>
            </CardFooter>
        </Card>
    );
}
