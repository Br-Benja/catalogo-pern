import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const app = express();

// En Render la app va detrás de un proxy HTTPS: necesario para cookies "secure" y el límite por IP
if (isProd) app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:"], // imágenes de productos por URL
      },
    },
  })
);
if (process.env.NODE_ENV !== "test") app.use(morgan(isProd ? "tiny" : "dev"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// API inexistente
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// En producción Express también sirve la compilación de React (HU05)
if (isProd) {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist");
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

// Cualquier otra ruta
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
