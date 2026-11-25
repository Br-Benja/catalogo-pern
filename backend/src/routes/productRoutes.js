import express from "express";
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { productInputSchema, idParamSchema } from "../dto/productDto.js";

const router = express.Router();

// Matriz de permisos (INV01)
//   visitante (sin sesión) → GET
//   usuario               → GET              (POST/PUT/DELETE → 403)
//   admin                 → GET, POST, PUT, DELETE
const soloAdmin = [requireAuth, requireRole("admin")];

// Consulta pública
router.get("/", getProducts);
router.get("/:id", validate(idParamSchema, "params"), getProduct);

// Escritura: primero identidad (401) y permiso (403), después validación (400)
router.post("/", ...soloAdmin, validate(productInputSchema), createProduct);
router.put("/:id", ...soloAdmin, validate(idParamSchema, "params"), validate(productInputSchema), updateProduct);
router.delete("/:id", ...soloAdmin, validate(idParamSchema, "params"), deleteProduct);

export default router;
