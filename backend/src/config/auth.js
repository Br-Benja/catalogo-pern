import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET && isProd) {
  throw new Error("JWT_SECRET es obligatorio en producción");
}

export const JWT_SECRET = process.env.JWT_SECRET || "solo-para-desarrollo-cambiar";
export const JWT_EXPIRES_IN = "2h";
export const COOKIE_NAME = "token";

// La cookie viaja sola en cada petición; JavaScript del navegador no puede leerla (httpOnly)
export const cookieOptions = {
  httpOnly: true,
  secure: isProd, // en Render (HTTPS) solo se envía cifrada
  sameSite: "strict", // no se envía desde otros sitios (mitiga CSRF)
  maxAge: 2 * 60 * 60 * 1000,
  path: "/",
};
