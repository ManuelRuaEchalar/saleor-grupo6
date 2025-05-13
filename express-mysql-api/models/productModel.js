// Actualización del modelo de Producto para trabajar con etiquetas
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
      
      // Iniciar transacción
      await pool.query('START TRANSACTION');

      // Insertar el producto
      const [result] = await pool.query(
        'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
        [name, description, price, image]
      );
      
      const productId = result.insertId;
      
      // Si hay etiquetas, agregarlas al producto
      if (tags && Array.isArray(tags) && tags.length > 0) {
        // Preparar consulta para inserción de relaciones producto-etiqueta
        const values = tags.map(tagId => [productId, tagId]);
        await pool.query(
          'INSERT INTO product_tags (product_id, tag_id) VALUES ?',
          [values]
        );
      }
      
      // Confirmar transacción
      await pool.query('COMMIT');
      
      return { id: productId, ...product };
    } catch (error) {
      // Revertir transacción en caso de error
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  static async update(id, product) {
    try {
      const { name, description, price, image, tags } = product;
      
      // Iniciar transacción
      await pool.query('START TRANSACTION');
      
      // Actualizar producto
      await pool.query(
        'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
        [name, description, price, image, id]
      );
      
      // Si hay etiquetas definidas, actualizar relaciones
      if (tags !== undefined) {
        // Eliminar todas las relaciones existentes
        await pool.query('DELETE FROM product_tags WHERE product_id = ?', [id]);
        
        // Si hay etiquetas nuevas, agregarlas
        if (Array.isArray(tags) && tags.length > 0) {
          const values = tags.map(tagId => [id, tagId]);
          await pool.query(
            'INSERT INTO product_tags (product_id, tag_id) VALUES ?',
            [values]
          );
        }
      }
      
      // Confirmar transacción
      await pool.query('COMMIT');
      
      return { id, ...product };
    } catch (error) {
      // Revertir transacción en caso de error
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Las relaciones con etiquetas se eliminarán automáticamente por la restricción ON DELETE CASCADE
      await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar por nombre (case-insensitive)
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

  // Obtener todas las etiquetas de un producto
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