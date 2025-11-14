/**
 * Capa de servicios que centraliza las llamadas HTTP hacia el backend de Django.
 * Ahora incluye lógica para manejar la autenticación JWT.
 */

// --- Tipos de Datos (Payloads de la API) ---

export type Proyecto = {
    id: number;
    obra: number;
    usuario_creador: string;
    nombre_proyecto: string;
    tipo: string;
    fecha_creacion: string;
    estado_proyecto: string;
    ubicacion_fisica: string;
};

export type SaludAPI = {
    mensaje: string;
    total_proyectos: number;
};

export type TokenRespuesta = {
    access: string;
    refresh: string;
};

// --- Constantes ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "voltia-auth-token";

// --- Funciones de Utilidad de Token ---

/**
 * Guarda el token de acceso en el almacenamiento local.
 */
export function guardarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Limpia (borra) el token de acceso del almacenamiento local.
 */
export function limpiarToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Recupera el token de acceso del almacenamiento local.
 */
export function getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

// --- Funciones de API ---

/**
 * Función 'wrapper' para peticiones fetch autenticadas.
 * Lee el token de localStorage y lo inyecta en la cabecera 'Authorization'.
 */
async function fetchProtegido(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.append("Authorization", `Bearer ${token}`);
    }

    headers.append("Content-Type", "application/json");

    return fetch(url, { ...options, headers });
}

/**
 * [PÚBLICO] Endpoint de salud. No requiere token.
 */
export async function obtenerSalud(): Promise<SaludAPI> {
    const respuesta = await fetch(`${API_BASE_URL}/salud/`);
    if (!respuesta.ok) {
        throw new Error("No se pudo consultar el estado de la API");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista los proyectos. Ahora usa fetchProtegido.
 */
export async function listarProyectos(): Promise<Proyecto[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/proyectos/`);

    if (respuesta.status === 401) {
        // El token expiró o es inválido
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de proyectos");
    }
    return respuesta.json();
}

/**
 * [PÚBLICO] Llama al endpoint de login (/api/token/).
 */
export async function loginUsuario(credenciales: {
    username: string;
    password: string;
}): Promise<string> {
    const respuesta = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credenciales),
    });

    if (!respuesta.ok) {
        throw new Error("Usuario o contraseña incorrectos");
    }

    const data: TokenRespuesta = await respuesta.json();

    // Guardamos el token de acceso
    guardarToken(data.access);

    return data.access;
}

// (Aquí añadiremos futuras funciones: crearObra, crearInstancia, etc.)
