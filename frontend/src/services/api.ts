/**
 * Capa de servicios que centraliza las llamadas HTTP hacia el backend de Django.
 * Ahora incluye logica para manejar la autenticacion JWT.
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
export type ClienteUpdatePayload = Partial<ClientePayload>;

export type Obra = {
    id: number;
    cliente: number;
    usuario_creador: string;
    nombre_obra: string;
    estado_obra: string;
    fecha_creacion: string;
    pais?: string;
    provincia?: string;
    ubicacion?: string;
};

// Payload para crear una Obra
export type ObraPayload = {
    nombre_obra: string;
    cliente: number;
    estado_obra: string;
    pais: string;
    provincia: string;
    ubicacion?: string;
};
export type ObraUpdatePayload = Partial<ObraPayload>;

// Payload para crear un Proyecto
export type ProyectoPayload = {
    nombre_proyecto: string;
    obra: number;
    tipo: string;
    ubicacion_fisica?: string;
    estado_proyecto: string;
};
export type ProyectoUpdatePayload = Partial<ProyectoPayload>;
export type ClonePayload = {
    source_project_id: number;
    target_obra_id: number;
    nuevo_nombre?: string;
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

export type AtributoMaestro = {
    id: number;
    nombre: string;
    unidad: string | null;
};

export type AtributoMaestroPayload = Omit<AtributoMaestro, "id">;

// Payload para crear una Marca
export type MarcaPayload = Omit<Marca, "id">;
export type MarcaUpdatePayload = Partial<MarcaPayload>;

// Payload para crear una Categoria
export type CategoriaPayload = Omit<Categoria, "id">;
export type CategoriaUpdatePayload = Partial<CategoriaPayload>;

// Payload para crear una Funcion
export type FuncionPayload = Omit<FuncionDispositivo, "id">;
export type FuncionUpdatePayload = Partial<FuncionPayload>;

export type CatalogoDispositivo = {
    id: number;
    marca: number;
    categoria: number;
    modelo: string;
    nombre_completo_producto: string;
    descripcion_funcional?: string;
    url_ficha_tecnica?: string;
    precio_historico?: number;
    especificaciones: Record<string, any>;
    funciones_soportadas: number[];
    especificaciones_set: { id?: number; atributo: number; valor: string; nombre_atributo?: string; unidad_atributo?: string }[];
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
    precio_historico?: number;
    especificaciones_set: { atributo: number; valor: string }[];
    funciones_soportadas: number[];
};
export type CatalogoDispositivoUpdatePayload = Partial<CatalogoDispositivoPayload> & {
    descripcion_funcional?: string;
    especificaciones?: Record<string, any>;
};

export type InstanciaDispositivo = {
    id: number;
    proyecto: number;
    catalogo: number;
    usuario_creador: string;
    atributos: Record<string, any>;
    funciones_usadas: number[];
    nombre_dispositivo?: string;
    marca_dispositivo?: string;
    categoria_dispositivo?: string;
    subcategoria_dispositivo?: string;
    nombre_proyecto?: string;
    precio_real?: number;
    catalogo_precio_historico?: number;
    atributos_set?: { id: number; atributo: number; valor: string; nombre_atributo?: string; unidad_atributo?: string }[];
};

export type InstanciaPayload = {
    proyecto: number;
    catalogo: number;
    atributos_set?: { atributo: number; valor: string }[];
    funciones_usadas: number[];
    precio_real?: number;
};

export type ServicioProyecto = {
    id: number;
    proyecto: number;
    obra: number;
    item_servicio: string;
    horas_estimadas?: number;
    tarifa_hora_ref?: number;
    notas_alcance?: string;
};
export type ServicioPayload = Omit<ServicioProyecto, "id">;

export type UrlExterna = {
    id: number;
    proyecto: number;
    tipo_enlace: string;
    url: string;
    descripcion?: string;
};
export type UrlExternaPayload = Omit<UrlExterna, "id">;

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
 * Funcion 'wrapper' para peticiones fetch autenticadas.
 * Lee el token de localStorage y lo inyecta en la cabecera 'Authorization'.
 */
