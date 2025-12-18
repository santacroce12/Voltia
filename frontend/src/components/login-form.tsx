import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUsuario } from "@/services/api";
import { Bolt } from "lucide-react";

type LoginFormProps = React.ComponentProps<"div"> & {
  onLoginExitoso: (token: string) => void;
};

export function LoginForm({ className, onLoginExitoso, ...props }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const token = await loginUsuario({ username: email, password });
      onLoginExitoso(token);
    } catch {
      setError("Credenciales invalidas. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-none shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="space-y-5 p-6 md:p-10" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="rounded-full bg-yellow-400/20 p-3 text-yellow-500">
                <Bolt className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-semibold">Bienvenido de nuevo</h1>
              <p className="text-sm text-muted-foreground">
                Ingresa con tus credenciales para administrar la plataforma energetica.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Usuario</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu usuario"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-yellow-500 text-black hover:bg-yellow-500/90" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <div className="hidden bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 md:flex flex-col items-center justify-center gap-4 p-10 text-white">
            <span className="rounded-full bg-white/10 p-4">
              <Bolt className="h-10 w-10" />
            </span>
            <p className="text-lg font-semibold">VOLTIA</p>
            <p className="text-sm text-white/80 text-center">
              Voltia protege tus operaciones electricas con monitoreo y trazabilidad profesional.
            </p>
          </div>
        </CardContent>
      </Card>
      <p className="px-2 text-center text-xs text-muted-foreground">
        Al continuar aceptas los <a className="text-yellow-600 underline-offset-2 hover:underline" href="#">Terminos</a> y la{" "}
        <a className="text-yellow-600 underline-offset-2 hover:underline" href="#">Politica de Privacidad</a>.
      </p>
    </div>
  );
}
