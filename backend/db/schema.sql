-- Esquema del catálogo (HU01)
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL CHECK (length(trim(name)) > 0),
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  image       VARCHAR(500)   NOT NULL,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);
