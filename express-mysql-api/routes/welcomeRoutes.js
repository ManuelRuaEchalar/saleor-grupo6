const express = require('express');
const router = express.Router();
const { getWelcomeMessage, setWelcomeMessage } = require('../controllers/welcomeController');

router.get('/', getWelcomeMessage);
router.post('/', setWelcomeMessage); // protegelo si solo el admin puede usarlo

module.exports = router;
