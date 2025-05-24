exports.getEstimate = async (req, res) => {
  const { productId } = req.params;

  try {
    
    const stockAvailable = true;

    if (!stockAvailable) {
      return res.status(200).json({ available: false });
    }

    const minDays = Math.floor(Math.random() * 3) + 2; // 2 a 4 días
    const maxDays = minDays + 2;

    res.status(200).json({
      minDays,
      maxDays,
      available: true
    });
  } catch (error) {
    console.error('Error al calcular estimación de entrega:', error);
    res.status(500).json({ message: 'Error al calcular estimación de entrega' });
  }
};
