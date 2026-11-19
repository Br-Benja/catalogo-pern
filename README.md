# Catálogo de productos con PERN · Unidad 4

PostgreSQL (Neon) + Express + React (Vite) + Node.js.

## Estado
| Jornada | Historia | Estado |
|---|---|---|
| 1 | HU01 · Consultar catálogo (`GET /api/products`) | Implementada |

## Requisitos
- Node.js 20 o superior
- Una base de datos en [Neon](https://neon.tech)

## Preparar PostgreSQL
En el SQL Editor de Neon ejecuta, en orden:
1. `backend/db/schema.sql` (crea la tabla `products`)
2. `backend/db/seed.sql` (dos productos ficticios)

Para probar el estado vacío: `backend/db/empty.sql`.

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
