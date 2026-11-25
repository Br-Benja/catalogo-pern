# Catálogo de productos con PERN · Unidad 4

PostgreSQL (Neon) + Express + React (Vite) + Node.js, con login, roles y permisos.

**Aplicación publicada:** _se agrega al terminar el primer despliegue en Render_

## Estado
| Jornada | Historia | Estado |
|---|---|---|
| 1 | HU01 · Consultar catálogo | Liberada (`u4-j1`) |
| 2 | HU02 · Dar de alta | Liberada (`u4-j2`) |
| 3 | HU03 · Editar | Liberada (`u4-j3`) |
| 4 | HU04 · Eliminar | Liberada (`u4-j4`) |
| 5 | HU05 · Usar el catálogo publicado | En revisión |
| — | INV01 · Acceso por roles (login) | En revisión |

## Roles y permisos
| Acción | Visitante (sin sesión) | `usuario` | `admin` |
|---|---|---|---|
| Ver catálogo y producto (`GET`) | ✅ | ✅ | ✅ |
| Dar de alta (`POST`) | ❌ 401 | ❌ 403 | ✅ 201 |
| Editar (`PUT`) | ❌ 401 | ❌ 403 | ✅ 200 |
| Eliminar (`DELETE`) | ❌ 401 | ❌ 403 | ✅ 200 |

- La sesión es un JWT firmado guardado en una cookie `httpOnly` + `SameSite=Strict` (+ `Secure` en producción). React nunca ve el token.
- Contraseñas guardadas con bcrypt (costo 12). El login responde lo mismo si el correo no existe o la contraseña es incorrecta.
- Máximo 10 intentos de login cada 15 minutos por IP.
- Identidad y rol se comprueban en Express: `requireAuth` (401) y `requireRole("admin")` (403), en `backend/src/middleware/auth.js`.

## API
| Método y ruta | Acceso | Respuestas |
|---|---|---|
| `POST /api/auth/login` | público | 200 + cookie · 400 · 401 · 429 |
| `POST /api/auth/logout` | público | 200 (borra la cookie) |
| `GET /api/auth/me` | con sesión | 200 · 401 |
| `GET /api/products` | público | 200 con `data: Product[]` |
| `GET /api/products/:id` | público | 200 · 404 · 400 |
| `POST /api/products` | admin | 201 · 400 · 401 · 403 |
| `PUT /api/products/:id` | admin | 200 · 404 · 400 · 401 · 403 |
| `DELETE /api/products/:id` | admin | 200 · 404 · 400 · 401 · 403 |

**DTO de entrada de productos** (`backend/src/dto/productDto.js`, Zod). Otros campos se rechazan con 400:

| Campo | Regla |
|---|---|
| `name` | texto sin espacios extremos, 1 a 255 caracteres |
| `price` | número (o texto numérico) mayor que 0 |
| `image` | URL `http://` o `https://`, máximo 500 caracteres |

---

## Instrucciones reproducibles

### 1. Requisitos
- Node.js 20 o superior y Git
- Una cuenta gratuita en [Neon](https://neon.tech) (PostgreSQL)

### 2. Clonar e instalar
```bash
git clone https://github.com/Br-Benja/catalogo-pern.git
cd catalogo-pern
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Variables de entorno
```bash
cd backend
cp .env.example .env
```
Edita `backend/.env`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de Neon (botón **Connect** del proyecto) |
| `JWT_SECRET` | Cadena larga y aleatoria: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Cuenta de administrador que se creará (contraseña de 12+ caracteres) |
| `USER_EMAIL`, `USER_PASSWORD` | Cuenta de solo consulta (rol `usuario`) |
| `PORT` | Puerto de la API (3000) |
| `CLIENT_URL` | Origen de React en desarrollo (http://localhost:5173) |

> `backend/.env` está en `.gitignore`: nunca se sube al repositorio.

### 4. Preparar PostgreSQL
Desde `backend/`:
```bash
node db/run-sql.js db/schema.sql   # tabla products
node db/run-sql.js db/users.sql    # tabla users (roles)
node db/run-sql.js db/seed.sql     # dos productos ficticios
node db/seed-users.js              # crea las cuentas admin y usuario con bcrypt
```
Para probar el catálogo vacío: `node db/run-sql.js db/empty.sql`.

### 5. Ejecutar en local
```bash
cd backend && npm run dev      # API en http://localhost:3000
cd frontend && npm run dev     # React en http://localhost:5173
```
Abre http://localhost:5173, da clic en **Iniciar sesión** y entra con la cuenta de `ADMIN_EMAIL`.

### 6. Pruebas automatizadas
```bash
cd backend && npm test
```
62 pruebas con Jest y Supertest en `backend/tests/`: una suite por historia, más `auth.test.js` (login y sesión) y `permisos.test.js` (matriz 401 / 403 / 2xx). No necesitan internet ni base de datos.

### 7. Publicar en Render (HU05)
El repositorio incluye `render.yaml` (Blueprint). En producción Express sirve la API en `/api` y la compilación de React en el resto de rutas, así que es **un solo servicio** con una sola URL.

1. Entra a [render.com](https://render.com) con tu cuenta de GitHub.
2. **New → Blueprint** y elige el repositorio `catalogo-pern`.
3. Render lee `render.yaml` y pide el valor de `DATABASE_URL`: pega la cadena de Neon. `JWT_SECRET` lo genera Render.
4. **Apply**. Render ejecuta:
   - Build: `npm run build` (instala backend y frontend y compila React)
   - Start: `npm start` (arranca Express con `NODE_ENV=production`)
5. Cuando el estado sea **Live**, abre la URL `https://catalogo-pern-xxxx.onrender.com`.

La base de datos es la misma de Neon, así que las cuentas creadas en el paso 4 funcionan también en la versión publicada.

> En el plan gratuito el servicio se duerme tras 15 minutos sin uso; la primera visita después tarda unos 50 segundos en responder.

### Solución de problemas
| Síntoma | Causa probable |
|---|---|
| `JWT_SECRET es obligatorio en producción` | Falta la variable en Render |
| El login responde 429 | Más de 10 intentos en 15 minutos; espera |
| En local no se mantiene la sesión | Abre la app en http://localhost:5173 (no en :3000) para que el proxy de Vite envíe la cookie |
| Las imágenes no cargan | La URL de la imagen debe ser `https://` |
