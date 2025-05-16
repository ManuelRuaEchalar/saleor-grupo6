const { pool } = require('../config/db');

class Customer {
  static async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT id, name, email, phone, customer_type, notes, createdAt, updatedAt
        FROM customers
        ORDER BY id DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT id, name, email, phone, customer_type, notes, createdAt, updatedAt
        FROM customers
        WHERE id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(`
        SELECT id, name, email, phone, customer_type, notes, createdAt, updatedAt
        FROM customers
        WHERE email = ?
      `, [email]);
      return rows[0];
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }

  static async create(customerData) {
    try {
      const { name, email, phone, notes, customer_type } = customerData;
      
      // Verificar que el nombre es obligatorio
      if (!name) {
        throw new Error('El nombre del cliente es obligatorio');
      }
      
      const [result] = await pool.query(
        'INSERT INTO customers (name, email, phone, notes, customer_type) VALUES (?, ?, ?, ?, ?)',
        [name, email || null, phone || null, notes || null, customer_type || 'regular']
      );
      
      return { 
        id: result.insertId, 
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        customer_type: customer_type || 'regular',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async update(id, customerData) {
    try {
      const { name, email, phone, notes, customer_type } = customerData;
      
      // Verificar que hay datos para actualizar
      if (!name && email === undefined && phone === undefined && notes === undefined && customer_type === undefined) {
        throw new Error('No hay datos para actualizar');
      }
      
      // Construir query dinámicamente
      let updateFields = [];
      let values = [];
      
      if (name) {
        updateFields.push('name = ?');
        values.push(name);
      }
      
      if (email !== undefined) {
        updateFields.push('email = ?');
        values.push(email);
      }
      
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        values.push(phone);
      }
      
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        values.push(notes);
      }
      
      if (customer_type) {
        updateFields.push('customer_type = ?');
        values.push(customer_type);
      }
      
      // Añadir timestamp de actualización
      updateFields.push('updatedAt = NOW()');
      
      // Añadir ID al final para la condición WHERE
      values.push(id);
      
      const query = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await pool.query(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Cliente no encontrado');
      }
      
      // Obtener el cliente actualizado
      return this.findById(id);
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Cliente no encontrado');
      }
      
      return { id };
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  static async exportToCSV() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          id, 
          name, 
          email, 
          phone, 
          CASE 
            WHEN customer_type = 'regular' THEN 'Regular'
            WHEN customer_type = 'premium' THEN 'Premium'
            WHEN customer_type = 'wholesale' THEN 'Mayorista'
            ELSE customer_type
          END AS customer_type,
          notes
        FROM customers
        ORDER BY id
      `);
      return rows;
    } catch (error) {
      console.error('Error en exportToCSV:', error);
      throw error;
    }
  }

  static async getCount() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM customers');
      return rows[0].count;
    } catch (error) {
      console.error('Error en getCount:', error);
      throw error;
    }
  }
}

module.exports = Customer;