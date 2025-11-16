/**
 * Layout para la seccion de Catalogo.
 * Muestra el sub-menu de navegacion (Marcas, Categorias, etc.)
 * y renderiza la pagina hija correspondiente.
 */
import { NavLink, Outlet } from "react-router-dom";

export function CatalogoLayout() {
    return (
        <div>
            <h2 className="page-title">Gestión de Catálogo</h2>

            {/* Sub-Navegacion */}
            <nav className="sub-nav">
                <NavLink to="/catalogo/marcas">Marcas</NavLink>
                <NavLink to="/catalogo/categorias">Categorías</NavLink>
                <NavLink to="/catalogo/funciones">Funciones</NavLink>
                <NavLink to="/catalogo/dispositivos">Dispositivos</NavLink>
            </nav>

            {/* Contenido de la pagina hija (ej. MarcasPage) */}
            <div className="sub-page-content">
                <Outlet />
            </div>
        </div>
    );
}
