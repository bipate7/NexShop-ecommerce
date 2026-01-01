const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

const cartsPath = path.join(__dirname, '..', 'data', 'carts.json');

beforeEach(() => {
  // reset carts.json to empty
  fs.writeFileSync(cartsPath, JSON.stringify({}), 'utf8');
});

afterAll(() => {
  // cleanup
  fs.writeFileSync(cartsPath, JSON.stringify({}), 'utf8');
});

test('create cart, add item, fetch and delete item', async () => {
  // create cart with initial items
  const createRes = await request(app).post('/api/cart').send({ items: [{ id: 'p1', title: 'Test', qty: 1 }] });
  expect(createRes.status).toBe(201);
  expect(createRes.body.cartId).toBeDefined();
  const cartId = createRes.body.cartId;

  // fetch cart
  const getRes = await request(app).get(`/api/cart/${cartId}`);
  expect(getRes.status).toBe(200);
  expect(Array.isArray(getRes.body.items)).toBe(true);
  expect(getRes.body.items.length).toBe(1);

  // add another item
  const addRes = await request(app).post(`/api/cart/${cartId}/items`).send({ item: { id: 'p2', title: 'Another', qty: 2 } });
  expect(addRes.status).toBe(201);
  expect(addRes.body.items.length).toBe(2);

  // delete first item
  const delRes = await request(app).delete(`/api/cart/${cartId}/items/0`);
  expect(delRes.status).toBe(200);
  expect(delRes.body.items.length).toBe(1);

  // replace cart
  const putRes = await request(app).put(`/api/cart/${cartId}`).send({ items: [] });
  expect(putRes.status).toBe(200);
  expect(Array.isArray(putRes.body.items)).toBe(true);
  expect(putRes.body.items.length).toBe(0);
});

test('clear cart endpoint', async () => {
  const createRes = await request(app).post('/api/cart').send({ items: [{ id: 'p1', title: 'Test', qty: 1 }] });
  const cartId = createRes.body.cartId;
  const clearRes = await request(app).post(`/api/cart/${cartId}/clear`);
  expect(clearRes.status).toBe(200);
  expect(Array.isArray(clearRes.body.items)).toBe(true);
  expect(clearRes.body.items.length).toBe(0);
});