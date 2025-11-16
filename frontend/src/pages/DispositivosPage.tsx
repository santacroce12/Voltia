/**
 * Pagina de gestion de Dispositivos del Catalogo.
 */
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
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

function DispositivoForm({
    marcas,
    categorias,
    funciones,
    onDispositivoCreado,
}: DispositivoFormProps) {
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
            const nuevoDisp = await crearCatalogoDispositivo(payload);
            onDispositivoCreado(nuevoDisp);
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
            <h3>Registrar Nuevo Dispositivo (Catálogo)</h3>
            <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                <div className="form-group">
                    <label htmlFor="disp-marca">Marca</label>
                    <select
                        id="disp-marca"
                        value={marcaId}
                        onChange={(e) => setMarcaId(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            -- Seleccionar Marca --
                        </option>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="disp-cat">Categoría</label>
                    <select
                        id="disp-cat"
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            -- Seleccionar Categoría --
                        </option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.categoria_principal} &gt; {c.subcategoria}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="disp-modelo">Modelo</label>
                    <input
                        id="disp-modelo"
                        type="text"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="disp-nombre">Nombre Completo</label>
                    <input
                        id="disp-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="disp-url">Ficha Técnica (URL)</label>
                    <input
                        id="disp-url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="disp-funciones">Funciones Soportadas (Ctrl+Click)</label>
                    <select
                        id="disp-funciones"
                        multiple
                        value={funcionesIds.map(String)}
                        onChange={handleFuncionesChange}
                        size={Math.min(8, funciones.length || 4)}
                    >
                        {funciones.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.codigo_funcion ? `${f.codigo_funcion} - ` : ""}
                                {f.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="disp-specs">Especificaciones (JSON)</label>
                    <textarea
                        id="disp-specs"
                        value={especificaciones}
                        onChange={(e) => setEspecificaciones(e.target.value)}
                        rows={6}
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

function DispositivoList({ dispositivos }: { dispositivos: CatalogoDispositivo[] }) {
    return (
        <section className="cards-wrapper">
            <h3>Dispositivos en Catálogo</h3>
            {dispositivos.length === 0 ? (
                <p className="placeholder">No hay dispositivos.</p>
            ) : (
                <div className="cards small-cards">
                    {dispositivos.map((d) => (
                        <article key={d.id} className="card">
                            <h3>{d.nombre_completo_producto}</h3>
                            <p>Modelo: {d.modelo}</p>
                            <small>ID: {d.id} · Marca ID: {d.marca}</small>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export function DispositivosPage() {
    const [dispositivos, setDispositivos] = useState<CatalogoDispositivo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [funciones, setFunciones] = useState<FuncionDispositivo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        Promise.all([
            listarCatalogoDispositivos(),
            listarMarcas(),
            listarCategorias(),
            listarFunciones(),
        ])
            .then(([listaDisp, listaMarcas, listaCats, listaFuncs]) => {
                setDispositivos(listaDisp);
                setMarcas(listaMarcas);
                setCategorias(listaCats);
                setFunciones(listaFuncs);
            })
            .catch(() => setError("Error al cargar los datos de la biblioteca."))
            .finally(() => setCargando(false));
    }, []);

    const handleDispositivoCreado = (nuevoDisp: CatalogoDispositivo) => {
        setDispositivos([nuevoDisp, ...dispositivos]);
    };

    if (cargando) {
        return <p>Cargando biblioteca...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div>
            <DispositivoForm
                marcas={marcas}
                categorias={categorias}
                funciones={funciones}
                onDispositivoCreado={handleDispositivoCreado}
            />
            <hr className="divider" />
            <DispositivoList dispositivos={dispositivos} />
        </div>
    );
}
