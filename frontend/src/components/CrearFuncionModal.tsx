/**
 * Modal para crear una nueva función de dispositivo.
 */
import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { crearFuncion, type FuncionDispositivo, type FuncionPayload } from "../services/api";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onFuncionCreada: (nuevaFuncion: FuncionDispositivo) => void;
};

export function CrearFuncionModal({ isOpen, onClose, onFuncionCreada }: Props) {
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetFormulario = () => {
        setCodigo("");
        setNombre("");
        setDescripcion("");
    };

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }
        setCargando(true);
        setError(null);
        try {
            const payload: FuncionPayload = {
                codigo_funcion: codigo || undefined,
                nombre: nombre.trim(),
                descripcion: descripcion || undefined,
            };
            const nuevaFuncion = await crearFuncion(payload);
            onFuncionCreada(nuevaFuncion);
            resetFormulario();
            onClose();
        } catch {
            setError("No se pudo crear la función. Intenta nuevamente.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Función">
            <form className="inline-form" onSubmit={handleSave}>
                <div className="form-group">
                    <label>Código (opcional)</label>
                    <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: 50/51" />
                </div>
                <div className="form-group">
                    <label>Nombre de la Función</label>
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Sobrecorriente de fase"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Descripción (opcional)</label>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
                </div>
                {error && <p className="error small-error">{error}</p>}
                <button type="submit" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar Función"}
                </button>
            </form>
        </Modal>
    );
}
