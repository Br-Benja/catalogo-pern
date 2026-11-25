import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";
import bcrypt from "bcryptjs";

const sqlMock = jest.fn();
jest.unstable_mockModule("../src/config/db.js", () => ({ sql: sqlMock }));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { cookieFor } = await import("./helpers.js");

const PASSWORD = "Prueba-Segura-2026";
let admin;

beforeAll(() => {
  admin = { id: 1, name: "Administrador", email: "admin@catalogo.test", role: "admin", password_hash: bcrypt.hashSync(PASSWORD, 4) };
});

describe("INV01 · POST /api/auth/login", () => {
  beforeEach(() => sqlMock.mockReset());

  test("credenciales correctas: 200, datos del usuario y cookie httpOnly", async () => {
    sqlMock.mockResolvedValue([admin]);
    const res = await request(app).post("/api/auth/login").send({ email: "Admin@Catalogo.test ", password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: 1, name: "Administrador", email: "admin@catalogo.test", role: "admin" });
    const cookie = res.headers["set-cookie"][0];
    expect(cookie).toMatch(/^token=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);
  });

  test("nunca devuelve el hash de la contraseña", async () => {
    sqlMock.mockResolvedValue([admin]);
    const res = await request(app).post("/api/auth/login").send({ email: admin.email, password: PASSWORD });
    expect(JSON.stringify(res.body)).not.toMatch(/password|\$2[ab]\$/);
  });

  test("el correo se busca en minúsculas con consulta parametrizada", async () => {
    sqlMock.mockResolvedValue([admin]);
    await request(app).post("/api/auth/login").send({ email: "ADMIN@catalogo.TEST", password: PASSWORD });
    const [strings, email] = sqlMock.mock.calls[0];
    expect(strings.join("?")).toMatch(/FROM users WHERE email = \?/);
    expect(email).toBe("admin@catalogo.test");
  });

  test("contraseña incorrecta: 401 sin cookie", async () => {
    sqlMock.mockResolvedValue([admin]);
    const res = await request(app).post("/api/auth/login").send({ email: admin.email, password: "otra-cosa" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Correo o contraseña incorrectos");
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  test("correo no registrado: mismo 401 y mismo mensaje (no revela qué correos existen)", async () => {
    sqlMock.mockResolvedValue([]);
    const res = await request(app).post("/api/auth/login").send({ email: "nadie@catalogo.test", password: PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Correo o contraseña incorrectos");
  });

  test("datos inválidos: 400 y no consulta la base", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "no-es-correo", password: "" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(["email", "password"]);
    expect(sqlMock).not.toHaveBeenCalled();
  });
});

describe("INV01 · sesión", () => {
  test("GET /api/auth/me sin cookie: 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/auth/me con sesión: 200 con el usuario", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", cookieFor("usuario"));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 2, role: "usuario" });
  });

  test("token alterado: 401", async () => {
    const alterado = cookieFor("usuario").replace(/.$/, (c) => (c === "a" ? "b" : "a"));
    const res = await request(app).get("/api/auth/me").set("Cookie", alterado);
    expect(res.status).toBe(401);
  });

  test("token vencido: 401", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", cookieFor("admin", { expiresIn: -10 }));
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Tu sesión expiró o no es válida");
  });

  test("POST /api/auth/logout borra la cookie", async () => {
    const res = await request(app).post("/api/auth/logout").set("Cookie", cookieFor("admin"));
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"][0]).toMatch(/^token=;.*Expires=Thu, 01 Jan 1970/);
  });
});

describe("INV01 · límite de intentos (OWASP)", () => {
  test("después de 10 intentos en 15 minutos responde 429", async () => {
    sqlMock.mockResolvedValue([]);
    // Este archivo ya hizo 6 intentos de login; completamos hasta pasar el límite
    let ultimo;
    for (let i = 0; i < 6; i++) {
      ultimo = await request(app).post("/api/auth/login").send({ email: "x@catalogo.test", password: "x" });
    }
    expect(ultimo.status).toBe(429);
  });
});
