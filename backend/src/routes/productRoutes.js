import express from "express";
import { getProducts } from "../controllers/productController.js";

const router = express.Router();

// La ruta solo delega en el controlador
router.get("/", getProducts);

export default router;