async function fetchProtegido(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.append("Authorization", `Bearer ${token}`);
    }

    headers.append("Content-Type", "application/json");

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        console.warn("Sesión expirada. Redirigiendo al login...");
        limpiarToken();
        window.location.href = "/login";
        throw new Error("Sesion expirada");
    }

    if (response.status === 429) {
        console.warn("Demasiadas peticiones. Intenta de nuevo en unos instantes.");
        throw new Error("Demasiadas peticiones (429)");
    }

    return response;
}

/**
 * [PUBLICO] Endpoint de salud. No requiere token.
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
        // El token expiro o es invalido
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de proyectos");
    }
    return respuesta.json();
}

/**
 * [PUBLICO] Llama al endpoint de login (/api/token/).
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
        throw new Error("Usuario o contrasena incorrectos");
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
        throw new Error("Sesion expirada");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        // Podriamos leer el body para ver errores de validacion
        throw new Error("No se pudo crear el cliente");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente un cliente existente.
 */
export async function actualizarCliente(
    clienteId: number,
    datosCliente: ClienteUpdatePayload,
): Promise<Cliente> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/clientes/${clienteId}/`, {
        method: "PATCH",
        body: JSON.stringify(datosCliente),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el cliente");
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
        throw new Error("Sesion expirada");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la obra");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente una obra existente.
 */
export async function actualizarObra(
    obraId: number,
    datosObra: ObraUpdatePayload,
): Promise<Obra> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/obras/${obraId}/`, {
        method: "PATCH",
        body: JSON.stringify(datosObra),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar la obra");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear el proyecto");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Clona un proyecto existente y todas sus instancias a una nueva obra.
 */
export async function clonarProyecto(payload: ClonePayload): Promise<Proyecto> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/proyectos/clone/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({ error: "Error de servidor" }));
        throw new Error(errorData.error || "No se pudo clonar el proyecto.");
    }

    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente un proyecto.
 */
export async function actualizarProyecto(
    proyectoId: number,
    datosProyecto: ProyectoUpdatePayload,
): Promise<Proyecto> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/proyectos/${proyectoId}/`, {
        method: "PATCH",
        body: JSON.stringify(datosProyecto),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el proyecto");
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
        throw new Error("Sesion expirada");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener la lista de categorias");
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
        throw new Error("Sesion expirada");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la categoria");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente una Categoria.
 */
export async function actualizarCategoria(
    categoriaId: number,
    datosCategoria: CategoriaUpdatePayload,
): Promise<Categoria> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/categorias/${categoriaId}/`, {
        method: "PATCH",
        body: JSON.stringify(datosCategoria),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar la categoria");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la funcion");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente una Funcion de Dispositivo.
 */
export async function actualizarFuncion(
    funcionId: number,
    datosFuncion: FuncionUpdatePayload,
): Promise<FuncionDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/funciones/${funcionId}/`, {
        method: "PATCH",
        body: JSON.stringify(datosFuncion),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar la funcion");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la marca");
    }
    return respuesta.json();
}

export async function actualizarMarca(marcaId: number, datosMarca: MarcaUpdatePayload): Promise<Marca> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/marcas/${marcaId}/`, {
        method: "PATCH",
        body: JSON.stringify(datosMarca),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar la marca");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener el catalogo de dispositivos");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error("Error al crear dispositivo:", errorData);
        throw new Error("No se pudo crear el dispositivo. Revisa los campos.");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente un dispositivo del Catalogo (datos generales).
 */
export async function actualizarCatalogoDispositivo(
    dispositivoId: number,
    datos: CatalogoDispositivoUpdatePayload,
): Promise<CatalogoDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/catalogo/${dispositivoId}/`, {
        method: "PATCH",
        body: JSON.stringify(datos),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el dispositivo del catalogo");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las instancias del proyecto");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista todas las Instancias de Dispositivo (sin filtrar por proyecto).
 */
export async function listarInstanciasTodas(): Promise<InstanciaDispositivo[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/instancias/`);
    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las instancias");
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
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo crear la instancia");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente un dispositivo del Catalogo.
 * Principalmente para modificar las funciones soportadas.
 */
