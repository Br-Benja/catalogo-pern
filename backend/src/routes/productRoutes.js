import express from "express";
import { getProducts, createProduct, getProduct, updateProduct } from "../controllers/productController.js";
import { validate } from "../middleware/validate.js";
import { productInputSchema, idParamSchema } from "../dto/productDto.js";

const router = express.Router();

// Las rutas solo encadenan la validación y el controlador
router.get("/", getProducts);
router.post("/", validate(productInputSchema), createProduct);
router.get("/:id", validate(idParamSchema, "params"), getProduct);
router.put("/:id", validate(idParamSchema, "params"), validate(productInputSchema), updateProduct);

export default router;
