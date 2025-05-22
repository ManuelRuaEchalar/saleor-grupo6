const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItemController');

// Rutas para items del carrito
router.get('/user/:userId', cartItemController.getCartItems);
router.post('/', cartItemController.addCartItem);
router.put('/:id', cartItemController.updateCartItem);
router.delete('/:id', cartItemController.deleteCartItem);
router.delete('/clear/:userId', cartItemController.clearCart);

module.exports = router;