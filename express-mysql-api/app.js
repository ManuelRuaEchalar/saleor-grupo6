const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const welcomeRoutes = require('./routes/welcomeRoutes');
// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar rutas
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/welcome', welcomeRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API REST con Express y MySQL funcionando correctamente' });
});

module.exports = app;