import { z } from "zod";

// Convierte "12.5" → 12.5 sin aceptar valores raros (null, true, "") como 0 o 1
const toNumber = (value) =>
  typeof value === "string" && value.trim() !== "" ? Number(value) : value;

/**
 * DTO de entrada: define qué campos y tipos cruzan la interfaz HTTP
 * al crear o editar un producto. Cualquier otro campo se rechaza.
 */
export const productInputSchema = z
  .object({
    name: z
      .string({ required_error: "El nombre es obligatorio", invalid_type_error: "El nombre debe ser texto" })
      .trim()
      .min(1, "El nombre no puede estar vacío")
      .max(255, "El nombre admite máximo 255 caracteres"),
    price: z.preprocess(
      toNumber,
      z
        .number({ required_error: "El precio es obligatorio", invalid_type_error: "El precio debe ser numérico" })
        .finite("El precio debe ser numérico")
        .positive("El precio debe ser mayor que 0")
        .max(99999999.99, "El precio es demasiado grande")
    ),
    image: z
      .string({ required_error: "La imagen es obligatoria", invalid_type_error: "La imagen debe ser una URL" })
      .trim()
      .url("La imagen debe ser una URL válida")
      .max(500, "La URL admite máximo 500 caracteres")
      .refine((url) => /^https?:\/\//i.test(url), "La URL debe iniciar con http:// o https://"),
  })
  .strict();

/** DTO de salida: forma en que la API devuelve un producto */
export const toProductDTO = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  image: row.image,
  created_at: row.created_at,
});
