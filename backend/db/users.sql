-- Usuarios y roles (INV01)
-- admin   → consulta, crea, edita y elimina productos
-- usuario → solo consulta (sirve para comprobar el 403)
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,                 -- bcrypt, nunca la contraseña en texto plano
  role           VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                 CHECK (role IN ('admin', 'usuario')),
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
