const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Rutas para etiquetas
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.post('/', tagController.createTag);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

// Rutas para la relación entre productos y etiquetas
router.get('/:id/products', tagController.getProductsByTag);
router.get('/product/:productId', tagController.getTagsByProduct);
router.post('/product/:productId/tag/:tagId', tagController.addTagToProduct);
router.delete('/product/:productId/tag/:tagId', tagController.removeTagFromProduct);

module.exports = router;