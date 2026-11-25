import axios from "axios";

// Vacío en desarrollo → peticiones relativas (/api/...) que Vite reenvía al backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

/** Extrae el mensaje y los errores por campo que devuelve la API */
export const parseApiError = (err, fallback = "Ocurrió un error. Intenta de nuevo.") => {
  const data = err?.response?.data;
  return {
    status: err?.response?.status ?? null,
    message: data?.message || fallback,
    fieldErrors: data?.errors || {},
  };
};
