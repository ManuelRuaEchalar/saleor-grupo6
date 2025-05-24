const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery-controller');

router.get('/:productId', deliveryController.getEstimate);

module.exports = router;
