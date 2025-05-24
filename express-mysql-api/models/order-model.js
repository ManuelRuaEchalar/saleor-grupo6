const { pool } = require('../config/db');

class Order {
  static async create(order) {
    const { userId, total, paymentMethod, items, shippingAddress, subscribeToNewsletter } = order;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insertar la orden
      const [orderResult] = await connection.query(
        'INSERT INTO orders (userId, total, paymentMethod, status, subscribeToNewsletter) VALUES (?, ?, ?, ?, ?)',
        [userId, total, paymentMethod, 'pending', subscribeToNewsletter || false]
      );

      const orderId = orderResult.insertId;

      // Insertar los items de la orden
      for (const item of items) {
        const { productId, quantity } = item;
        await connection.query(
          'INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)',
          [orderId, productId, quantity]
        );
        
        // Actualizar el inventario (reducir stock)
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [quantity, productId]
        );
      }

      // Insertar la dirección de envío si existe
      if (shippingAddress) {
        const { address, city, zipCode, phone } = shippingAddress;
        await connection.query(
          'INSERT INTO shipping_addresses (orderId, address, city, zipCode, phone) VALUES (?, ?, ?, ?, ?)',
          [orderId, address, city, zipCode, phone]
        );
      }

      // Limpiar carrito del usuario después de crear la orden
      await connection.query(
        'DELETE FROM cart_items WHERE userId = ?',
        [userId]
      );

      await connection.commit();
      
      // Retornar la orden con su ID
      return { 
        id: orderId, 
        userId,
        total,
        paymentMethod,
        status: 'pending',
        items,
        shippingAddress,
        createdAt: new Date()
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAllByUser(userId) {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    // Para cada orden, obtener sus items
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name, p.price, p.image 
         FROM order_items oi 
         JOIN products p ON oi.productId = p.id 
         WHERE oi.orderId = ?`,
        [order.id]
      );
      
      order.items = items;
      
      // Obtener dirección de envío
      const [addresses] = await pool.query(
        'SELECT * FROM shipping_addresses WHERE orderId = ?',
        [order.id]
      );
      
      if (addresses.length > 0) {
        order.shippingAddress = addresses[0];
      }
    }
    
    return orders;
  }
  
  static async findById(orderId) {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return null;
    }
    
    const order = orders[0];
    
    // Obtener items de la orden
    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.price, p.image 
       FROM order_items oi 
       JOIN products p ON oi.productId = p.id 
       WHERE oi.orderId = ?`,
      [orderId]
    );
    
    order.items = items;
    
    // Obtener dirección de envío
    const [addresses] = await pool.query(
      'SELECT * FROM shipping_addresses WHERE orderId = ?',
      [orderId]
    );
    
    if (addresses.length > 0) {
      order.shippingAddress = addresses[0];
    }
    
    return order;
  }
  
  static async updateStatus(orderId, status) {
    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    
    return { id: orderId, status };
  }
}

module.exports = Order;