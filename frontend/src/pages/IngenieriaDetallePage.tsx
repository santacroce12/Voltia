/**
 * IngenieriaDetallePage.tsx
 * Paso 3: Cargar instancias (1 a 1 o en lote) al proyecto seleccionado.
 */
import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarInstancias,
    crearInstancia,
    listarCatalogoDispositivos,
    type InstanciaDispositivo,
    type InstanciaPayload,
    type CatalogoDispositivo,
} from "../services/api";
import { Modal } from "../components/Modal";
import { CatalogoFormModule } from "../components/CatalogoFormModule";

type InstanciaFormProps = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    onInstanciaCreada: (instancia: InstanciaDispositivo) => void;
    onAbrirModalCatalogo: () => void;
};

function InstanciaForm({
    proyectoId,
    catalogo,
    onInstanciaCreada,
    onAbrirModalCatalogo,
}: InstanciaFormProps) {
    const [catalogoId, setCatalogoId] = useState("");
    const [tag, setTag] = useState("");
    const [atributos, setAtributos] = useState("{}");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        setCargando(true);
        setError(null);

        const payload: InstanciaPayload = {
            proyecto: proyectoId,
            catalogo: Number(catalogoId),
            tag_dispositivo: tag,
            atributos,
        };

        try {
            const nuevaInstancia = await crearInstancia(payload);
            onInstanciaCreada(nuevaInstancia);
            setCatalogoId("");
            setTag("");
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
    onInstanciasCreadas,
}: {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    onInstanciasCreadas: (instancias: InstanciaDispositivo[]) => void;
}) {
    const [catalogoId, setCatalogoId] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [tagBase, setTagBase] = useState("REL");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!catalogoId) {
            setError("Debe seleccionar un dispositivo.");
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
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? `Añadiendo ${cantidad}...` : `Añadir ${cantidad} Instancias`}
            </button>
            {error && <p className="error small-error">{error}</p>}
        </form>
    );
}

function InstanciaList({ instancias }: { instancias: InstanciaDispositivo[] }) {
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
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!numProyectoId) return;
        Promise.all([listarInstancias(numProyectoId), listarCatalogoDispositivos()])
            .then(([listaInstancias, listaCatalogo]) => {
                setInstancias(listaInstancias);
                setCatalogo(listaCatalogo);
            })
            .catch(() => setError("Error al cargar los datos del proyecto."))
            .finally(() => setCargando(false));
    }, [numProyectoId]);

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
                onInstanciaCreada={handleInstanciaCreada}
                onAbrirModalCatalogo={() => setIsModalOpen(true)}
            />

            <BatchInstanciaForm
                proyectoId={numProyectoId}
                catalogo={catalogo}
                onInstanciasCreadas={handleLoteCreado}
            />

            <hr className="divider" />
            <InstanciaList instancias={instancias} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Añadir Nuevo Dispositivo al Catálogo"
            >
                <CatalogoFormModule onDispositivoCreado={handleCatalogoCreado} />
            </Modal>
        </div>
    );
}
