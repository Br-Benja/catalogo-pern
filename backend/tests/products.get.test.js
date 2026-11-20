import { jest, describe, test, expect, beforeEach } from "@jest/globals";

// Se sustituye la conexión a Neon por un doble de prueba
const sqlMock = jest.fn();
jest.unstable_mockModule("../src/config/db.js", () => ({ sql: sqlMock }));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");

describe("HU01 · GET /api/products", () => {
  beforeEach(() => sqlMock.mockReset());

  test("con dos productos responde 200 y ambos en data", async () => {
    sqlMock.mockResolvedValue([
      { id: 1, name: "Audífonos inalámbricos", price: "899.00", image: "https://x/1.jpg" },
      { id: 2, name: "Reloj inteligente", price: "1499.50", image: "https://x/2.jpg" },
    ]);
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  test("con la tabla vacía responde 200 y data = []", async () => {
    sqlMock.mockResolvedValue([]);
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [] });
  });

  test("si falla la base de datos responde 500", async () => {
    sqlMock.mockRejectedValue(new Error("conexión rechazada"));
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
