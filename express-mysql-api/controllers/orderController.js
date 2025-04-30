// orderController.js
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const nodemailer = require('nodemailer');

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Crear una nueva orden
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Validación de datos básicos
    if (!orderData.userId || !orderData.total || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Datos incompletos. Se requiere userId, total y al menos un item' 
      });
    }

    // Validación de items
    const invalidItems = orderData.items.filter(item => !item.productId || !item.quantity);
    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Items inválidos',
        errors: invalidItems.map((item, index) => `Item ${index + 1}: ${!item.productId ? 'Falta productId' : 'Falta quantity'}`)
      });
    }

    // Crear la orden en la base de datos
    const order = await Order.create(orderData);

    // Obtener datos adicionales para el correo
    const [user, products] = await Promise.all([
      User.findById(orderData.userId),
      Promise.all(orderData.items.map(item => 
        Product.findById(item.productId)
          .catch(() => null) // Manejar productos eliminados
      ))
    ]);

    // Construir detalles de los productos para el correo
    const itemsDetails = orderData.items.map((item, index) => ({
      name: products[index]?.name || 'Producto no disponible',
      quantity: item.quantity,
      price: products[index]?.price || 0,
      total: (item.quantity * (products[index]?.price || 0)).toFixed(2)
    }));

    // Plantilla HTML para el correo
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #2c3e50;">Nuevo Pedido Recibido</h1>
          <h2 style="color: #3498db;">Orden #${order.id}</h2>
        </div>

        <div style="padding: 20px;">
          <h3 style="color: #2c3e50;">Información del Cliente</h3>
          <p><strong>Email:</strong> ${user?.email || 'No registrado'}</p>
          <p><strong>ID de Usuario:</strong> ${orderData.userId}</p>

          <h3 style="color: #2c3e50; margin-top: 25px;">Detalles del Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background-color: #3498db; color: white;">
                <th style="padding: 10px; text-align: left;">Producto</th>
                <th style="padding: 10px; text-align: center;">Cantidad</th>
                <th style="padding: 10px; text-align: right;">Precio Unitario</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsDetails.map(item => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px;">${item.name}</td>
                  <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right;">$${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right;">
            <h3 style="color: #2c3e50;">Total del Pedido: $${orderData.total.toFixed(2)}</h3>
          </div>

          <h3 style="color: #2c3e50; margin-top: 25px;">Dirección de Envío</h3>
          <p>${orderData.shippingAddress.address}</p>
          <p>${orderData.shippingAddress.city}, CP ${orderData.shippingAddress.zipCode}</p>
          <p>Teléfono: ${orderData.shippingAddress.phone}</p>

          <h3 style="color: #2c3e50; margin-top: 25px;">Método de Pago</h3>
          <p>${orderData.paymentMethod === 'creditCard' ? 'Tarjeta de Crédito' : 'Efectivo al entregar'}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 25px;">
          <p style="color: #7f8c8d;">Este es un correo automático, por favor no responder</p>
        </div>
      </div>
    `;

    // Configurar el correo electrónico
    const mailOptions = {
      from: `"Notificaciones de Pedidos" <${process.env.EMAIL_USER}>`,
      to: 'juanruaxo@gmail.com',
      subject: `Nuevo Pedido #${order.id} - ${user?.email || 'Cliente No Registrado'}`,
      html: emailHtml,
      attachments: [{
        filename: 'logo.png',
        path: __dirname + '/../public/images/logo.png',
        cid: 'company-logo'
      }]
    };

    // Enviar el correo electrónico en segundo plano
    transporter.sendMail(mailOptions)
      .then(info => console.log(`Correo enviado: ${info.messageId}`))
      .catch(error => console.error(`Error enviando correo: ${error.message}`));

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      order: {
        id: order.id,
        userId: order.userId,
        total: order.total,
        status: order.status,
        items: order.items,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error en createOrder:', error);
    
    const statusCode = error.message.includes('stock') ? 400 : 500;
    const errorMessage = statusCode === 400 
      ? error.message 
      : 'Error al procesar la orden';

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : null
    });
  }
};

// Obtener todas las órdenes de un usuario
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.findAllByUser(userId);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    res.status(500).json({ 
      message: 'Error al obtener órdenes', 
      error: error.message 
    });
  }
};

// Obtener una orden por su ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    res.status(500).json({ 
      message: 'Error al obtener la orden', 
      error: error.message 
    });
  }
};

// Actualizar el estado de una orden
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Se requiere el campo status' });
    }
    
    // Validar que el estado sea válido
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Estado no válido. Debe ser uno de: ${validStatuses.join(', ')}` 
      });
    }
    
    const updatedOrder = await Order.updateStatus(id, status);
    
    res.status(200).json({
      message: 'Estado de la orden actualizado con éxito',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error al actualizar estado de la orden:', error);
    res.status(500).json({ 
      message: 'Error al actualizar estado de la orden', 
      error: error.message 
    });
  }
};