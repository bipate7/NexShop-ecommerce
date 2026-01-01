const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const products = require("./data/products.json");

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const p = products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(p);
});

// Simple carts persistence helpers
const fs = require("fs");
const cartsPath = path.join(__dirname, "data", "carts.json");
function loadCarts() {
  try {
    if (!fs.existsSync(cartsPath))
      fs.writeFileSync(cartsPath, JSON.stringify({}), "utf8");
    const raw = fs.readFileSync(cartsPath, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error("Failed to load carts.json", e);
    return {};
  }
}
function saveCarts(obj) {
  fs.writeFileSync(cartsPath, JSON.stringify(obj, null, 2), "utf8");
}
function genId() {
  return "c" + Math.random().toString(36).slice(2, 10);
}

// Cart endpoints (simple file-backed store)
app.post("/api/cart", (req, res) => {
  // body may include initial items: { items: [ { id, title, qty } ] }
  const carts = loadCarts();
  const cartId = genId();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  carts[cartId] = items;
  saveCarts(carts);
  res.status(201).json({ cartId, items });
});

app.get("/api/cart/:cartId", (req, res) => {
  const carts = loadCarts();
  const cart = carts[req.params.cartId] || [];
  res.json({ cartId: req.params.cartId, items: cart });
});

app.post("/api/cart/:cartId/items", (req, res) => {
  const carts = loadCarts();
  const cartId = req.params.cartId;
  const item = req.body.item;
  if (!item) return res.status(400).json({ error: "Missing item in body" });
  carts[cartId] = carts[cartId] || [];
  carts[cartId].push(item);
  saveCarts(carts);
  res.status(201).json({ cartId, items: carts[cartId] });
});

app.put("/api/cart/:cartId", (req, res) => {
  const carts = loadCarts();
  const cartId = req.params.cartId;
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  carts[cartId] = items;
  saveCarts(carts);
  res.json({ cartId, items: carts[cartId] });
});

app.delete("/api/cart/:cartId/items/:index", (req, res) => {
  const carts = loadCarts();
  const cartId = req.params.cartId;
  const idx = Number(req.params.index);
  if (!carts[cartId]) return res.status(404).json({ error: "Cart not found" });
  if (Number.isNaN(idx) || idx < 0 || idx >= carts[cartId].length)
    return res.status(400).json({ error: "Invalid index" });
  carts[cartId].splice(idx, 1);
  saveCarts(carts);
  res.json({ cartId, items: carts[cartId] });
});

app.post("/api/cart/:cartId/clear", (req, res) => {
  const carts = loadCarts();
  const cartId = req.params.cartId;
  carts[cartId] = [];
  saveCarts(carts);
  res.json({ cartId, items: [] });
});

// Serve static frontend (optional)
app.use("/", express.static(path.join(__dirname, "../")));

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`NexShop API listening on http://localhost:${port}`)
  );
}
