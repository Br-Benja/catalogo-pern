import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL no está definida. Copia .env.example a .env");
}

// sql`...` ejecuta consultas parametrizadas: los valores interpolados
// se envían como parámetros ($1, $2...), nunca concatenados al SQL.
export const sql = neon(process.env.DATABASE_URL ?? "postgresql://invalid");
