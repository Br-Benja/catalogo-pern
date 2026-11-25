import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const sqlMock = jest.fn();
jest.unstable_mockModule("../src/config/db.js", () => ({ sql: sqlMock }));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { cookieFor } = await import("./helpers.js");

const fila = { id: 1, name: "Audífonos", price: "899.00", image: "https://example.com/a.jpg", created_at: "2026-11-19" };
const body = { name: "Audífonos", price: 899, image: "https://example.com/a.jpg" };

// Matriz de permisos de la práctica: el visitante consulta; el administrador crea, edita y elimina
const escrituras = [
  ["POST", "/api/products", 201],
  ["PUT", "/api/products/1", 200],
  ["DELETE", "/api/products/1", 200],
];

const enviar = (metodo, ruta, cookie) => {
  const r = request(app)[metodo.toLowerCase()](ruta);
  if (cookie) r.set("Cookie", cookie);
  return metodo === "DELETE" ? r : r.send(body);
};

describe("INV01 · matriz de permisos", () => {
  beforeEach(() => {
    sqlMock.mockReset();
    sqlMock.mockResolvedValue([fila]);
  });

  test.each([
    ["visitante", null],
    ["usuario", "usuario"],
    ["admin", "admin"],
  ])("GET /api/products es público (%s → 200)", async (_quien, rol) => {
    const r = request(app).get("/api/products");
    if (rol) r.set("Cookie", cookieFor(rol));
    expect((await r).status).toBe(200);
  });

  test.each(escrituras)("%s %s sin sesión → 401 y no toca la base", async (metodo, ruta) => {
    const res = await enviar(metodo, ruta, null);
    expect(res.status).toBe(401);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  test.each(escrituras)("%s %s con rol usuario → 403 y no toca la base", async (metodo, ruta) => {
    const res = await enviar(metodo, ruta, cookieFor("usuario"));
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("No tienes permiso para esta acción");
    expect(sqlMock).not.toHaveBeenCalled();
  });

  test.each(escrituras)("%s %s con rol admin → %i", async (metodo, ruta, esperado) => {
    const res = await enviar(metodo, ruta, cookieFor("admin"));
    expect(res.status).toBe(esperado);
  });

  test("sin sesión y con datos inválidos responde 401 (la identidad se revisa antes que los datos)", async () => {
    const res = await request(app).post("/api/products").send({ price: -1 });
    expect(res.status).toBe(401);
  });
});
