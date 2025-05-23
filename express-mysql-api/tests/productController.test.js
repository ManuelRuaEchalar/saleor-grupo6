const productController = require('../controllers/productController');
const db = require('../config/db');
const Product = require('../models/productModel');

// Mock de la conexión y del modelo
jest.mock('../config/db', () => ({
  pool: { query: jest.fn() }
}));
jest.mock('../models/productModel');

describe('getAllProducts', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('debería devolver todos los productos sin filtros', async () => {
    const filasFalsas = [{ id: 1, name: 'Producto A', price: '10.50' }];
    db.pool.query.mockResolvedValue([filasFalsas]);
    Product.getTags.mockResolvedValue(['etiqueta1', 'etiqueta2']);

    await productController.getAllProducts(req, res);

    expect(db.pool.query).toHaveBeenCalledWith(
      'SELECT * FROM products WHERE 1=1',
      []
    );
    expect(Product.getTags).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, name: 'Producto A', price: 10.5, tags: ['etiqueta1', 'etiqueta2'] }
    ]);
  });

  it('debería aplicar los filtros de precio a la consulta', async () => {
    req.query = { minPrice: '5', maxPrice: '20' };
    const filasFalsas = [{ id: 2, name: 'Producto B', price: '15' }];
    db.pool.query.mockResolvedValue([filasFalsas]);
    Product.getTags.mockResolvedValue([]);

    await productController.getAllProducts(req, res);

    expect(db.pool.query).toHaveBeenCalledWith(
      'SELECT * FROM products WHERE 1=1 AND price >= ? AND price <= ?',
      [5, 20]
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('debería manejar errores de la base de datos correctamente', async () => {
    db.pool.query.mockRejectedValue(new Error('Fallo en la BD'));

    await productController.getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error al obtener productos' })
    );
  });
});
