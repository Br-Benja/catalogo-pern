import { sql } from "../config/db.js";
import { toProductDTO } from "../dto/productDto.js";

const serverError = (res, where, error) => {
  console.error(`Error en ${where}:`, error.message);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
};

// GET /api/products  → HU01 Consultar catálogo
// Contrato: 200 { success: true, data: Product[] }  (data = [] si la tabla está vacía)
export const getProducts = async (req, res) => {
  try {
    const products = await sql`
      SELECT id, name, price, image, created_at
      FROM products
      ORDER BY created_at DESC, id DESC
    `;
    res.status(200).json({ success: true, data: products.map(toProductDTO) });
  } catch (error) {
    serverError(res, "getProducts", error);
  }
};

// POST /api/products  → HU02 Dar de alta
// El cuerpo ya pasó por el DTO: name sin espacios extremos, price numérico > 0, image URL http(s)
export const createProduct = async (req, res) => {
  const { name, price, image } = req.validated.body;
  try {
    const [product] = await sql`
      INSERT INTO products (name, price, image)
      VALUES (${name}, ${price}, ${image})
      RETURNING id, name, price, image, created_at
    `;
    res.status(201).json({ success: true, data: toProductDTO(product) });
  } catch (error) {
    serverError(res, "createProduct", error);
  }
};
