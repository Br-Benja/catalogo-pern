import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const sqlMock = jest.fn();
jest.unstable_mockModule("../src/config/db.js", () => ({ sql: sqlMock }));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { cookieFor } = await import("./helpers.js");

// Las operaciones de escritura requieren sesión de administrador (INV01)
const admin = () => request.agent(app).set("Cookie", cookieFor("admin"));

const valido = { name: "  Teclado mecánico  ", price: 1299.9, image: "https://example.com/teclado.jpg" };

describe("HU02 · POST /api/products", () => {
  beforeEach(() => sqlMock.mockReset());

  test("alta válida responde 201 y devuelve el producto creado", async () => {
    sqlMock.mockResolvedValue([
      { id: 3, name: "Teclado mecánico", price: "1299.90", image: valido.image, created_at: "2026-11-24" },
    ]);
    const res = await admin().post("/api/products").send(valido);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ id: 3, name: "Teclado mecánico", price: 1299.9 });
  });

  test("usa consulta parametrizada y guarda el nombre sin espacios", async () => {
    sqlMock.mockResolvedValue([{ id: 3, name: "Teclado mecánico", price: "1299.90", image: valido.image }]);
    await admin().post("/api/products").send(valido);
    const [strings, name, price, image] = sqlMock.mock.calls[0];
    expect(strings.join("?")).toMatch(/INSERT INTO products/);
    expect([name, price, image]).toEqual(["Teclado mecánico", 1299.9, valido.image]);
  });

  test("acepta el precio como texto numérico", async () => {
    sqlMock.mockResolvedValue([{ id: 4, name: "Mouse", price: "250.00", image: valido.image }]);
    const res = await admin().post("/api/products").send({ ...valido, price: "250" });
    expect(res.status).toBe(201);
  });

  test.each([
    ["negativo", -10],
    ["cero", 0],
    ["texto", "abc"],
    ["vacío", ""],
    ["nulo", null],
  ])("precio %s responde 400 y no crea registro", async (_caso, price) => {
    const res = await admin().post("/api/products").send({ ...valido, price });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("price");
    expect(sqlMock).not.toHaveBeenCalled();
  });

  test("nombre con solo espacios responde 400", async () => {
    const res = await admin().post("/api/products").send({ ...valido, name: "    " });
    expect(res.status).toBe(400);
    expect(res.body.errors.name).toBe("El nombre no puede estar vacío");
    expect(sqlMock).not.toHaveBeenCalled();
  });

  test.each(["no-es-url", "ftp://example.com/a.jpg"])("imagen %s responde 400", async (image) => {
    const res = await admin().post("/api/products").send({ ...valido, image });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("image");
  });

  test("campos faltantes responden 400 con el detalle de cada uno", async () => {
    const res = await admin().post("/api/products").send({});
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(["image", "name", "price"]);
  });

  test("campos fuera del DTO responden 400", async () => {
    const res = await admin().post("/api/products").send({ ...valido, id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("id");
    expect(sqlMock).not.toHaveBeenCalled();
  });

  test("JSON mal formado responde 400", async () => {
    const res = await admin().post("/api/products")
      .set("Content-Type", "application/json")
      .send('{"name": "x",');
    expect(res.status).toBe(400);
  });

  test("si falla la base de datos responde 500", async () => {
    sqlMock.mockRejectedValue(new Error("conexión rechazada"));
    const res = await admin().post("/api/products").send(valido);
    expect(res.status).toBe(500);
  });
});
