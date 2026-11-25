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
app.use(helmet()); // encabezados HTTP de seguridad
if (process.env.NODE_ENV !== "test") app.use(morgan("dev")); // registra método, ruta y código HTTP

app.use("/api/products", productRoutes);

// Ruta inexistente
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// JSON mal formado u otros errores no controlados
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "El cuerpo no es JSON válido" });
  }
  console.error("Error no controlado:", err.message);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
});

// La app se exporta sin listen() para que Supertest la pruebe directamente
export default app;
