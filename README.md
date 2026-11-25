# Catálogo de productos con PERN · Unidad 4

PostgreSQL (Neon) + Express + React (Vite) + Node.js.

## Estado
| Jornada | Historia | Estado |
|---|---|---|
| 1 | HU01 · Consultar catálogo | Liberada (`u4-j1`) |
| 2 | HU02 · Dar de alta | Liberada (`u4-j2`) |
| 3 | HU03 · Editar | Liberada (`u4-j3`) |
| 4 | HU04 · Eliminar | Liberada (`u4-j4`) |

## API
| Método y ruta | Historia | Respuestas |
|---|---|---|
| `GET /api/products` | HU01 | 200 con `data: Product[]` (vacío = `[]`) |
| `POST /api/products` | HU02 | 201 creado · 400 datos inválidos |
| `GET /api/products/:id` | HU03 | 200 · 404 no existe · 400 id inválido |
| `PUT /api/products/:id` | HU03 | 200 · 404 no existe · 400 datos o id inválidos |
| `DELETE /api/products/:id` | HU04 | 200 · 404 no existe · 400 id inválido |

**DTO de entrada** (`backend/src/dto/productDto.js`, validado con Zod). Cualquier otro campo se rechaza con 400:

| Campo | Regla |
|---|---|
| `name` | texto, se quitan espacios al inicio y al final, 1 a 255 caracteres |
| `price` | número (o texto numérico) mayor que 0 |
| `image` | URL `http://` o `https://`, máximo 500 caracteres |

Los errores de validación responden `400 { success: false, message: "Datos inválidos", errors: { campo: "mensaje" } }`.

## Requisitos
- Node.js 20 o superior
- Una base de datos en [Neon](https://neon.tech)

## Preparar PostgreSQL
En el SQL Editor de Neon ejecuta, en orden:
1. `backend/db/schema.sql` (crea la tabla `products`)
2. `backend/db/seed.sql` (dos productos ficticios)

Para probar el estado vacío: `backend/db/empty.sql`.

También se pueden ejecutar desde la terminal, una vez configurado `backend/.env`:
```
cd backend
node db/run-sql.js db/schema.sql
node db/run-sql.js db/seed.sql
```

## Variables de entorno
```
cd backend
cp .env.example .env   # y pon tu DATABASE_URL de Neon
```
| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (3000) |
| `DATABASE_URL` | Cadena de conexión de Neon |
| `CLIENT_URL` | Origen permitido por CORS (http://localhost:5173) |

## Arranque
```
cd backend && npm install && npm run dev     # API en http://localhost:3000
cd frontend && npm install && npm run dev    # React en http://localhost:5173
```

## Pruebas
```
cd backend && npm test
```
37 pruebas con Jest y Supertest (`backend/tests/`), una suite por historia. La conexión a Neon se sustituye por un doble de prueba, así que no necesitan internet ni base de datos.
