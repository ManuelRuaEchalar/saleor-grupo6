
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
      const { name, description, price, image, tags } = product;
      
      await pool.query('START TRANSACTION');

      const [result] = await pool.query(
        'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
        [name, description, price, image]
      );
      
      const productId = result.insertId;
      
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const values = tags.map(tagId => [productId, tagId]);
        await pool.query(
          'INSERT INTO product_tags (product_id, tag_id) VALUES ?',
          [values]
        );
      }
      
      await pool.query('COMMIT');
      
      return { id: productId, ...product };
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  static async update(id, product) {
    try {
      const { name, description, price, image, tags } = product;
      
      await pool.query('START TRANSACTION');
      
      await pool.query(
        'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
        [name, description, price, image, id]
      );
      
      if (tags !== undefined) {
        await pool.query('DELETE FROM product_tags WHERE product_id = ?', [id]);
        
        if (Array.isArray(tags) && tags.length > 0) {
          const values = tags.map(tagId => [id, tagId]);
          await pool.query(
            'INSERT INTO product_tags (product_id, tag_id) VALUES ?',
            [values]
          );
        }
      }
      
      await pool.query('COMMIT');
      
      return { id, ...product };
    } catch (error) {
      await pool.query('ROLLBACK');
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

  static async findByName(name) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?)`,
        [`%${name}%`]
      );
      return rows; // Returns array of products with partial match
    } catch (error) {
      throw error;
    }
  }

  static async getTags(productId) {
    try {
      const [rows] = await pool.query(
        `SELECT t.* FROM tags t
         INNER JOIN product_tags pt ON t.id = pt.tag_id
         WHERE pt.product_id = ?`,
        [productId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;