// tests/orderController.test.js
const request = require('supertest');
const app = require('../app'); // Tu archivo Express principal
jest.mock('nodemailer');

describe('POST /api/orders', () => {
  it('debería crear una orden válida', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        userId: 1,
        total: 100,
        paymentMethod: 'creditCard',
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: {
          address: 'Calle Falsa 123',
          city: 'Ciudad Test',
          zipCode: '12345',
          phone: '78945612'
        }
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.order).toHaveProperty('id');
  });
});

afterAll(async () => {
  const { pool } = require('../config/db');
  await pool.end(); // Cierra la conexión de la base de datos
});
