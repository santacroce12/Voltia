/**
 * Modal para editar las funciones soportadas de un dispositivo del catalogo.
 */
import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import {
    type FuncionDispositivo,
    type CatalogoDispositivo,
    updateCatalogoFunciones,
} from "../services/api";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    dispositivo: CatalogoDispositivo | null;
    masterFunciones: FuncionDispositivo[];
    onUpdateExitoso: (dispositivoActualizado: CatalogoDispositivo) => void;
};

export function EditarFuncionesModal({
    isOpen,
    onClose,
    dispositivo,
    masterFunciones,
    onUpdateExitoso,
}: Props) {
    const [seleccionIds, setSeleccionIds] = useState<number[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        if (dispositivo?.funciones_soportadas) {
            setSeleccionIds(dispositivo.funciones_soportadas);
        } else {
            setSeleccionIds([]);
        }
        setBusqueda("");
    }, [dispositivo]);

    const handleToggle = (funcionId: number) => {
        setSeleccionIds((prev) =>
            prev.includes(funcionId) ? prev.filter((id) => id !== funcionId) : [...prev, funcionId],
        );
    };

    const funcionesFiltradas = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        return masterFunciones.filter((func) => {
            if (!termino) return true;
            const texto = `${func.codigo_funcion ?? ""} ${func.nombre}`.toLowerCase();
            return texto.includes(termino);
        });
    }, [masterFunciones, busqueda]);

    if (!dispositivo) {
        return null;
    }

    const handleSave = async () => {
        setCargando(true);
        setError(null);
        try {
            const actualizado = await updateCatalogoFunciones(dispositivo.id, seleccionIds);
            onUpdateExitoso(actualizado);
            onClose();
        } catch {
            setError("Error al guardar. Intente de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar Funciones de ${dispositivo.nombre_completo_producto || dispositivo.modelo}`}
        >
            <div className="modal-search">
                <input
                    type="search"
                    placeholder="Buscar por nombre o código..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            <div className="funcion-selector-list">
                {masterFunciones.length === 0 ? (
                    <p className="placeholder small-placeholder">No hay funciones registradas.</p>
                ) : funcionesFiltradas.length === 0 ? (
                    <p className="placeholder small-placeholder">No hay coincidencias para la búsqueda.</p>
                ) : (
                    funcionesFiltradas.map((func) => (
                        <label key={func.id} className="funcion-checkbox">
                            <input
                                type="checkbox"
                                checked={seleccionIds.includes(func.id)}
                                onChange={() => handleToggle(func.id)}
                            />
                            <span>
                                {func.codigo_funcion ? `[${func.codigo_funcion}] ` : ""}
                                {func.nombre}
                            </span>
                        </label>
                    ))
                )}
            </div>
            {error && <p className="error small-error">{error}</p>}
            <button onClick={handleSave} disabled={cargando} style={{ marginTop: "1rem" }}>
                {cargando ? "Guardando..." : "Guardar Cambios"}
            </button>
        </Modal>
    );
}
