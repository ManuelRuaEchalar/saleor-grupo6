const Product = require('../models/productModel');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

// Obtener productos cuyo nombre coincide exacto (case-insensitive)
exports.getProductsByName = async (req, res) => {
    try {
      const { name } = req.params;
      const products = await Product.findByName(name);
  
      if (!products || products.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No se encontraron productos con nombre "${name}"`
        });
      }
  
      res.json({
        success: true,
        products
      });
    } catch (error) {
      console.error('Error en getProductsByName:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar productos por nombre'
      });
    }
  };
  