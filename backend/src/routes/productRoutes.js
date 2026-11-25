import express from "express";
import { getProducts, createProduct } from "../controllers/productController.js";
import { validate } from "../middleware/validate.js";
import { productInputSchema } from "../dto/productDto.js";

const router = express.Router();

// Las rutas solo encadenan la validación y el controlador
router.get("/", getProducts);
router.post("/", validate(productInputSchema), createProduct);

export default router;
