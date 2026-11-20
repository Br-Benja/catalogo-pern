import axios from "axios";

// Vacío en desarrollo → peticiones relativas (/api/...) que Vite reenvía al backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});
