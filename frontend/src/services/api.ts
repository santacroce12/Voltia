/**
 * Capa de servicios que centraliza las llamadas HTTP hacia el backend de Django.
 * Mantener toda la logica de fetch en un solo lugar evita duplicidad en los componentes.
 */
export type Proyecto = {
    id: number;
    nombre: string;
    descripcion: string;
    creado_en: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export async function obtenerSalud(): Promise<{ mensaje: string; total_proyectos: number }> {
    const respuesta = await fetch(`${API_BASE_URL}/salud/`);
    if (!respuesta.ok) {
        throw new Error("No se pudo consultar el estado de la API");
    }
    return respuesta.json();
}

export async function listarProyectos(): Promise<Proyecto[]> {
    const respuesta = await fetch(`${API_BASE_URL}/proyectos/`);
    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de proyectos");
    }
    return respuesta.json();
}
