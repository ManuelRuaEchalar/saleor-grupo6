// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order-controller');

// Rutas para órdenes
router.post('/', orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;