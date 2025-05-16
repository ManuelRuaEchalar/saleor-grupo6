// tests/tagProduct.test.js
const request = require('supertest');
const app = require('../app'); // Asegúrate de que el path sea correcto
const { pool } = require('../config/db');

let testTagId;
let testProductId;

describe('Gestión de etiquetas y su asociación con productos', () => {
  beforeAll(async () => {
    // Crear un producto de prueba
    const [result] = await pool.query(`
      INSERT INTO products (name, description, price, stock, image)
      VALUES (?, ?, ?, ?, ?)`,
      ['Producto Test', 'Producto de prueba para testing', 19.99, 10, 'https://test.image/url.jpg']
    );
    testProductId = result.insertId;
  });

  afterAll(async () => {
    // Limpiar la base de datos
    if (testTagId) {
      await pool.query(`DELETE FROM tags WHERE id = ?`, [testTagId]);
    }
    if (testProductId) {
      await pool.query(`DELETE FROM products WHERE id = ?`, [testProductId]);
    }
    await pool.query(`DELETE FROM product_tags WHERE product_id = ?`, [testProductId]);
    await pool.end();
  });

  test('Debe crear una nueva etiqueta', async () => {
    const res = await request(app).post('/api/tags').send({
      name: 'Etiqueta Test'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Etiqueta Test');
    testTagId = res.body.id;
  });

  test('Debe asociar la etiqueta al producto', async () => {
    const res = await request(app).post(`/api/tags/product/${testProductId}/tag/${testTagId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Etiqueta añadida al producto correctamente');
  });

  test('Debe obtener etiquetas asociadas al producto', async () => {
    const res = await request(app).get(`/api/tags/product/${testProductId}`);
    expect(res.statusCode).toBe(200);
    const tagNames = res.body.map(tag => tag.name);
    expect(tagNames).toContain('Etiqueta Test');
  });

  test('Debe eliminar la etiqueta del producto', async () => {
    const res = await request(app).delete(`/api/tags/product/${testProductId}/tag/${testTagId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Etiqueta eliminada del producto correctamente');
  });
});
