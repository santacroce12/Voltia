/**
 * Pagina de gestion de Dispositivos del Catalogo.
 */
import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import {
    listarCatalogoDispositivos,
    listarMarcas,
    listarCategorias,
    listarFunciones,
    crearCatalogoDispositivo,
    type CatalogoDispositivo,
    type CatalogoDispositivoPayload,
    type Marca,
    type Categoria,
    type FuncionDispositivo,
} from "../services/api";

type DispositivoFormProps = {
    marcas: Marca[];
    categorias: Categoria[];
    funciones: FuncionDispositivo[];
    onDispositivoCreado: (disp: CatalogoDispositivo) => void;
};

function DispositivoForm({ marcas, categorias, funciones, onDispositivoCreado }: DispositivoFormProps) {
    const [modelo, setModelo] = useState("");
    const [nombre, setNombre] = useState("");
    const [url, setUrl] = useState("");
    const [marcaId, setMarcaId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [especificaciones, setEspecificaciones] = useState('{\n  "potencia_w": 100\n}');
    const [funcionesIds, setFuncionesIds] = useState<number[]>([]);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            const nuevo = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevo);
            setModelo("");
            setNombre("");
            setUrl("");
            setFuncionesIds([]);
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
        </form>
    );
}

type FiltrosProps = {
    marcas: Marca[];
    categorias: Categoria[];
    filtroMarca: string;
    filtroCategoriaPrincipal: string;
    filtroSubcategoria: string;
    filtroTexto: string;
    onChange: (campo: string, valor: string) => void;
};

function FiltrosCatalogo({
    marcas,
    categorias,
    filtroMarca,
    filtroCategoriaPrincipal,
    filtroSubcategoria,
    filtroTexto,
    onChange,
}: FiltrosProps) {
    const categoriasPrincipales = Array.from(new Set(categorias.map((c) => c.categoria_principal))).sort();
    const subcategoriasDisponibles = Array.from(
        new Set(
            categorias
                .filter((c) => (filtroCategoriaPrincipal ? c.categoria_principal === filtroCategoriaPrincipal : true))
                .map((c) => c.subcategoria),
        ),
    ).sort();

    return (
        <div className="inline-form catalogo-filter-card">
            <div className="section-header">
                <h3>Listar Dispositivos</h3>
                <p>Visualiza el catálogo aplicando los filtros que necesites.</p>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                <div className="form-group">
                    <label>Marca</label>
                    <select value={filtroMarca} onChange={(e) => onChange("marca", e.target.value)}>
                        <option value="">Todas</option>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Categoría</label>
                    <select value={filtroCategoriaPrincipal} onChange={(e) => onChange("categoriaPrincipal", e.target.value)}>
                        <option value="">Todas</option>
                        {categoriasPrincipales.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Subcategoría</label>
                    <select value={filtroSubcategoria} onChange={(e) => onChange("subcategoria", e.target.value)}>
                        <option value="">Todas</option>
                        {subcategoriasDisponibles.map((subcategoria) => (
                            <option key={subcategoria} value={subcategoria}>
                                {subcategoria}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Buscar por nombre o modelo</label>
                    <input
                        type="text"
                        value={filtroTexto}
                        onChange={(e) => onChange("texto", e.target.value)}
                        placeholder="Ej: Protección"
                    />
                </div>
            </div>
        </div>
    );
}

function TablaCatalogo({ dispositivos }: { dispositivos: CatalogoDispositivo[] }) {
    if (dispositivos.length === 0) {
        return <p className="placeholder">No hay dispositivos con los filtros seleccionados.</p>;
    }

    return (
        <div className="table-wrapper">
            <table className="catalogo-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Marca</th>
                        <th>Categoría</th>
                        <th>Modelo</th>
                        <th>Nombre Comercial</th>
                        <th>Funciones</th>
                    </tr>
                </thead>
                <tbody>
                    {dispositivos.map((d) => (
                        <tr key={d.id}>
                            <td>{d.id}</td>
                            <td>{d.marca_nombre ?? d.marca}</td>
                            <td>{d.categoria_nombre ?? d.categoria}</td>
                            <td>{d.modelo}</td>
                            <td>{d.nombre_completo_producto}</td>
                            <td>{d.funciones_soportadas?.length ?? 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function DispositivosPage() {
    const [dispositivos, setDispositivos] = useState<CatalogoDispositivo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);

    const [filtroMarca, setFiltroMarca] = useState("");
    const [filtroCategoriaPrincipal, setFiltroCategoriaPrincipal] = useState("");
    const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
    const [filtroTexto, setFiltroTexto] = useState("");

    useEffect(() => {
        Promise.all([listarCatalogoDispositivos(), listarMarcas(), listarCategorias(), listarFunciones()])
            .then(([listaDisp, listaMarcas, listaCats, listaFuncs]) => {
                setDispositivos(listaDisp);
                setMarcas(listaMarcas);
                setCategorias(listaCats);
                setFunciones(listaFuncs);
            })
            .catch(() => console.error("No se pudo cargar el catálogo"));
    }, []);

    const categoriaLookup = useMemo(() => {
        const mapa = new Map<number, Categoria>();
        categorias.forEach((cat) => mapa.set(cat.id, cat));
        return mapa;
    }, [categorias]);

    const dispositivosFiltrados = useMemo(() => {
        return dispositivos.filter((d) => {
            const coincideMarca = filtroMarca ? d.marca === Number(filtroMarca) : true;
            const categoriaInfo = categoriaLookup.get(d.categoria);
            const coincideCategoriaPrincipal = filtroCategoriaPrincipal
                ? categoriaInfo?.categoria_principal === filtroCategoriaPrincipal
                : true;
            const coincideSub = filtroSubcategoria ? categoriaInfo?.subcategoria === filtroSubcategoria : true;
            const search = filtroTexto.toLowerCase();
            const coincideTexto = search
                ? d.nombre_completo_producto.toLowerCase().includes(search) ||
                  d.modelo.toLowerCase().includes(search)
                : true;
            return coincideMarca && coincideCategoriaPrincipal && coincideSub && coincideTexto;
        });
    }, [dispositivos, filtroMarca, filtroCategoriaPrincipal, filtroSubcategoria, filtroTexto, categoriaLookup]);

    const handleFiltroChange = (campo: string, valor: string) => {
        if (campo === "marca") setFiltroMarca(valor);
        if (campo === "categoriaPrincipal") {
            setFiltroCategoriaPrincipal(valor);
            setFiltroSubcategoria("");
        }
        if (campo === "subcategoria") setFiltroSubcategoria(valor);
        if (campo === "texto") setFiltroTexto(valor);
    };

    const handleDispositivoCreado = (nuevo: CatalogoDispositivo) => {
        setDispositivos([nuevo, ...dispositivos]);
    };

    return (
        <div className="catalogo-grid">
            <DispositivoForm
                marcas={marcas}
                categorias={categorias}
                funciones={funciones}
                onDispositivoCreado={handleDispositivoCreado}
            />

            <section className="catalogo-list-section">
                <FiltrosCatalogo
                    marcas={marcas}
                    categorias={categorias}
                    filtroMarca={filtroMarca}
                    filtroCategoriaPrincipal={filtroCategoriaPrincipal}
                    filtroSubcategoria={filtroSubcategoria}
                    filtroTexto={filtroTexto}
                    onChange={handleFiltroChange}
                />
                <div className="catalogo-table-card">
                    <TablaCatalogo dispositivos={dispositivosFiltrados} />
                </div>
            </section>
        </div>
    );
}
