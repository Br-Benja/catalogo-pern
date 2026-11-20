import { sql } from "../config/db.js";

// GET /api/products  → HU01 Consultar catálogo
// Contrato: 200 { success: true, data: Product[] }  (data = [] si la tabla está vacía)
export const getProducts = async (req, res) => {
  try {
    const products = await sql`
      SELECT id, name, price, image, created_at
      FROM products
      ORDER BY created_at DESC
    `;
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error en getProducts:", error.message);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};
