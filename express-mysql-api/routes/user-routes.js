const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

// Rutas para usuarios
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;