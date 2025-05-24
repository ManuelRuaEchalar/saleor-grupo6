const express = require('express');
const router = express.Router();
const { getWelcomeMessage, setWelcomeMessage } = require('../controllers/welcome-controller');

router.get('/', getWelcomeMessage);
router.post('/', setWelcomeMessage); 

module.exports = router;
