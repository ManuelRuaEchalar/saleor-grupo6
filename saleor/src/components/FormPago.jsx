import { useState } from 'react';
import { X, CreditCard, DollarSign, Truck, Check, AlertCircle } from 'lucide-react';

const FormPago = ({ cartItems, total, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  });
  const [step, setStep] = useState(1); // 1: Información de pago, 2: Confirmación, 3: Éxito

  // Usuario por defecto para pruebas
  const userId = 1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const validateForm = () => {
    if (paymentMethod === 'creditCard') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        setError('Por favor, complete todos los campos de la tarjeta.');
        return false;
      }
      
      // Validación básica del número de tarjeta (16 dígitos)
      if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        setError('El número de tarjeta debe tener 16 dígitos.');
        return false;
      }
      
      // Validación básica de fecha de expiración (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        setError('El formato de fecha de expiración debe ser MM/YY.');
        return false;
      }
      
      // Validación básica de CVV (3 dígitos)
      if (!/^\d{3}$/.test(formData.cvv)) {
        setError('El CVV debe tener 3 dígitos.');
        return false;
      }
    }
    
    if (!formData.address || !formData.city || !formData.zipCode || !formData.phone) {
      setError('Por favor, complete todos los campos de envío.');
      return false;
    }
    
    // Validación básica de código postal (5 dígitos)
    if (!/^\d{5}$/.test(formData.zipCode)) {
      setError('El código postal debe tener 5 dígitos.');
      return false;
    }
    
    // Validación básica de teléfono
    if (!/^\d{8,10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Por favor, ingrese un número de teléfono válido.');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateForm()) return;
      setError(null);
      setStep(2);
    } else if (step === 2) {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const items = cartItems.map(item => {
        const productId = item.productId !== undefined ? item.productId : item.id;
        
        if (!productId) {
          throw new Error('Uno o más productos no tienen un ID válido');
        }
        
        return {
          productId: productId,
          quantity: item.quantity
        };
      });
      
      if (!userId) throw new Error('ID de usuario no válido');
      if (!total || isNaN(total) || total <= 0) throw new Error('Total de la orden no válido');
      if (!items || items.length === 0) throw new Error('No hay productos en el carrito');
      
      const orderData = {
        userId: userId,
        total: total,
        paymentMethod: paymentMethod,
        items: items,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          phone: formData.phone
        }
      };
      
      console.log('Enviando datos de orden:', orderData);
      
      const response = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || `Error: ${response.status}`);
      }
      
      console.log('Orden creada:', responseData);
      
      try {
        await fetch(`http://localhost:4000/api/cart-items/clear/${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (clearError) {
        console.warn('No se pudo limpiar el carrito:', clearError);
      }
      
      setStep(3);
      
      setTimeout(() => {
        if (onSuccess) onSuccess(responseData.order);
        
        // Recargar la página principal
        window.location.href = 'http://localhost:5173/';
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setError(`Error al procesar el pago: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Formatear número de tarjeta con espacios cada 4 dígitos
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Formatear fecha de expiración (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  // Manejar cambio específico para campos formateados
  const handleFormattedChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Renderizar el paso actual
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="payment-form-content">
            <h3 className="payment-form-subtitle">Método de pago</h3>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'creditCard' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('creditCard')}
              >
                <CreditCard size={20} />
                <span>Tarjeta de Crédito</span>
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('cash')}
              >
                <DollarSign size={20} />
                <span>Efectivo al entregar</span>
              </button>
            </div>
            
            {paymentMethod === 'creditCard' && (
              <div className="credit-card-fields">
                <div className="form-group">
                  <label htmlFor="cardNumber">Número de Tarjeta</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleFormattedChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cardName">Nombre en la Tarjeta</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="NOMBRE APELLIDO"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="expiryDate">Fecha de Expiración</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleFormattedChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group half">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <h3 className="payment-form-subtitle">Información de Envío</h3>
            <div className="shipping-fields">
              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, número, colonia"
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="city">Ciudad</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="form-group half">
                  <label htmlFor="zipCode">Código Postal</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="12345"
                    maxLength="5"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="123 456 7890"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="confirmation-content">
            <h3 className="payment-form-subtitle">Confirmar Pedido</h3>
            
            <div className="order-summary">
              <h4>Resumen del Pedido</h4>
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x {item.quantity}</span>
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="payment-summary">
              <h4>Método de Pago</h4>
              <p>
                {paymentMethod === 'creditCard' 
                  ? `Tarjeta de Crédito terminada en ${formData.cardNumber.slice(-4)}` 
                  : 'Efectivo al entregar'}
              </p>
            </div>
            
            <div className="shipping-summary">
              <h4>Dirección de Envío</h4>
              <p>{formData.address}</p>
              <p>{formData.city}, CP {formData.zipCode}</p>
              <p>Teléfono: {formData.phone}</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="success-content">
            <div className="success-icon">
              <Check size={48} color="#4caf50" />
            </div>
            <h3 className="success-title">¡Pedido Realizado con Éxito!</h3>
            <p className="success-message">
              Gracias por tu compra. Recibirás un correo electrónico con los detalles de tu pedido.
            </p>
            <div className="order-processing">
              <Truck size={24} />
              <p>Tu pedido está siendo procesado</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="payment-form-overlay">
      <div className="payment-form-container">
        <div className="payment-form-header">
          <h2 className="payment-form-title">
            {step === 3 ? 'Pedido Completado' : 'Finalizar Compra'}
          </h2>
          <button 
            className="close-form-btn"
            onClick={onClose}
            disabled={loading || step === 3}
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="payment-error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}
        
        <div className="payment-form-body">
          {renderStep()}
        </div>
        
        {step !== 3 && (
          <div className="payment-form-footer">
            {step === 2 && (
              <button 
                type="button" 
                className="back-btn"
                onClick={handlePrevStep}
                disabled={loading}
              >
                Volver
              </button>
            )}
            <button 
              type="button" 
              className="next-btn"
              onClick={handleNextStep}
              disabled={loading}
            >
              {loading 
                ? 'Procesando...' 
                : step === 1 
                  ? 'Continuar' 
                  : 'Confirmar Pedido'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPago;