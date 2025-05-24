const Product = require('../models/product-model');

exports.getAllProducts = async (req, res) => {
  try {
    const { minPrice, maxPrice, category } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    if (category) {
      query += ' AND category_id = ?';
      params.push(Number(category));
    }

    const [rows] = await require('../config/db').pool.query(query, params);

    const productsWithTags = await Promise.all(
      rows.map(async (product) => {
        const tags = await Product.getTags(product.id);
        return {
          ...product,
          price: Number(product.price) || 0,
          tags: tags || [],
        };
      })
    );

    res.status(200).json(productsWithTags);
  } catch (error) {
    console.error('Error al obtener productos con filtros:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const tags = await Product.getTags(req.params.id);
    
    res.status(200).json({
      ...product,
      price: Number(product.price) || 0,
      tags: tags || [],
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, tags } = req.body;
    
    const newProduct = await Product.create({
      name,
      description,
      price,
      image,
      tags // Array de IDs de etiquetas
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, tags } = req.body;
    
    // Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const updatedProduct = await Product.update(id, {
      name,
      description,
      price,
      image,
      tags // Array de IDs de etiquetas
    });
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await Product.delete(id);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};

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

    const productsWithTags = await Promise.all(
      products.map(async (product) => {
        const tags = await Product.getTags(product.id);
        return {
          ...product,
          price: Number(product.price) || 0,
          tags: tags || [],
        };
      })
    );

    res.json({
      success: true,
      products: productsWithTags
    });
  } catch (error) {
    console.error('Error en getProductsByName:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos por nombre'
    });
  }
};