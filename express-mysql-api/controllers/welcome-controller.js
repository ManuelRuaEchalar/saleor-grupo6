const { pool } = require('../config/db');

exports.getWelcomeMessage = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT message FROM welcome_messages ORDER BY createdAt DESC LIMIT 1');
    const message = rows.length > 0 ? rows[0].message : '¡Bienvenido a nuestra tienda!';
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el mensaje de bienvenida' });
  }
};

exports.setWelcomeMessage = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Mensaje es requerido' });

  try {
    await pool.query('INSERT INTO welcome_messages (message) VALUES (?)', [message]);
    res.json({ message: 'Mensaje guardado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar el mensaje' });
  }
};
