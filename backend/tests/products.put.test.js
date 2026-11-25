import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const sqlMock = jest.fn();
jest.unstable_mockModule("../src/config/db.js", () => ({ sql: sqlMock }));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { cookieFor } = await import("./helpers.js");

// Las operaciones de escritura requieren sesión de administrador (INV01)
const admin = () => request.agent(app).set("Cookie", cookieFor("admin"));

const fila = { id: 1, name: "Audífonos inalámbricos", price: "899.00", image: "https://example.com/a.jpg", created_at: "2026-11-19" };
const cambios = { name: "Audífonos Pro", price: 1099, image: "https://example.com/a2.jpg" };

describe("HU03 · GET /api/products/:id", () => {
  beforeEach(() => sqlMock.mockReset());

  test("producto existente responde 200", async () => {
    sqlMock.mockResolvedValue([fila]);
    const res = await request(app).get("/api/products/1");
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 1, price: 899 });
  });

  test("ID inexistente responde 404", async () => {
    sqlMock.mockResolvedValue([]);
    const res = await request(app).get("/api/products/999");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Producto no encontrado");
  });

  test.each(["abc", "0", "-3", "1.5"])("ID con formato inválido (%s) responde 400", async (id) => {
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(400);
    expect(sqlMock).not.toHaveBeenCalled();
  });
});

describe("HU03 · PUT /api/products/:id", () => {
  beforeEach(() => sqlMock.mockReset());

  test("edición válida responde 200 con los datos guardados", async () => {
    sqlMock.mockResolvedValue([{ ...fila, ...cambios, price: "1099.00" }]);
    const res = await admin().put("/api/products/1").send(cambios);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 1, name: "Audífonos Pro", price: 1099 });
  });

  test("el UPDATE es parametrizado e incluye el id", async () => {
    sqlMock.mockResolvedValue([{ ...fila, ...cambios }]);
    await admin().put("/api/products/1").send(cambios);
    const [strings, ...values] = sqlMock.mock.calls[0];
    expect(strings.join("?")).toMatch(/UPDATE products/);
    expect(values).toEqual(["Audífonos Pro", 1099, "https://example.com/a2.jpg", 1]);
  });

  test("ID inexistente responde 404", async () => {
    sqlMock.mockResolvedValue([]);
    const res = await admin().put("/api/products/999").send(cambios);
    expect(res.status).toBe(404);
  });

  test("datos inválidos responden 400 y no se actualiza", async () => {
    const res = await admin().put("/api/products/1").send({ ...cambios, price: -1 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("price");
    expect(sqlMock).not.toHaveBeenCalled();
  });

  test("formulario incompleto responde 400 (PUT exige todos los campos)", async () => {
    const res = await admin().put("/api/products/1").send({ name: "Solo nombre" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(["image", "price"]);
  });

  test("ID con formato inválido responde 400", async () => {
    const res = await admin().put("/api/products/abc").send(cambios);
    expect(res.status).toBe(400);
  });

  test("si falla la base de datos responde 500", async () => {
    sqlMock.mockRejectedValue(new Error("timeout"));
    const res = await admin().put("/api/products/1").send(cambios);
    expect(res.status).toBe(500);
  });
});
