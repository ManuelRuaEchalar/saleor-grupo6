const app = require('./app');
const { initDatabase } = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// Inicializar la base de datos
initDatabase()
  .then(() => {
    // Iniciar el servidor una vez la base de datos esté lista
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al inicializar la aplicación:', err);
    process.exit(1);
  });