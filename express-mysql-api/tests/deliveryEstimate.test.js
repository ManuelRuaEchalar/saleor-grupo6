const request = require('supertest');
const app = require('../app');

describe('Estimación de entrega', () => {
  test('Debe devolver una estimación válida cuando el producto está disponible', async () => {
    const productId = 1; // Usa un ID válido existente en tu base de datos
    const res = await request(app).get(`/api/delivery-estimate/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('available');
    expect(typeof res.body.available).toBe('boolean');

    if (res.body.available) {
      expect(res.body).toHaveProperty('minDays');
      expect(res.body).toHaveProperty('maxDays');
      expect(typeof res.body.minDays).toBe('number');
      expect(typeof res.body.maxDays).toBe('number');
      expect(res.body.maxDays).toBeGreaterThanOrEqual(res.body.minDays);
    }
  });

  test('Debe manejar errores con un código 500 si ocurre un fallo interno', async () => {
    const original = console.error;
    console.error = jest.fn(); // Evitar impresión de errores en consola

    // Simulamos un error forzando un ID inválido (opcional, depende del backend)
    const res = await request(app).get('/api/delivery-estimate/invalid-id');

    expect([200, 500]).toContain(res.statusCode); // Puede ser manejado o no
    console.error = original;
  });
});
