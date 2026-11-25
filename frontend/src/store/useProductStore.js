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

  // Al escribir en un campo se borra su error anterior
  setFormData: (formData) =>
    set((state) => {
      const formErrors = { ...state.formErrors };
      for (const key of Object.keys(formData)) {
        if (formData[key] !== state.formData[key]) delete formErrors[key];
      }
      return { formData, formErrors };
    }),
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

  // Edición (HU03): currentProduct es el último dato confirmado por la API;
  // editForm es lo que el usuario está escribiendo y no toca el catálogo hasta que la API responde 200.
  currentProduct: null,
  productLoading: false,
  productError: null,
  editForm: { ...emptyForm },
  editErrors: {},
  saving: false,

  setEditForm: (editForm) =>
    set((state) => {
      const editErrors = { ...state.editErrors };
      for (const key of Object.keys(editForm)) {
        if (editForm[key] !== state.editForm[key]) delete editErrors[key];
      }
      return { editForm, editErrors };
    }),

  // GET /api/products/:id
  fetchProduct: async (id) => {
    set({ productLoading: true, productError: null, currentProduct: null, editErrors: {} });
    try {
      const res = await api.get(`/api/products/${id}`);
      const p = res.data.data;
      set({ currentProduct: p, editForm: { name: p.name, price: String(p.price), image: p.image } });
    } catch (err) {
      const { status, message } = parseApiError(err, "No se pudo cargar el producto");
      set({ productError: status === 404 ? "Producto no encontrado" : message });
    } finally {
      set({ productLoading: false });
    }
  },

  // PUT /api/products/:id → devuelve { ok, message }
  updateProduct: async (id) => {
    set({ saving: true, editErrors: {} });
    try {
      const res = await api.put(`/api/products/${id}`, get().editForm);
      const saved = res.data.data;
      // Solo con 200 se actualiza el dato confirmado y el catálogo
      set((state) => ({
        currentProduct: saved,
        products: state.products.map((p) => (p.id === saved.id ? saved : p)),
      }));
      return { ok: true, message: "Cambios guardados" };
    } catch (err) {
      // Si falla, el catálogo y currentProduct conservan el último dato confirmado
      const { status, message, fieldErrors } = parseApiError(err, "No se pudieron guardar los cambios");
      set({ editErrors: fieldErrors });
      return { ok: false, message: status === 404 ? "El producto ya no existe" : message };
    } finally {
      set({ saving: false });
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
