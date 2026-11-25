import { create } from "zustand";
import { api, parseApiError } from "../lib/api.js";

// Sesión del usuario. El token vive en una cookie httpOnly: React nunca lo ve,
// solo conoce los datos públicos del usuario (nombre, correo y rol).
export const useAuthStore = create((set) => ({
  user: null,
  checking: true,

  // ¿Hay una sesión activa? (al cargar la app)
  fetchMe: async () => {
    try {
      const res = await api.get("/api/auth/me");
      set({ user: res.data.data });
    } catch {
      set({ user: null });
    } finally {
      set({ checking: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      set({ user: res.data.data });
      return { ok: true, fieldErrors: {} };
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err, "No se pudo iniciar sesión");
      return { ok: false, message, fieldErrors };
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      set({ user: null });
    }
  },
}));

export const useIsAdmin = () => useAuthStore((s) => s.user?.role === "admin");
