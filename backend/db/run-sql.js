// Ejecuta un archivo .sql contra la base de Neon definida en .env
// Uso: node db/run-sql.js db/schema.sql
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const sql = neon(process.env.DATABASE_URL);
const file = process.argv[2];
const statements = fs.readFileSync(file, "utf8")
  .split("\n").filter((l) => !l.trim().startsWith("--")).join("\n")
  .split(";").map((s) => s.trim()).filter(Boolean);

for (const stmt of statements) {
  await sql(stmt);
}
console.log(`OK ${file} (${statements.length} sentencia(s))`);
const rows = await sql`SELECT id, name, price FROM products ORDER BY id`;
console.table(rows);
