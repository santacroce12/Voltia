/**
 * Pagina enfocada exclusivamente en listar dispositivos del catálogo.
 */
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
    listarCatalogoDispositivos,
    listarMarcas,
    listarCategorias,
    type CatalogoDispositivo,
    type Marca,
    type Categoria,
} from "../services/api";

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
    const handleSelect = (campo: string) => (e: ChangeEvent<HTMLSelectElement>) => onChange(campo, e.target.value);
    const handleInput = (e: ChangeEvent<HTMLInputElement>) => onChange("texto", e.target.value);
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
                <p>Filtra el catálogo por marca, categoría o busca por nombre/modelo.</p>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div className="form-group">
                    <label>Marca</label>
                    <select value={filtroMarca} onChange={handleSelect("marca")}>
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
                    <select value={filtroCategoriaPrincipal} onChange={handleSelect("categoriaPrincipal")}>
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
                    <select value={filtroSubcategoria} onChange={handleSelect("subcategoria")}>
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
                    <input type="text" value={filtroTexto} onChange={handleInput} placeholder="Ej: Relay de protección" />
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
        <div className="catalogo-table-card">
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
                                <td>{(d as any).marca_nombre ?? d.marca}</td>
                                <td>{(d as any).categoria_nombre ?? d.categoria}</td>
                                <td>{d.modelo}</td>
                                <td>{d.nombre_completo_producto}</td>
                                <td>{d.funciones_soportadas?.length ?? 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function DispositivosListadoPage() {
    const [dispositivos, setDispositivos] = useState<CatalogoDispositivo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const [filtroMarca, setFiltroMarca] = useState("");
    const [filtroCategoriaPrincipal, setFiltroCategoriaPrincipal] = useState("");
    const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
    const [filtroTexto, setFiltroTexto] = useState("");

    useEffect(() => {
        Promise.all([listarCatalogoDispositivos(), listarMarcas(), listarCategorias()])
            .then(([listaDisp, listaMarcas, listaCats]) => {
                setDispositivos(listaDisp);
                setMarcas(listaMarcas);
                setCategorias(listaCats);
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
            const coincideSubcategoria = filtroSubcategoria ? categoriaInfo?.subcategoria === filtroSubcategoria : true;
            const search = filtroTexto.toLowerCase();
            const coincideTexto = search
                ? d.nombre_completo_producto.toLowerCase().includes(search) || d.modelo.toLowerCase().includes(search)
                : true;
            return coincideMarca && coincideCategoriaPrincipal && coincideSubcategoria && coincideTexto;
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

    return (
        <div className="catalogo-list-view">
            <FiltrosCatalogo
                marcas={marcas}
                categorias={categorias}
                filtroMarca={filtroMarca}
                filtroCategoriaPrincipal={filtroCategoriaPrincipal}
                filtroSubcategoria={filtroSubcategoria}
                filtroTexto={filtroTexto}
                onChange={handleFiltroChange}
            />
            <TablaCatalogo dispositivos={dispositivosFiltrados} />
        </div>
    );
}
