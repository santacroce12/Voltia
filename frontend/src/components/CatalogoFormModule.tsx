/**
 * CatalogoFormModule.tsx
 * Formulario para crear un dispositivo, diseñado para ser reutilizado (ej. en un modal).
 */
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
    crearCatalogoDispositivo,
    listarMarcas,
    listarCategorias,
    listarFunciones,
    type CatalogoDispositivo,
    type CatalogoDispositivoPayload,
    type Marca,
    type Categoria,
    type FuncionDispositivo,
} from "../services/api";

type CatalogoFormProps = {
    onDispositivoCreado: (disp: CatalogoDispositivo) => void;
};

export function CatalogoFormModule({ onDispositivoCreado }: CatalogoFormProps) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [especificaciones, setEspecificaciones] = useState("{}");
    const [funcionesIds, setFuncionesIds] = useState<number[]>([]);

    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias(), listarFunciones()])
            .then(([listaMarcas, listaCats, listaFuncs]) => {
                setMarcas(listaMarcas);
                setCategorias(listaCats);
                setFunciones(listaFuncs);
            })
            .catch(() => setError("No se pudieron cargar las bibliotecas."));
    }, []);

    const handleFuncionesChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const opciones = Array.from(e.target.selectedOptions, (option) => Number(option.value));
        setFuncionesIds(opciones);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        setError(null);

        try {
            JSON.parse(especificaciones);
        } catch {
            setError("El campo 'Especificaciones' no es un JSON válido.");
            setCargando(false);
            return;
        }

        const payload: CatalogoDispositivoPayload = {
            modelo,
            nombre_completo_producto: nombre,
            marca: Number(marcaId),
            categoria: Number(categoriaId),
            especificaciones,
            funciones_soportadas: funcionesIds,
        };

        try {
            const nuevoDisp = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevoDisp);
            setModelo("");
            setNombre("");
            setEspecificaciones("{}");
            setFuncionesIds([]);
        } catch (err: any) {
            setError(err.message || "Error al guardar.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="form-group">
                    <label>Marca</label>
                    <select value={marcaId} onChange={(e) => setMarcaId(e.target.value)} required>
                        <option value="" disabled>
                            -- Seleccionar --
                        </option>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Categoría</label>
                    <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                        <option value="" disabled>
                            -- Seleccionar --
                        </option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.categoria_principal} &gt; {c.subcategoria}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Modelo</label>
                    <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Funciones Soportadas (Ctrl+Click)</label>
                    <select multiple value={funcionesIds.map(String)} onChange={handleFuncionesChange} size={5}>
                        {funciones.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.codigo_funcion ? `${f.codigo_funcion} - ` : ""}
                                {f.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Especificaciones (JSON)</label>
                    <textarea
                        value={especificaciones}
                        onChange={(e) => setEspecificaciones(e.target.value)}
                        rows={3}
                    />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar Dispositivo"}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}
