import { create } from "zustand";
import { api } from "../lib/api.js";

// Estado compartido del catálogo
export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/products");
      set({ products: res.data.data });
    } catch (err) {
      set({ products: [], error: "No se pudo cargar el catálogo. Intenta de nuevo." });
    } finally {
      set({ loading: false });
    }
  },
}));
