const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL env var");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

app.get("/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok;");
    res.json({ status: "ok", db: r.rows[0].ok });
  } catch (e) {
    res.status(500).json({ status: "error", error: String(e) });
  }
});

app.post("/products", async (req, res) => {
  const { name, price_cents } = req.body || {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name must be a non-empty string" });
  }
  if (!Number.isInteger(price_cents) || price_cents < 0) {
    return res.status(400).json({ error: "price_cents must be an integer >= 0" });
  }

  const r = await pool.query(
    "INSERT INTO products (name, price_cents) VALUES ($1, $2) RETURNING id, name, price_cents, created_at",
    [name.trim(), price_cents]
  );

  res.status(201).json(r.rows[0]);
});

app.get("/products", async (_req, res) => {
  const r = await pool.query(
    "SELECT id, name, price_cents, created_at FROM products ORDER BY id DESC LIMIT 50;"
  );
  res.json({ items: r.rows });
});

init()
  .then(() => {
    app.listen(port, () => console.log(`API listening on :${port}`));
  })
  .catch((e) => {
    console.error("Init failed:", e);
    process.exit(1);
  });

