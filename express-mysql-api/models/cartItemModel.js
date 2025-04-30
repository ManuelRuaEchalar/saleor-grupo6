const { pool } = require('../config/db');

class CartItem {
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.query(`
        SELECT ci.*, p.name, p.price, p.image 
        FROM cart_items ci
        JOIN products p ON ci.productId = p.id
        WHERE ci.userId = ?
      `, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT ci.*, p.name, p.price, p.image 
        FROM cart_items ci
        JOIN products p ON ci.productId = p.id
        WHERE ci.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(cartItem) {
    try {
      const { userId, productId, quantity } = cartItem;
      
      // Verificar si ya existe un item con el mismo producto y usuario
      const [existingItems] = await pool.query(
        'SELECT * FROM cart_items WHERE userId = ? AND productId = ?',
        [userId, productId]
      );
      
      if (existingItems.length > 0) {
        // Actualizar cantidad en lugar de crear nuevo item
        const newQuantity = existingItems[0].quantity + (quantity || 1);
        await pool.query(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, existingItems[0].id]
        );
        return { ...existingItems[0], quantity: newQuantity };
      }
      
      // Crear nuevo item
      const [result] = await pool.query(
        'INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity || 1]
      );
      
      return { 
        id: result.insertId, 
        userId,
        productId,
        quantity: quantity || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, cartItem) {
    try {
      const { quantity } = cartItem;
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [quantity, id]
      );
      
      return { id, ...cartItem };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM cart_items WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CartItem;