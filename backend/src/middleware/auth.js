import jwt from "jsonwebtoken";
import { JWT_SECRET, COOKIE_NAME } from "../config/auth.js";

/**
 * Identidad: ¿quién eres?
 * Lee el JWT de la cookie httpOnly y lo verifica (firma y expiración).
 * Sin sesión válida → 401 Unauthorized.
 */
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: "Inicia sesión para continuar" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    req.user = { id: Number(payload.sub), name: payload.name, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Tu sesión expiró o no es válida" });
  }
};

/**
 * Permiso: ¿puedes hacer esto?
 * Se usa después de requireAuth. Rol no permitido → 403 Forbidden.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: "No tienes permiso para esta acción" });
  }
  next();
};
