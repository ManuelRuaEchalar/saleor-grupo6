const CartItem = require('../models/cart-item-model');

// Obtener todos los items del carrito de un usuario
exports.getCartItems = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await CartItem.findByUserId(userId);
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error al obtener items del carrito:', error);
    res.status(500).json({ message: 'Error al obtener items del carrito', error: error.message });
  }
};

// Añadir un item al carrito
exports.addCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ message: 'Se requieren userId y productId' });
    }
    
    const newCartItem = await CartItem.create({
      userId,
      productId,
      quantity: quantity || 1
    });
    
    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Error al añadir item al carrito:', error);
    res.status(500).json({ message: 'Error al añadir item al carrito', error: error.message });
  }
};

// Actualizar un item del carrito
exports.updateCartItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;
    
    if (!quantity) {
      return res.status(400).json({ message: 'Se requiere quantity' });
    }
    
    const cartItem = await CartItem.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Item del carrito no encontrado' });
    }
    
    const updatedCartItem = await CartItem.update(id, { quantity });
    res.status(200).json(updatedCartItem);
  } catch (error) {
    console.error('Error al actualizar item del carrito:', error);
    res.status(500).json({ message: 'Error al actualizar item del carrito', error: error.message });
  }
};

// Eliminar un item del carrito
exports.deleteCartItem = async (req, res) => {
  try {
    const id = req.params.id;
    
    const cartItem = await CartItem.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Item del carrito no encontrado' });
    }
    
    await CartItem.delete(id);
    res.status(200).json({ message: 'Item eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar item del carrito:', error);
    res.status(500).json({ message: 'Error al eliminar item del carrito', error: error.message });
  }
};

// Limpiar todos los items del carrito de un usuario
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const deletedCount = await CartItem.deleteByUserId(userId);
    res.status(200).json({ message: `Se eliminaron ${deletedCount} items del carrito` });
  } catch (error) {
    console.error('Error al limpiar el carrito:', error);
    res.status(500).json({ message: 'Error al limpiar el carrito', error: error.message });
  }
};
