import { create } from "zustand";
import { api, parseApiError } from "../lib/api.js";

const emptyForm = { name: "", price: "", image: "" };

// Estado compartido del catálogo
export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  // Formulario de alta (HU02)
  formData: { ...emptyForm },
  formErrors: {},
  submitting: false,

  setFormData: (formData) => set({ formData }),
  resetForm: () => set({ formData: { ...emptyForm }, formErrors: {} }),

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

  // POST /api/products → devuelve { ok, message }
  addProduct: async () => {
    set({ submitting: true, formErrors: {} });
    try {
      const res = await api.post("/api/products", get().formData);
      // El producto confirmado por la API se agrega al inicio del catálogo
      set((state) => ({ products: [res.data.data, ...state.products] }));
      get().resetForm();
      return { ok: true, message: "Producto registrado" };
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err, "No se pudo registrar el producto");
      set({ formErrors: fieldErrors });
      return { ok: false, message };
    } finally {
      set({ submitting: false });
    }
  },
}));
