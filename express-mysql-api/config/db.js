const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir callbacks a promesas
const promisePool = pool.promise();

// Función para inicializar la base de datos y crear tablas si no existen
async function initDatabase() {
  try {
    // Crear base de datos si no existe
    await promisePool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    
    // Crear tabla de productos
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price FLOAT NOT NULL,
        stock INT NOT NULL DEFAULT 50,
        image VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de usuarios
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de items del carrito
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        productId INT NOT NULL,
        quantity INT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de órdenes
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        paymentMethod VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', 
        subscribeToNewsletter BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de items de orden
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId INT NOT NULL,
        productId INT NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla de direcciones de envío (NUEVA TABLA AÑADIDA)
    await promisePool.query(`
        CREATE TABLE IF NOT EXISTS shipping_addresses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          orderId INT NOT NULL,
          address VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          zipCode VARCHAR(10) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
        )
      `);
    
    await promisePool.query(`
        CREATE TABLE IF NOT EXISTS welcome_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `)
    console.log('Base de datos inicializada con éxito');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

module.exports = {
  pool: promisePool,
  initDatabase
};
