const { pool } = require('../config/db');

class Tag {
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM tags');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM tags WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM tags WHERE LOWER(name) = LOWER(?)',
        [name]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(tag) {
    try {
      const { name } = tag;
      const [result] = await pool.query(
        'INSERT INTO tags (name) VALUES (?)',
        [name]
      );
      return { id: result.insertId, ...tag };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, tag) {
    try {
      const { name } = tag;
      await pool.query(
        'UPDATE tags SET name = ? WHERE id = ?',
        [name, id]
      );
      
      return { id, ...tag };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM tags WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Métodos para la relación muchos a muchos
  static async getProductTags(productId) {
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

  static async getTagProducts(tagId) {
    try {
      const [rows] = await pool.query(
        `SELECT p.* FROM products p
         INNER JOIN product_tags pt ON p.id = pt.product_id
         WHERE pt.tag_id = ?`,
        [tagId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async addTagToProduct(tagId, productId) {
    try {
      const [result] = await pool.query(
        'INSERT INTO product_tags (tag_id, product_id) VALUES (?, ?)',
        [tagId, productId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      // Si el error es de duplicado, no lo consideramos un error real
      if (error.code === 'ER_DUP_ENTRY') {
        return true; // La relación ya existía
      }
      throw error;
    }
  }

  static async removeTagFromProduct(tagId, productId) {
    try {
      await pool.query(
        'DELETE FROM product_tags WHERE tag_id = ? AND product_id = ?',
        [tagId, productId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Tag;