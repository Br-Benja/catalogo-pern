import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(helmet());   // encabezados HTTP de seguridad
app.use(morgan("dev")); // registra método, ruta y código HTTP

app.use("/api/products", productRoutes);

// La app se exporta sin listen() para que Supertest la pruebe directamente
export default app;
