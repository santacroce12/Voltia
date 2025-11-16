/**
 * Pagina de Detalle de un Proyecto.
 * Muestra el formulario para añadir instancias y la lista de instancias existentes.
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

type InstanciaFormProps = {
    proyectoId: number;
    catalogo: CatalogoDispositivo[];
    onInstanciaCreada: (instancia: InstanciaDispositivo) => void;
};

function InstanciaForm({ proyectoId, catalogo, onInstanciaCreada }: InstanciaFormProps) {
    const [catalogoId, setCatalogoId] = useState("");
    const [tag, setTag] = useState("");
    const [atributos, setAtributos] = useState('{\n  "ip": "192.168.1.100"\n}');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!catalogoId) {
            setError("Debe seleccionar un dispositivo del catálogo.");
            return;
        }

        try {
            JSON.parse(atributos);
        } catch {
            setError("El campo 'Atributos' no es un JSON válido.");
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
            setError(err.message || "Error al añadir instancia.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Añadir Dispositivo al Proyecto</h3>
            <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="inst-catalogo">Dispositivo del Catálogo</label>
                    <select
                        id="inst-catalogo"
                        value={catalogoId}
                        onChange={(e) => setCatalogoId(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            -- Seleccionar Dispositivo --
                        </option>
                        {catalogo.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.marca_nombre ?? d.marca} {d.modelo} ({d.nombre_completo_producto})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="inst-tag">TAG (Opcional)</label>
                    <input
                        id="inst-tag"
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Ej: REL-001"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="inst-atributos">Atributos (JSON)</label>
                    <textarea
                        id="inst-atributos"
                        value={atributos}
                        onChange={(e) => setAtributos(e.target.value)}
                        rows={4}
                    />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Añadiendo..." : "Añadir Instancia"}
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
                <p className="placeholder">Aún no hay dispositivos en este proyecto.</p>
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

export function ProyectoDetallePage() {
    const { proyectoId } = useParams<{ proyectoId: string }>();
    const numProyectoId = Number(proyectoId);

    const [instancias, setInstancias] = useState<InstanciaDispositivo[]>([]);
    const [catalogo, setCatalogo] = useState<CatalogoDispositivo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

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

    if (cargando) return <p>Cargando proyecto...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <Link to="/proyectos" className="back-button">
                &larr; Volver a la lista de Proyectos
            </Link>

            <InstanciaForm
                proyectoId={numProyectoId}
                catalogo={catalogo}
                onInstanciaCreada={handleInstanciaCreada}
            />

            <hr className="divider" />

            <InstanciaList instancias={instancias} />
        </div>
    );
}
