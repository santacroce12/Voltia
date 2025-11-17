/**
 * ProyectoDetallePage.tsx
 * Página de Detalle de un Proyecto (desde /proyectos).
 * Muestra formularios para añadir Servicios y URLs Externas.
 */
import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
    listarServicios,
    crearServicio,
    listarUrls,
    crearUrl,
    listarProyectos,
    type ServicioProyecto,
    type ServicioPayload,
    type UrlExterna,
    type UrlExternaPayload,
    type Proyecto,
} from "../services/api";

function ServicioForm({
    proyectoId,
    obraId,
    onServicioCreado,
}: {
    proyectoId: number;
    obraId: number | null;
    onServicioCreado: (s: ServicioProyecto) => void;
}) {
    const [item, setItem] = useState("");
    const [horas, setHoras] = useState(0);
    const [tarifa, setTarifa] = useState(0);
    const [notas, setNotas] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (obraId == null) {
            return;
        }
        setCargando(true);
        const payload: ServicioPayload = {
            proyecto: proyectoId,
            obra: obraId,
            item_servicio: item,
            horas_estimadas: horas,
            tarifa_hora_ref: tarifa,
            notas_alcance: notas || undefined,
        };
        try {
            const nuevo = await crearServicio(payload);
            onServicioCreado(nuevo);
            setItem("");
            setHoras(0);
            setTarifa(0);
            setNotas("");
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Añadir Servicio al Proyecto</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label>Item o Servicio</label>
                    <input type="text" value={item} onChange={(e) => setItem(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Horas Estimadas</label>
                    <input
                        type="number"
                        value={horas}
                        min={0}
                        onChange={(e) => setHoras(Number(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label>Tarifa Hora (Referencia)</label>
                    <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={tarifa}
                        onChange={(e) => setTarifa(Number(e.target.value))}
                    />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Notas / Alcance (Opcional)</label>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} />
                </div>
            </div>
            {obraId == null && <p className="small-placeholder">Cargando información del proyecto...</p>}
            <button type="submit" disabled={cargando || obraId == null}>
                {cargando ? "Añadiendo..." : "Añadir Servicio"}
            </button>
        </form>
    );
}

function UrlForm({ proyectoId, onUrlCreada }: { proyectoId: number; onUrlCreada: (u: UrlExterna) => void }) {
    const [tipo, setTipo] = useState("Plano");
    const [url, setUrl] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        const payload: UrlExternaPayload = { proyecto: proyectoId, tipo_enlace: tipo, url };
        try {
            const nueva = await crearUrl(payload);
            onUrlCreada(nueva);
            setUrl("");
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <h3>Añadir Enlace Externo (Plano, Pliego)</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label>Tipo de Enlace</label>
                    <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>URL Completa</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        placeholder="https://..."
                    />
                </div>
            </div>
            <button type="submit" disabled={cargando}>
                {cargando ? "Añadiendo..." : "Añadir Enlace"}
            </button>
        </form>
    );
}

export function ProyectoDetallePage() {
    const { proyectoId } = useParams<{ proyectoId: string }>();
    const numProyectoId = Number(proyectoId);

    const [servicios, setServicios] = useState<ServicioProyecto[]>([]);
    const [urls, setUrls] = useState<UrlExterna[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);
    const [obraId, setObraId] = useState<number | null>(null);

    useEffect(() => {
        if (!numProyectoId) return;
        Promise.all([listarServicios(numProyectoId), listarUrls(numProyectoId), listarProyectos()])
            .then(([listaServicios, listaUrls, listaProyectos]) => {
                setServicios(listaServicios);
                setUrls(listaUrls);
                const proyectoActual = (listaProyectos as Proyecto[]).find((p) => p.id === numProyectoId);
                if (proyectoActual) {
                    setObraId(proyectoActual.obra);
                } else if (listaServicios.length > 0) {
                    setObraId(listaServicios[0].obra);
                } else {
                    setObraId(null);
                }
            })
            .catch(() => setError("Error al cargar los datos del proyecto."))
            .finally(() => setCargando(false));
    }, [numProyectoId]);

    if (cargando) return <p>Cargando datos del proyecto...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <Link to="/proyectos" className="back-button">
                &larr; Volver a la lista de Proyectos
            </Link>

            <ServicioForm
                proyectoId={numProyectoId}
                obraId={obraId}
                onServicioCreado={(s) => {
                    setServicios((prev) => [s, ...prev]);
                    if (obraId == null && s.obra) {
                        setObraId(s.obra);
                    }
                }}
            />

            <section className="cards-wrapper">
                <h2>Servicios del Proyecto</h2>
                {servicios.length === 0 ? (
                    <p className="placeholder">No hay servicios.</p>
                ) : (
                    <div className="cards small-cards">
                        {servicios.map((s) => (
                            <article key={s.id} className="card">
                                <h3>{s.item_servicio}</h3>
                                <p>Horas: {s.horas_estimadas ?? "N/A"}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <hr className="divider" />

            <UrlForm proyectoId={numProyectoId} onUrlCreada={(u) => setUrls((prev) => [u, ...prev])} />

            <section className="cards-wrapper">
                <h2>Enlaces del Proyecto</h2>
                {urls.length === 0 ? (
                    <p className="placeholder">No hay enlaces.</p>
                ) : (
                    <div className="cards small-cards">
                        {urls.map((u) => (
                            <article key={u.id} className="card">
                                <h3>{u.tipo_enlace}</h3>
                                <p>
                                    <a href={u.url} target="_blank" rel="noopener noreferrer">
                                        Abrir enlace
                                    </a>
                                </p>
                                {u.descripcion && <small>{u.descripcion}</small>}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
