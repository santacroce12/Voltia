/**
 * Punto de entrada de la aplicacion de React.
 * Aqui montamos el arbol de componentes dentro del contenedor #root.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css"; // Estilos globales con comentarios en espanol

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("No se encontro el elemento root en index.html");
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
