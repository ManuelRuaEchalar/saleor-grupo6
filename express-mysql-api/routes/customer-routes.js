const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer-controller');

// Obtener todos los clientes
router.get('/', customerController.getCustomers);

// Crear un nuevo cliente
router.post('/', customerController.createCustomer);

// Exportar clientes a CSV
router.get('/export/csv', customerController.exportCustomersCSV);

// Obtener un cliente por ID
router.get('/:id', customerController.getCustomerById);

// Actualizar un cliente
router.put('/:id', customerController.updateCustomer);

// Eliminar un cliente
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;