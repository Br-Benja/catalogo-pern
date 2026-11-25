// Crea (o actualiza) las cuentas de prueba leyendo los datos de backend/.env.
// Las contraseñas NO se guardan en el repositorio: solo su hash bcrypt llega a la base.
// Uso: node db/seed-users.js
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config();
const sql = neon(process.env.DATABASE_URL);

const cuentas = [
  { name: "Administrador", email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: "admin" },
  { name: "Usuario de consulta", email: process.env.USER_EMAIL, password: process.env.USER_PASSWORD, role: "usuario" },
];

for (const c of cuentas) {
  if (!c.email || !c.password) {
    console.error(`Falta ${c.role === "admin" ? "ADMIN" : "USER"}_EMAIL o _PASSWORD en backend/.env`);
    process.exit(1);
  }
  if (c.password.length < 12) {
    console.error(`La contraseña de ${c.email} debe tener al menos 12 caracteres`);
    process.exit(1);
  }
  const hash = await bcrypt.hash(c.password, 12);
  await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${c.name}, ${c.email.toLowerCase()}, ${hash}, ${c.role})
    ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
  `;
  console.log(`OK ${c.role.padEnd(7)} ${c.email.toLowerCase()}`);
}
