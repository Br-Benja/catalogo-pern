import { Link } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore.js";

export default function Navbar() {
  const { user, checking, logout } = useAuthStore();

  const salir = async () => {
    await logout();
    toast.success("Sesión cerrada");
  };

  return (
    <header className="navbar bg-base-100 shadow-sm px-6">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold text-primary">
          Catálogo PERN
        </Link>
      </div>
      {!checking && (
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm hidden sm:inline">{user.name}</span>
              <span className={`badge ${user.role === "admin" ? "badge-primary" : "badge-ghost"}`}>{user.role}</span>
              <button className="btn btn-ghost btn-sm" onClick={salir}>
                <LogOut className="size-4" /> Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline btn-primary btn-sm">
              <LogIn className="size-4" /> Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
