/**
 * IngenieriaDetallePage.tsx
 * Paso 3: Cargar instancias (1 a 1 o en lote) al proyecto seleccionado.
 */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarInstancias,
    crearInstancia,
    listarCatalogoDispositivos,
    listarFunciones,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type CatalogoDispositivo,
    type FuncionDispositivo,
} from "../services/api";
import { Modal } from "../components/Modal";
import { CatalogoFormModule } from "../components/CatalogoFormModule";
import { EditarFuncionesModal } from "../components/EditarFuncionesModal";
import { CrearFuncionModal } from "../components/CrearFuncionModal";

type InstanciaFormProps = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    onInstanciaCreada: (instancia: InstanciaDispositivo) => void;
    onAbrirModalCatalogo: () => void;
    onAbrirModalEditarFunciones: (dispositivo: CatalogoDispositivo | null) => void;
    onAbrirModalCrearFuncion: () => void;
};

type FuncionesSelectorProps = {
    disponibles: FuncionDispositivo[];
    seleccionadas: number[];
    onChange: (ids: number[]) => void;
    emptyMessage: string;
};

function FuncionesSelector({ disponibles, seleccionadas, onChange, emptyMessage }: FuncionesSelectorProps) {
    const [busqueda, setBusqueda] = useState("");

    const toggleFuncion = (id: number) => {
        if (seleccionadas.includes(id)) {
            onChange(seleccionadas.filter((seleccion) => seleccion !== id));
        } else {
            onChange([...seleccionadas, id]);
        }
    };

    if (disponibles.length === 0) {
        return <p className="placeholder small-placeholder">{emptyMessage}</p>;
    }

    const coincidencias = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        return disponibles
            .filter((funcion) => {
                if (!termino) return true;
                const texto = `${funcion.codigo_funcion ?? ""} ${funcion.nombre}`.toLowerCase();
                return texto.includes(termino);
            })
            .sort((a, b) => {
                const aSeleccionada = seleccionadas.includes(a.id) ? 0 : 1;
                const bSeleccionada = seleccionadas.includes(b.id) ? 0 : 1;
                if (aSeleccionada !== bSeleccionada) {
                    return aSeleccionada - bSeleccionada;
                }
                return a.nombre.localeCompare(b.nombre);
            });
    }, [disponibles, seleccionadas, busqueda]);

    const sinCoincidencias = coincidencias.length === 0;

    return (
        <div className="funciones-selector">
            <div className="funciones-selector__controls">
                <input
                    type="search"
                    className="funciones-selector__search"
                    placeholder="Buscar función..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    aria-label="Buscar función en el catálogo"
                />
                {seleccionadas.length > 0 && (
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => onChange([])}
                        aria-label="Limpiar funciones seleccionadas"
                    >
                        Limpiar selección
                    </button>
                )}
            </div>
            <p className="funciones-selector__hint">
                Selecciona las funciones que utilizará este dispositivo
            </p>
            {sinCoincidencias ? (
                <p className="placeholder small-placeholder">No se encontraron funciones con esa búsqueda.</p>
            ) : (
                <div className="funciones-selector__list">
                    {coincidencias.map((funcion) => {
                        const checked = seleccionadas.includes(funcion.id);
                        return (
                            <label
                                key={funcion.id}
                                className={`funcion-pill ${checked ? "funcion-pill--active" : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleFuncion(funcion.id)}
                                />
                                <span>
                                    {funcion.codigo_funcion ? `${funcion.codigo_funcion} · ` : ""}
                                    {funcion.nombre}
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function InstanciaForm({
    proyectoId,
    catalogo,
    masterFunciones,
    onInstanciaCreada,
    onAbrirModalCatalogo,
    onAbrirModalEditarFunciones,
    onAbrirModalCrearFuncion,
}: InstanciaFormProps) {
    const [catalogoId, setCatalogoId] = useState("");
    const [tag, setTag] = useState("");
    const [atributos, setAtributos] = useState("{}");
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispositivoSeleccionado = useMemo(() => {
        if (!catalogoId) return null;
        return catalogo.find((d) => d.id === Number(catalogoId)) ?? null;
    }, [catalogoId, catalogo]);

    useEffect(() => {
        if (!catalogoId) {
            setFuncionesSeleccionadas([]);
            return;
        }
        if (!dispositivoSeleccionado?.funciones_soportadas?.length) {
            setFuncionesSeleccionadas([]);
            return;
        }
        setFuncionesSeleccionadas((prev) =>
            prev.filter((id) => dispositivoSeleccionado.funciones_soportadas.includes(id)),
        );
    }, [catalogoId, dispositivoSeleccionado]);

    const funcionesDisponibles = useMemo(() => {
        if (!catalogoId || !dispositivoSeleccionado) {
            return masterFunciones;
        }
        if (!dispositivoSeleccionado.funciones_soportadas?.length) {
            return masterFunciones;
        }
        return masterFunciones.filter((f) => dispositivoSeleccionado.funciones_soportadas.includes(f.id));
    }, [catalogoId, masterFunciones, dispositivoSeleccionado]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!catalogoId) {
            setError("Debe seleccionar un dispositivo.");
            return;
        }
        try {
            JSON.parse(atributos);
        } catch {
            setError("El JSON de atributos no es válido.");
            return;
        }
        if (funcionesSeleccionadas.length === 0) {
            setError("Debe seleccionar al menos una función aplicada.");
            return;
        }

        setCargando(true);
        setError(null);

        const payload: InstanciaPayload = {
            proyecto: proyectoId,
            catalogo: Number(catalogoId),
            tag_dispositivo: tag,
            atributos,
            funciones_usadas: funcionesSeleccionadas,
        };

        try {
            const nuevaInstancia = await crearInstancia(payload);
            onInstanciaCreada(nuevaInstancia);
            setCatalogoId("");
            setTag("");
            setFuncionesSeleccionadas([]);
        } catch (err: any) {
            setError(err.message || "Error al añadir.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Añadir Dispositivo (1 a 1)</h3>
            <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Dispositivo del Catálogo</label>
                    <div className="input-with-button">
                        <select value={catalogoId} onChange={(e) => setCatalogoId(e.target.value)} required>
                            <option value="" disabled>
                                -- Seleccionar Dispositivo --
                            </option>
                            {catalogo.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.marca_nombre ?? d.marca} {d.modelo}
                                </option>
                            ))}
                        </select>
                        <button type="button" onClick={onAbrirModalCatalogo} title="Añadir al catálogo">
                            +
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label>TAG (Opcional)</label>
                    <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Ej: REL-001"
                    />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Funciones Aplicadas</label>
                    <div className="funciones-edit-row">
                <FuncionesSelector
                    disponibles={funcionesDisponibles}
                    seleccionadas={funcionesSeleccionadas}
                    onChange={setFuncionesSeleccionadas}
                    emptyMessage={
                        catalogoId
                            ? "Este dispositivo no tiene funciones configuradas."
                            : "Seleccione un dispositivo para ver las funciones disponibles."
                    }
                />
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => onAbrirModalEditarFunciones(dispositivoSeleccionado)}
                            disabled={!catalogoId || !dispositivoSeleccionado}
                            title="Editar funciones soportadas"
                        >
                            Editar
                        </button>
                    </div>
                    <p className="funciones-helper">
                        ¿No encuentras la función?{" "}
                        <button
                            type="button"
                            className="link-button inline-link"
                            onClick={onAbrirModalCrearFuncion}
                            >
                            Carga aquí
                        </button>
                    </p>
                </div>
                <div className="form-group">
                    <label>Atributos (JSON)</label>
                    <textarea value={atributos} onChange={(e) => setAtributos(e.target.value)} rows={4} />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Añadiendo..." : "Añadir Instancia"}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}

function BatchInstanciaForm({
    proyectoId,
    catalogo,
    masterFunciones,
    onInstanciasCreadas,
    onAbrirModalEditarFunciones,
    onAbrirModalCrearFuncion,
}: {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    masterFunciones: FuncionDispositivo[];
    onInstanciasCreadas: (instancias: InstanciaDispositivo[]) => void;
    onAbrirModalEditarFunciones: (dispositivo: CatalogoDispositivo | null) => void;
    onAbrirModalCrearFuncion: () => void;
}) {
    const [catalogoId, setCatalogoId] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [tagBase, setTagBase] = useState("REL");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [funcionesSeleccionadas, setFuncionesSeleccionadas] = useState<number[]>([]);

    const dispositivoSeleccionado = useMemo(() => {
        if (!catalogoId) return null;
        return catalogo.find((d) => d.id === Number(catalogoId)) ?? null;
    }, [catalogoId, catalogo]);

    useEffect(() => {
        if (!catalogoId) {
            setFuncionesSeleccionadas([]);
            return;
        }
        if (!dispositivoSeleccionado?.funciones_soportadas?.length) {
            setFuncionesSeleccionadas([]);
            return;
        }
        setFuncionesSeleccionadas((prev) =>
            prev.filter((id) => dispositivoSeleccionado.funciones_soportadas.includes(id)),
        );
    }, [catalogoId, dispositivoSeleccionado]);

    const funcionesDisponibles = useMemo(() => {
        if (!catalogoId || !dispositivoSeleccionado) return masterFunciones;
        if (!dispositivoSeleccionado.funciones_soportadas?.length) return masterFunciones;
        return masterFunciones.filter((f) => dispositivoSeleccionado.funciones_soportadas.includes(f.id));
    }, [catalogoId, masterFunciones, dispositivoSeleccionado]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!catalogoId) {
            setError("Debe seleccionar un dispositivo.");
            return;
        }
        if (funcionesSeleccionadas.length === 0) {
            setError("Seleccione al menos una función para aplicar.");
            return;
        }

        setCargando(true);
        setError(null);

        const promesas: Promise<InstanciaDispositivo>[] = [];
        for (let i = 0; i < cantidad; i++) {
            const payload: InstanciaPayload = {
                proyecto: proyectoId,
                catalogo: Number(catalogoId),
                tag_dispositivo: `${tagBase}-${String(i + 1).padStart(2, "0")}`,
                atributos: "{}",
                funciones_usadas: funcionesSeleccionadas,
            };
            promesas.push(crearInstancia(payload));
        }

        try {
            const nuevasInstancias = await Promise.all(promesas);
            onInstanciasCreadas(nuevasInstancias);
            setTagBase("REL");
            setCantidad(1);
        } catch (err: any) {
            setError(err.message || "Error en lote.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Añadir Dispositivos (Lote)</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label>Dispositivo del Catálogo</label>
                    <select value={catalogoId} onChange={(e) => setCatalogoId(e.target.value)} required>
                        <option value="" disabled>
                            -- Seleccionar Dispositivo --
                        </option>
                        {catalogo.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.marca_nombre ?? d.marca} {d.modelo}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Cantidad</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label>TAG Base</label>
                    <input
                        type="text"
                        value={tagBase}
                        onChange={(e) => setTagBase(e.target.value)}
                        placeholder="Ej: REL"
                    />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Funciones Aplicadas</label>
                    <div className="funciones-edit-row">
                        <FuncionesSelector
                            disponibles={funcionesDisponibles}
                            seleccionadas={funcionesSeleccionadas}
                            onChange={setFuncionesSeleccionadas}
                            emptyMessage={
                                catalogoId
                                    ? "Este dispositivo no tiene funciones configuradas."
                                    : "Seleccione un dispositivo para ver las funciones disponibles."
                            }
                        />
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => onAbrirModalEditarFunciones(dispositivoSeleccionado)}
                            disabled={!catalogoId || !dispositivoSeleccionado}
                            title="Editar funciones soportadas"
                        >
                            Editar
                        </button>
                    </div>
                    <p className="funciones-helper">
                        ¿No encuentras la función?{" "}
                        <button
                            type="button"
                            className="link-button inline-link"
                            onClick={onAbrirModalCrearFuncion}
                        >
                            Carga aquí
                        </button>
                    </p>
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? `Añadiendo ${cantidad}...` : `Añadir ${cantidad} Instancias`}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}

function InstanciaList({
    instancias,
    funcionesMap,
}: {
    instancias: InstanciaDispositivo[];
    funcionesMap: Record<number, FuncionDispositivo>;
}) {
    return (
        <section className="cards-wrapper">
            <h2>Dispositivos en este Proyecto</h2>
            {instancias.length === 0 ? (
                <p className="placeholder">Aún no hay dispositivos.</p>
            ) : (
                <div className="cards small-cards">
                    {instancias.map((i) => (
                        <article key={i.id} className="card">
                            <h3>{i.tag_dispositivo || `Instancia #${i.id}`}</h3>
                            <p>Catálogo ID: {i.catalogo}</p>
                            <p>
                                Funciones:{" "}
                                {i.funciones_usadas?.length
                                    ? i.funciones_usadas
                                          .map((funcId) => funcionesMap[funcId]?.nombre || `Función #${funcId}`)
                                          .join(", ")
                                    : "Sin asignar"}
                            </p>
                            <small>Añadido por: {i.usuario_creador}</small>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export function IngenieriaDetallePage() {
    const { proyectoId } = useParams<{ proyectoId: string }>();
    const numProyectoId = Number(proyectoId);

    const [instancias, setInstancias] = useState<InstanciaDispositivo[]>([]);
    const [catalogo, setCatalogo] = useState<CatalogoDispositivo[]>([]);
    const [masterFunciones, setMasterFunciones] = useState<FuncionDispositivo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalFuncionesOpen, setIsModalFuncionesOpen] = useState(false);
    const [isCrearFuncionOpen, setIsCrearFuncionOpen] = useState(false);
    const [dispositivoEdicion, setDispositivoEdicion] = useState<CatalogoDispositivo | null>(null);

    useEffect(() => {
        if (!numProyectoId) return;
        Promise.all([listarInstancias(numProyectoId), listarCatalogoDispositivos(), listarFunciones()])
            .then(([listaInstancias, listaCatalogo, listaFunciones]) => {
                setInstancias(listaInstancias);
                setCatalogo(listaCatalogo);
                setMasterFunciones(listaFunciones);
            })
            .catch(() => setError("Error al cargar los datos del proyecto."))
            .finally(() => setCargando(false));
    }, [numProyectoId]);

    const funcionesMap = useMemo(() => {
        const map: Record<number, FuncionDispositivo> = {};
        masterFunciones.forEach((funcion) => {
            map[funcion.id] = funcion;
        });
        return map;
    }, [masterFunciones]);

    const handleInstanciaCreada = (nuevaInstancia: InstanciaDispositivo) => {
        setInstancias([nuevaInstancia, ...instancias]);
    };

    const handleLoteCreado = (nuevasInstancias: InstanciaDispositivo[]) => {
        setInstancias([...nuevasInstancias, ...instancias]);
    };

    const handleCatalogoCreado = (nuevoDispositivo: CatalogoDispositivo) => {
        setCatalogo([nuevoDispositivo, ...catalogo]);
        setIsModalOpen(false);
    };

    const handleAbrirModalFunciones = (dispositivo: CatalogoDispositivo | null) => {
        if (!dispositivo) return;
        setDispositivoEdicion(dispositivo);
        setIsModalFuncionesOpen(true);
    };

    const handleFuncionesActualizadas = (dispositivoActualizado: CatalogoDispositivo) => {
        setCatalogo((prev) =>
            prev.map((d) => (d.id === dispositivoActualizado.id ? dispositivoActualizado : d)),
        );
        if (dispositivoEdicion?.id === dispositivoActualizado.id) {
            setDispositivoEdicion(dispositivoActualizado);
        }
    };

    const handleFuncionCreada = (nuevaFuncion: FuncionDispositivo) => {
        setMasterFunciones((prev) => [nuevaFuncion, ...prev]);
        setIsCrearFuncionOpen(false);
    };

    if (cargando) return <p>Cargando proyecto...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <Link to="/ingenieria" className="back-button">
                &larr; Volver a la selección de Proyecto
            </Link>

            <InstanciaForm
                proyectoId={numProyectoId}
                catalogo={catalogo}
                masterFunciones={masterFunciones}
                onInstanciaCreada={handleInstanciaCreada}
                onAbrirModalCatalogo={() => setIsModalOpen(true)}
                onAbrirModalEditarFunciones={handleAbrirModalFunciones}
                onAbrirModalCrearFuncion={() => setIsCrearFuncionOpen(true)}
            />

            <BatchInstanciaForm
                proyectoId={numProyectoId}
                catalogo={catalogo}
                masterFunciones={masterFunciones}
                onInstanciasCreadas={handleLoteCreado}
                onAbrirModalEditarFunciones={handleAbrirModalFunciones}
                onAbrirModalCrearFuncion={() => setIsCrearFuncionOpen(true)}
            />

            <hr className="divider" />
            <InstanciaList instancias={instancias} funcionesMap={funcionesMap} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Añadir Nuevo Dispositivo al Catálogo"
            >
                <CatalogoFormModule onDispositivoCreado={handleCatalogoCreado} />
            </Modal>

            <EditarFuncionesModal
                isOpen={isModalFuncionesOpen}
                onClose={() => {
                    setIsModalFuncionesOpen(false);
                    setDispositivoEdicion(null);
                }}
                dispositivo={dispositivoEdicion}
                masterFunciones={masterFunciones}
                onUpdateExitoso={handleFuncionesActualizadas}
            />

            <CrearFuncionModal
                isOpen={isCrearFuncionOpen}
                onClose={() => setIsCrearFuncionOpen(false)}
                onFuncionCreada={handleFuncionCreada}
            />
        </div>
    );
}
