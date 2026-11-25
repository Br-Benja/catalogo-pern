import jwt from "jsonwebtoken";

const usuarios = {
  admin: { sub: "1", name: "Administrador", email: "admin@catalogo.test", role: "admin" },
  usuario: { sub: "2", name: "Usuario de consulta", email: "usuario@catalogo.test", role: "usuario" },
};

/** Cookie de sesión válida para el rol indicado (firmada con el secreto de pruebas) */
export const cookieFor = (role, opts = {}) =>
  `token=${jwt.sign(usuarios[role], process.env.JWT_SECRET, { expiresIn: "2h", ...opts })}`;