export async function updateCatalogoFunciones(
    dispositivoId: number,
    funcionesSoportadasIds: number[],
): Promise<CatalogoDispositivo> {
    const payload = { funciones_soportadas: funcionesSoportadasIds };
    const respuesta = await fetchProtegido(`${API_BASE_URL}/catalogo/${dispositivoId}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el dispositivo del catalogo");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Obtiene el detalle de una instancia.
 */
export async function getInstanciaDetalle(instanciaId: number): Promise<InstanciaDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/instancias/${instanciaId}/`);
    if (!respuesta.ok) {
        throw new Error("No se pudo obtener el detalle de la instancia.");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Obtiene el detalle de un dispositivo del catalogo por ID.
 */
export async function getCatalogoDetalle(id: number): Promise<CatalogoDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/catalogo/${id}/`);
    if (!respuesta.ok) {
        throw new Error("No se pudo obtener el detalle del catalogo.");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente una instancia de dispositivo.
 */
export async function updateInstancia(
    instanciaId: number,
    data: Partial<InstanciaPayload>,
): Promise<InstanciaDispositivo> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/instancias/${instanciaId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    if (!respuesta.ok) {
        throw new Error("Error al actualizar la instancia.");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Borra una instancia de dispositivo por su ID.
 */
export async function borrarInstancia(instanciaId: number): Promise<void> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/instancias/${instanciaId}/`, {
        method: "DELETE",
    });

    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }

    if (!respuesta.ok && respuesta.status !== 204) {
        throw new Error("No se pudo borrar la instancia.");
    }
}

/** [PROTEGIDO] Lista Servicios filtrados por ID de Proyecto */
export async function listarServicios(proyectoId: number): Promise<ServicioProyecto[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/servicios/?proyecto=${proyectoId}`);
    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }
    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los servicios");
    }
    return respuesta.json();
}

/** [PROTEGIDO] Crea un nuevo Servicio */
export async function crearServicio(payload: ServicioPayload): Promise<ServicioProyecto> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/servicios/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }
    if (!respuesta.ok) {
        throw new Error("No se pudo crear el servicio");
    }
    return respuesta.json();
}

/** [PROTEGIDO] Lista URLs filtradas por ID de Proyecto */
export async function listarUrls(proyectoId: number): Promise<UrlExterna[]> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/urls-externas/?proyecto=${proyectoId}`);
    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }
    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las URLs");
    }
    return respuesta.json();
}

/** [PROTEGIDO] Crea una nueva URL */
export async function crearUrl(payload: UrlExternaPayload): Promise<UrlExterna> {
    const respuesta = await fetchProtegido(`${API_BASE_URL}/urls-externas/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (respuesta.status === 401) {
        limpiarToken();
        throw new Error("Sesion expirada");
    }
    if (!respuesta.ok) {
        throw new Error("No se pudo crear la URL");
    }
    return respuesta.json();
}

/**
 * [PROTEGIDO] Lista todos los Atributos Maestros (diccionario).
 */
export async function listarAtributosMaestros(): Promise<AtributoMaestro[]> {
    const res = await fetchProtegido(`${API_BASE_URL}/atributos/maestro/`);
    if (!res.ok) {
        throw new Error("No se pudieron obtener los atributos maestros");
    }
    return res.json();
}

/**
 * [PROTEGIDO] Crea un nuevo Atributo Maestro.
 */
export async function crearAtributoMaestro(data: AtributoMaestroPayload): Promise<AtributoMaestro> {
    const res = await fetchProtegido(`${API_BASE_URL}/atributos/maestro/`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Error al crear atributo.");
    }
    return res.json();
}

/**
 * [PROTEGIDO] Actualiza parcialmente un Atributo Maestro existente.
 */
export async function actualizarAtributoMaestro(
    id: number,
    data: Partial<AtributoMaestroPayload>,
): Promise<AtributoMaestro> {
    const res = await fetchProtegido(`${API_BASE_URL}/atributos/maestro/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Error al actualizar atributo.");
    }
    return res.json();
}

// Utilidades
export { fetchProtegido };
