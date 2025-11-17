/**
 * Pagina de gestion de Dispositivos del Catalogo.
 */
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
    listarMarcas,
    listarCategorias,
    listarFunciones,
    crearCatalogoDispositivo,
    type CatalogoDispositivoPayload,
    type Marca,
    type Categoria,
    type FuncionDispositivo,
} from "../services/api";

type DispositivoFormProps = {
    marcas: Marca[];
    categorias: Categoria[];
    funciones: FuncionDispositivo[];
};

function DispositivoForm({ marcas, categorias, funciones }: DispositivoFormProps) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [url, setUrl] = useState("");
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [especificaciones, setEspecificaciones] = useState('{\n  "potencia_w": 100\n}');
    const [funcionesIds, setFuncionesIds] = useState<number[]>([]);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState<string | null>(null);

    const handleFuncionesChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const opciones = Array.from(e.target.selectedOptions, (option) => Number(option.value));
        setFuncionesIds(opciones);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!marcaId || !categoriaId) {
            setError("Debe seleccionar una Marca y una Categoría.");
            return;
        }
        try {
            JSON.parse(especificaciones);
        } catch {
            setError("El campo 'Especificaciones' no es un JSON válido.");
            return;
        }

        setCargando(true);
        setError(null);
        setExito(null);

        const payload: CatalogoDispositivoPayload = {
            modelo,
            nombre_completo_producto: nombre,
            url_ficha_tecnica: url,
            marca: Number(marcaId),
            categoria: Number(categoriaId),
            especificaciones,
            funciones_soportadas: funcionesIds,
        };

        try {
            await crearCatalogoDispositivo(payload);
            setModelo("");
            setNombre("");
            setUrl("");
            setFuncionesIds([]);
            setExito("Dispositivo guardado correctamente.");
        } catch (err: any) {
            setError(err.message || "Error al guardar.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Registrar Nuevo Dispositivo</h3>
            <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
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
                <div className="form-group">
                    <label>Ficha Técnica (URL)</label>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Funciones Soportadas (Ctrl+Click)</label>
                    <select multiple value={funcionesIds.map(String)} onChange={handleFuncionesChange} size={Math.min(8, funciones.length || 4)}>
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
                    <textarea value={especificaciones} onChange={(e) => setEspecificaciones(e.target.value)} rows={5} />
                </div>
            </div>
            <button type="submit" disabled={cargando}>{cargando ? "Guardando..." : "Guardar Dispositivo"}</button>
            {error && <p className="error small-error">{error}</p>}
            {exito && <p className="success small-success">{exito}</p>}
        </form>
    );
}


export function DispositivosPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([listarMarcas(), listarCategorias(), listarFunciones()])
            .then(([listaMarcas, listaCats, listaFuncs]) => {
                setMarcas(listaMarcas);
                setCategorias(listaCats);
                setFunciones(listaFuncs);
            })
            .catch(() => setError("No se pudieron cargar las referencias del catálogo."))
            .finally(() => setCargando(false));
    }, []);

    if (cargando) {
        return <p>Cargando datos del catálogo...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="catalogo-grid">
            <DispositivoForm marcas={marcas} categorias={categorias} funciones={funciones} />
        </div>
    );
}
