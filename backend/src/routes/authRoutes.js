import express from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { loginSchema } from "../dto/authDto.js";

const router = express.Router();

// OWASP: limitar intentos para frenar ataques de fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_MAX_ATTEMPTS) || 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Demasiados intentos. Espera 15 minutos e intenta de nuevo." },
});

router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
