import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const sqlMock = jest.fn();
jest.unstable_mockModule("../src/config/db.js", () => ({ sql: sqlMock }));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { cookieFor } = await import("./helpers.js");

// Las operaciones de escritura requieren sesión de administrador (INV01)
const admin = () => request.agent(app).set("Cookie", cookieFor("admin"));

const fila = { id: 2, name: "Reloj inteligente", price: "1499.50", image: "https://example.com/r.jpg", created_at: "2026-11-19" };

describe("HU04 · DELETE /api/products/:id", () => {
  beforeEach(() => sqlMock.mockReset());

  test("confirmar la baja responde 200 con el producto eliminado", async () => {
    sqlMock.mockResolvedValue([fila]);
    const res = await admin().delete("/api/products/2");
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 2, name: "Reloj inteligente" });
  });

  test("el DELETE es parametrizado con el id", async () => {
    sqlMock.mockResolvedValue([fila]);
    await admin().delete("/api/products/2");
    const [strings, id] = sqlMock.mock.calls[0];
    expect(strings.join("?")).toMatch(/DELETE FROM products/);
    expect(id).toBe(2);
  });

  test("ID que ya no existe responde 404", async () => {
    sqlMock.mockResolvedValue([]);
    const res = await admin().delete("/api/products/2");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Producto no encontrado");
  });

  test("borrar dos veces el mismo producto: 200 y después 404", async () => {
    sqlMock.mockResolvedValueOnce([fila]).mockResolvedValueOnce([]);
    const primera = await admin().delete("/api/products/2");
    const segunda = await admin().delete("/api/products/2");
    expect([primera.status, segunda.status]).toEqual([200, 404]);
  });

  test("ID con formato inválido responde 400 y no toca la base", async () => {
    const res = await admin().delete("/api/products/abc");
    expect(res.status).toBe(400);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  test("si falla la base de datos responde 500", async () => {
    sqlMock.mockRejectedValue(new Error("timeout"));
    const res = await admin().delete("/api/products/2");
    expect(res.status).toBe(500);
  });
});
