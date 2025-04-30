const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas para productos
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
// Nueva ruta: obtener productos por nombre
router.get('/name/:name', productController.getProductsByName);

module.exports = router;