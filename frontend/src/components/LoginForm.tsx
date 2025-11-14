/**
 * Componente que renderiza un formulario de inicio de sesión.
 * Maneja su propio estado para usuario/clave y reporta el éxito.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { loginUsuario } from "../services/api"; // Importamos la función de la API

type LoginFormProps = {
    // Función 'callback' que se llamará cuando el login sea exitoso
    onLoginExitoso: (token: string) => void;
};

export function LoginForm({ onLoginExitoso }: LoginFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Evita que la página se recargue
        setError(null);
        setCargando(true);

        try {
            const token = await loginUsuario({ username, password });
            onLoginExitoso(token); // Avisamos al componente padre (App)
        } catch {
            setError("Error: Usuario o contraseña incorrectos.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2>Iniciar Sesión en VOLTIA</h2>
            <div className="form-group">
                <label htmlFor="username">Usuario:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={cargando}>
                {cargando ? "Ingresando..." : "Ingresar"}
            </button>
        </form>
    );
}
