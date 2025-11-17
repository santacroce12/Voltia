import { LoginForm } from "@/components/login-form";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm
          onLoginExitoso={() => {
            navigate("/");
          }}
        />
      </div>
    </div>
  );
}
