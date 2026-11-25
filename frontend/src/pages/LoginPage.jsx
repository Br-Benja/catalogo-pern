import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore.js";

export default function LoginPage() {
  const { user, login } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    const res = await login(form.email, form.password);
    setSending(false);
    if (res.ok) {
      toast.success("Sesión iniciada");
      navigate("/");
    } else {
      setErrors(res.fieldErrors);
      setError(res.message);
    }
  };

  const change = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: undefined });
    setError(null);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="card bg-base-100 shadow-md">
        <form noValidate onSubmit={submit} className="card-body space-y-3">
          <h1 className="card-title text-2xl">Iniciar sesión</h1>
          <p className="text-sm text-base-content/70">
            Cualquier visitante puede consultar el catálogo. Para agregar, editar o eliminar productos inicia sesión
            como administrador.
          </p>

          {error && <div role="alert" className="alert alert-error text-sm py-2">{error}</div>}

          <label className="block">
            <span className="label-text font-medium mb-1 block">Correo</span>
            <input
              type="email"
              autoComplete="username"
              className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
              value={form.email}
              onChange={change("email")}
            />
            {errors.email && <span className="text-error text-sm mt-1 block">{errors.email}</span>}
          </label>

          <label className="block">
            <span className="label-text font-medium mb-1 block">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
              value={form.password}
              onChange={change("password")}
            />
            {errors.password && <span className="text-error text-sm mt-1 block">{errors.password}</span>}
          </label>

          <button type="submit" className="btn btn-primary w-full" disabled={sending}>
            {sending ? <span className="loading loading-spinner loading-sm" /> : <LogIn className="size-4" />}
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
