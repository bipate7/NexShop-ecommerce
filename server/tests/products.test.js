const request = require("supertest");
const app = require("../index");

test("GET /api/products returns an array with expected fields", async () => {
  const res = await request(app).get("/api/products");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  if (res.body.length > 0) {
    const p = res.body[0];
    expect(p.id).toBeDefined();
    expect(p.title).toBeDefined();
    // product may use price or priceHTML; at least one should exist
    expect(p.price !== undefined || p.priceHTML).toBeTruthy();
  }
});
