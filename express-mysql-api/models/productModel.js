const { pool } = require('../config/db');

class Product {
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM products');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(product) {
    try {
      const { name, description, price, image } = product;
      const [result] = await pool.query(
        'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
        [name, description, price, image]
      );
      return { id: result.insertId, ...product };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, product) {
    try {
      const { name, description, price, image } = product;
      await pool.query(
        'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
        [name, description, price, image, id]
      );
      
      return { id, ...product };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Nuevo método para buscar por nombre (case-insensitive)
  static async findByName(name) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM products WHERE LOWER(name) = LOWER(?)`,
        [name]
      );
      return rows; // Devuelve arreglo de productos que coinciden
    } catch (error) {
      throw error;
    }
  }
}



module.exports = Product;