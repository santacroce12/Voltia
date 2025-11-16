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

export type Cliente = {
    id: number;
    nombre: string;
    cuil: string;
    direccion?: string;
    notas?: string;
};

// Payload para crear un cliente (no necesita 'id')
export type ClientePayload = Omit<Cliente, "id">;

export type Obra = {
    id: number;
    cliente: number;
    usuario_creador: string;
    nombre_obra: string;
    ubicacion?: string;
    estado_obra: string;
};

// Payload para crear una Obra
export type ObraPayload = {
    nombre_obra: string;
    cliente: number;
    ubicacion?: string;
    estado_obra: string;
};

// Payload para crear un Proyecto
export type ProyectoPayload = {
    nombre_proyecto: string;
    obra: number;
    tipo: string;
    ubicacion_fisica?: string;
    estado_proyecto: string;
};

export type Marca = {
    id: number;
    nombre: string;
};

export type Categoria = {
    id: number;
    categoria_principal: string;
    subcategoria: string;
    descripcion?: string;
};

export type FuncionDispositivo = {
    id: number;
    codigo_funcion?: string;
    nombre: string;
    descripcion?: string;
};

// Payload para crear una Marca
export type MarcaPayload = Omit<Marca, "id">;

// Payload para crear una Categoria
export type CategoriaPayload = Omit<Categoria, "id">;

// Payload para crear una Funcion
export type FuncionPayload = Omit<FuncionDispositivo, "id">;

export type CatalogoDispositivo = {
    id: number;
    marca: number;
    categoria: number;
    modelo: string;
    nombre_completo_producto: string;
    descripcion_funcional?: string;
    url_ficha_tecnica?: string;
    especificaciones: Record<string, any>;
    funciones_soportadas: number[];
    marca_nombre?: string;
    categoria_nombre?: string;
};

// Payload para crear un Dispositivo del Catalogo
export type CatalogoDispositivoPayload = {
    modelo: string;
    nombre_completo_producto: string;
    marca: number;
    categoria: number;
    url_ficha_tecnica?: string;
    especificaciones: string;
    funciones_soportadas: number[];
};

export type InstanciaDispositivo = {
    id: number;
    proyecto: number;
    catalogo: number;
    usuario_creador: string;
    tag_dispositivo?: string;
    atributos: Record<string, any>;
    funciones_usadas: number[];
};

export type InstanciaPayload = {
    proyecto: number;
    catalogo: number;
    tag_dispositivo?: string;
    atributos: string;
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

/**
 * [PROTEGIDO] Lista todos los clientes.
 */
export async function listarClientes(): Promise<Cliente[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/clientes/`);

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de clientes");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea un nuevo cliente.
 */
export async function crearCliente(datosCliente: ClientePayload): Promise<Cliente> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/clientes/`, {
        method: "POST",
        body: JSON.stringify(datosCliente),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        // Podríamos leer el body para ver errores de validación
        throw new Error("No se pudo crear el cliente");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista todas las obras, opcionalmente filtradas por cliente.
 */
export async function listarObras(clienteId?: number): Promise<Obra[]> {
    let url = `${API_BASE_URL}/obras/`;
    if (clienteId) {
        url += `?cliente=${clienteId}`;
    }

    const respuesta = await fetchProtegido(url);

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de obras");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea una nueva obra.
 */
export async function crearObra(datosObra: ObraPayload): Promise<Obra> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/obras/`, {
        method: "POST",
        body: JSON.stringify(datosObra),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la obra");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea un nuevo proyecto.
 */
export async function crearProyecto(datosProyecto: ProyectoPayload): Promise<Proyecto> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/proyectos/`, {
        method: "POST",
        body: JSON.stringify(datosProyecto),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear el proyecto");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista todas las Marcas.
 */
export async function listarMarcas(): Promise<Marca[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/marcas/`);

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de marcas");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista todas las Categorias.
 */
export async function listarCategorias(): Promise<Categoria[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/categorias/`);

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de categorías");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista todas las Funciones de Dispositivos.
 */
export async function listarFunciones(): Promise<FuncionDispositivo[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/funciones/`);

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de funciones");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea una nueva Categoria.
 */
export async function crearCategoria(datosCategoria: CategoriaPayload): Promise<Categoria> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/categorias/`, {
        method: "POST",
        body: JSON.stringify(datosCategoria),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la categoría");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea una nueva Funcion de Dispositivo.
 */
export async function crearFuncion(datosFuncion: FuncionPayload): Promise<FuncionDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/funciones/`, {
        method: "POST",
        body: JSON.stringify(datosFuncion),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la función");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea una nueva Marca.
 */
export async function crearMarca(datosMarca: MarcaPayload): Promise<Marca> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/marcas/`, {
        method: "POST",
        body: JSON.stringify(datosMarca),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la marca");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista todos los dispositivos del Catalogo.
 */
export async function listarCatalogoDispositivos(): Promise<CatalogoDispositivo[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/catalogo/`);

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener el catálogo de dispositivos");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea un nuevo Dispositivo en el Catalogo.
 */
export async function crearCatalogoDispositivo(
    datosDispositivo: CatalogoDispositivoPayload,
): Promise<CatalogoDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/catalogo/`, {
        method: "POST",
        body: JSON.stringify(datosDispositivo),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error("Error al crear dispositivo:", errorData);
        throw new Error("No se pudo crear el dispositivo. Revisa los campos.");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista Instancias de Dispositivo, filtradas por ID de Proyecto.
 */
export async function listarInstancias(proyectoId: number): Promise<InstanciaDispositivo[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/instancias/?proyecto=${proyectoId}`);

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las instancias del proyecto");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Crea una nueva Instancia de Dispositivo.
 */
export async function crearInstancia(
    datosInstancia: InstanciaPayload,
): Promise<InstanciaDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/instancias/`, {
        method: "POST",
        body: JSON.stringify(datosInstancia),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesión expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la instancia");
    }
    return respuesta.json();
}

// (Aquí añadiremos futuras funciones: crearInstancia, etc.)
