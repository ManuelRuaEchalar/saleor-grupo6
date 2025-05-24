const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const productRoutes = require('./routes/product-routes');
const userRoutes = require('./routes/user-routes');
const cartItemRoutes = require('./routes/cart-item-routes');
const orderRoutes = require('./routes/order-routes');
const tagRoutes = require('./routes/tag-routes');
const welcomeRoutes = require('./routes/welcome-routes');
const customerRoutes = require('./routes/customer-routes'); 
const deliveryEstimateRoutes = require('./routes/delivery-estimate-routes');
// Crear aplicación Express
const app = express();

// Middleware para procesar JSON
app.use(express.json());
// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar rutas
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/welcome', welcomeRoutes);
app.use('/api/customers', customerRoutes); 
app.use('/api/delivery-estimate', deliveryEstimateRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API REST con Express y MySQL funcionando correctamente' });
});

module.exports = app;