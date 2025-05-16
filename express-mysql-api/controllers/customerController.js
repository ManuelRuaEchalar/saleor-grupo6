const Customer = require('../models/customer');

// Obtener todos los clientes
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    console.log('Clientes obtenidos de la BD:', customers);
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Obtener un cliente por ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Crear un nuevo cliente
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, notes, customer_type } = req.body;
    
    // Validar datos del cliente
    if (!name) {
      return res.status(400).json({ error: 'El nombre del cliente es requerido' });
    }
    
    // Verificar si ya existe un cliente con ese email (si se proporciona)
    if (email) {
      const existingCustomer = await Customer.findByEmail(email);
      if (existingCustomer) {
        return res.status(400).json({ error: 'Ya existe un cliente con ese email' });
      }
    }
    
    // Crear el cliente
    const newCustomer = await Customer.create({
      name,
      email,
      phone,
      notes,
      customer_type
    });
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente: ' + error.message });
  }
};

// Actualizar un cliente
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, notes, customer_type } = req.body;
    const id = req.params.id;
    
    // Verificar si el cliente existe
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Si se cambia el email, verificar que no exista otro cliente con ese email
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findByEmail(email);
      if (existingCustomer && existingCustomer.id !== parseInt(id)) {
        return res.status(400).json({ error: 'Ya existe un cliente con ese email' });
      }
    }
    
    const updatedCustomer = await Customer.update(id, { 
      name, 
      email, 
      phone, 
      notes, 
      customer_type 
    });
    
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente: ' + error.message });
  }
};

// Eliminar un cliente
exports.deleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Verificar si el cliente existe
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    await Customer.delete(id);
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente: ' + error.message });
  }
};

// Exportar clientes a CSV
exports.exportCustomersCSV = async (req, res) => {
  try {
    const customers = await Customer.exportToCSV();
    
    // Verificar si hay clientes
    if (!customers || customers.length === 0) {
      return res.status(404).json({ error: 'No hay clientes para exportar' });
    }
    
    console.log('Datos para CSV:', customers);
    
    // Definir cabeceras CSV en español
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Tipo de Cliente', 'Notas'];
    const fields = ['id', 'name', 'email', 'phone', 'customer_type', 'notes'];
    
    // Usar punto y coma como separador para mejor compatibilidad con Excel español
    let csvContent = '\ufeff'; // BOM para UTF-8
    csvContent += headers.join(';') + '\r\n';
    
    customers.forEach(customer => {
      const values = fields.map(field => {
        // Obtener el valor o un string vacío si es null/undefined
        let value = customer[field] !== null && customer[field] !== undefined ? customer[field] : '';
        
        // Escapar comillas y envolver en comillas dobles
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      
      csvContent += values.join(';') + '\r\n';
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="clientes_${new Date().toISOString().slice(0, 10)}.csv"`);
    
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error al exportar clientes a CSV:', error);
    res.status(500).json({ error: 'Error al exportar clientes a CSV' });
  }
};