import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME, cookieOptions } from "../config/auth.js";
import { toUserDTO } from "../dto/authDto.js";

// Hash de relleno: si el correo no existe igual se compara una contraseña,
// así la respuesta tarda lo mismo y no revela qué correos están registrados.
const DUMMY_HASH = bcrypt.hashSync("contraseña-de-relleno", 12);
const INVALID = "Correo o contraseña incorrectos";

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.validated.body;
  try {
    const [user] = await sql`
      SELECT id, name, email, password_hash, role FROM users WHERE email = ${email}
    `;
    const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !ok) {
      return res.status(401).json({ success: false, message: INVALID });
    }
    const token = jwt.sign(
      { sub: String(user.id), name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN, algorithm: "HS256" }
    );
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.status(200).json({ success: true, data: toUserDTO(user) });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") console.error("Error en login:", error.message);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  const { maxAge, ...opts } = cookieOptions;
  res.clearCookie(COOKIE_NAME, opts);
  res.status(200).json({ success: true, message: "Sesión cerrada" });
};

// GET /api/auth/me  (requireAuth ya validó el token)
export const me = (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};
