const Tag = require('../models/tagModel');
const Product = require('../models/productModel');

// Obtener todas las etiquetas
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({ message: 'Error al obtener etiquetas', error: error.message });
  }
};

// Obtener una etiqueta por ID
exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
    res.status(200).json(tag);
  } catch (error) {
    console.error('Error al obtener etiqueta:', error);
    res.status(500).json({ message: 'Error al obtener etiqueta', error: error.message });
  }
};

// Crear una nueva etiqueta
exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Verificar si la etiqueta ya existe
    const existingTag = await Tag.findByName(name);
    if (existingTag) {
      return res.status(400).json({ message: `La etiqueta "${name}" ya existe` });
    }

    const newTag = await Tag.create({ name });
    res.status(201).json(newTag);
  } catch (error) {
    console.error('Error al crear etiqueta:', error);
    res.status(500).json({ message: 'Error al crear etiqueta', error: error.message });
  }
};

// Actualizar una etiqueta
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Verificar si la etiqueta existe
    const existingTag = await Tag.findById(id);
    if (!existingTag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
    
    // Verificar si el nuevo nombre ya existe en otra etiqueta
    if (name !== existingTag.name) {
      const nameExists = await Tag.findByName(name);
      if (nameExists && nameExists.id !== parseInt(id)) {
        return res.status(400).json({ message: `Ya existe una etiqueta con el nombre "${name}"` });
      }
    }

    const updatedTag = await Tag.update(id, { name });
    res.status(200).json(updatedTag);
  } catch (error) {
    console.error('Error al actualizar etiqueta:', error);
    res.status(500).json({ message: 'Error al actualizar etiqueta', error: error.message });
  }
};

// Eliminar una etiqueta
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la etiqueta existe
    const existingTag = await Tag.findById(id);
    if (!existingTag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }

    await Tag.delete(id);
    res.status(200).json({ message: 'Etiqueta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar etiqueta:', error);
    res.status(500).json({ message: 'Error al eliminar etiqueta', error: error.message });
  }
};

// Obtener todos los productos con una etiqueta específica
exports.getProductsByTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la etiqueta existe
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }

    const products = await Tag.getTagProducts(id);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener productos por etiqueta:', error);
    res.status(500).json({ message: 'Error al obtener productos por etiqueta', error: error.message });
  }
};

// Obtener todas las etiquetas de un producto
exports.getTagsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Verificar si el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const tags = await Tag.getProductTags(productId);
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error al obtener etiquetas del producto:', error);
    res.status(500).json({ message: 'Error al obtener etiquetas del producto', error: error.message });
  }
};

// Añadir una etiqueta a un producto
exports.addTagToProduct = async (req, res) => {
  try {
    const { productId, tagId } = req.params;
    
    // Verificar si el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Verificar si la etiqueta existe
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }

    await Tag.addTagToProduct(tagId, productId);
    res.status(200).json({ message: 'Etiqueta añadida al producto correctamente' });
  } catch (error) {
    console.error('Error al añadir etiqueta al producto:', error);
    res.status(500).json({ message: 'Error al añadir etiqueta al producto', error: error.message });
  }
};

// Eliminar una etiqueta de un producto
exports.removeTagFromProduct = async (req, res) => {
  try {
    const { productId, tagId } = req.params;
    
    // Verificar si el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Verificar si la etiqueta existe
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }

    await Tag.removeTagFromProduct(tagId, productId);
    res.status(200).json({ message: 'Etiqueta eliminada del producto correctamente' });
  } catch (error) {
    console.error('Error al eliminar etiqueta del producto:', error);
    res.status(500).json({ message: 'Error al eliminar etiqueta del producto', error: error.message });
  }
};