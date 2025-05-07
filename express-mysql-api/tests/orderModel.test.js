// tests/orderModel.test.js
const Order = require('../models/orderModel');
const { pool } = require('../config/db');

// Mock de conexión a la base de datos
jest.mock('../config/db', () => {
  const mockPool = {
    getConnection: jest.fn(() => Promise.resolve({
      beginTransaction: jest.fn(),
      query: jest.fn()
        .mockResolvedValueOnce([{ insertId: 1 }]) // Orden creada
        .mockResolvedValue([]), // Otros queries
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    }))
  };
  return { pool: mockPool };
});

describe('Order.create', () => {
  it('debería crear una orden correctamente', async () => {
    const fakeOrder = {
      userId: 1,
      total: 99.99,
      paymentMethod: 'creditCard',
      items: [{ productId: 1, quantity: 2 }],
      shippingAddress: {
        address: 'Calle Falsa 123',
        city: 'Barcelona',
        zipCode: '08001',
        phone: '123456789'
      }
    };

    const result = await Order.create(fakeOrder);

    expect(result).toHaveProperty('id');
    expect(result.userId).toBe(fakeOrder.userId);
    expect(result.total).toBe(fakeOrder.total);
  });
});
