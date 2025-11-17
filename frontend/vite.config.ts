/**
 * Configuracion principal de Vite para el frontend de VOLTIA.
 * Se incluye el plugin de React y ajustes utiles para desarrollo local.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()], // Habilita JSX y las optimizaciones de React
    server: {
        host: true, // Permite acceder desde otras maquinas de la red
        port: Number(process.env.VITE_PORT ?? 5173),
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
