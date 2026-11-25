import { z } from "zod";

/** DTO de entrada para iniciar sesión */
export const loginSchema = z
  .object({
    email: z
      .string({ required_error: "El correo es obligatorio" })
      .trim()
      .toLowerCase()
      .email("Escribe un correo válido")
      .max(255),
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(1, "La contraseña es obligatoria")
      .max(128, "La contraseña es demasiado larga"),
  })
  .strict();

/** DTO de salida: lo único que la API revela del usuario (nunca el hash) */
export const toUserDTO = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
