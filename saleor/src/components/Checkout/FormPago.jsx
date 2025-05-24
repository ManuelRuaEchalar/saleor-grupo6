import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Truck } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import ShippingForm from './ShippingForm';
import OrderSummary from './OrderSummary';
import useForm from '../../hooks/use-form';
import useApi from '../../hooks/use-api';
import { createOrder, clearCart } from '../../services/api';
import styles from '../../styles/FormPago.module.css';

const FormPago = ({ cartItems, total, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const { data, loading, error, execute } = useApi();
  const timeoutRef = useRef(null);
  const userId = 1;

  const { formData, handleChange, errors, validateForm } = useForm({
    initialValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      address: '',
      city: '',
      zipCode: '',
      phone: '',
      paymentMethod: 'creditCard',
      subscribeToNewsletter: false,
    },
    validate: (values) => {
      const errors = {};
      if (values.paymentMethod === 'creditCard') {
        if (!values.cardNumber || !/^\d{16}$/.test(values.cardNumber.replace(/\s/g, ''))) {
          errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.';
        }
        if (!values.cardName) errors.cardName = 'El nombre es requerido.';
        if (!/^\d{2}\/\d{2}$/.test(values.expiryDate)) {
          errors.expiryDate = 'Formato MM/YY requerido.';
        }
        if (!/^\d{3}$/.test(values.cvv)) errors.cvv = 'CVV debe tener 3 dígitos.';
      }
      if (!values.address) errors.address = 'La dirección es requerida.';
      if (!values.city) errors.city = 'La ciudad es requerida.';
      if (!/^\d{5}$/.test(values.zipCode)) errors.zipCode = 'Código postal debe tener 5 dígitos.';
      if (!/^\d{8,10}$/.test(values.phone.replace(/\D/g, ''))) {
        errors.phone = 'Teléfono inválido.';
      }
      return errors;
    },
  });

  const handleNextStep = async () => {
    if (step === 1) {
      if (validateForm()) {
        setStep(2);
      }
    } else if (step === 2) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const items = cartItems.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
      }));

      const orderData = {
        userId,
        total,
        paymentMethod: formData.paymentMethod,
        items,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          phone: formData.phone,
        },
        subscribeToNewsletter: formData.subscribeToNewsletter,
      };

      const response = await execute(createOrder, orderData);
      await execute(clearCart, userId);
      setStep(3);

      timeoutRef.current = setTimeout(() => {
        onSuccess(response.order);
        onClose();
      }, 3000);
    } catch (err) {
      // Error manejado por useApi
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <PaymentMethodSelector
              paymentMethod={formData.paymentMethod}
              onChange={(method) =>
                handleChange({ target: { name: 'paymentMethod', value: method } })
              }
            />
            {formData.paymentMethod === 'creditCard' && (
              <div className={styles.creditCardFields}>
                <label className={styles.label}>
                  Número de Tarjeta
                  <input
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\s+/g, '')
                        .replace(/[^0-9]/gi, '');
                      const formatted =
                        value.match(/\d{4,16}/g)?.[0].match(/.{1,4}/g)?.join(' ') ||
                        value;
                      handleChange({
                        target: { name: 'cardNumber', value: formatted },
                      });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={`${styles.input} ${
                      errors.cardNumber ? styles.inputError : ''
                    }`}
                  />
                  {errors.cardNumber && (
                    <span className={styles.errorText}>{errors.cardNumber}</span>
                  )}
                </label>
                <label className={styles.label}>
                  Nombre en la Tarjeta
                  <input
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="NOMBRE APELLIDO"
                    className={`${styles.input} ${
                      errors.cardName ? styles.inputError : ''
                    }`}
                  />
                  {errors.cardName && (
                    <span className={styles.errorText}>{errors.cardName}</span>
                  )}
                </label>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Fecha de Expiración
                    <input
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\s+/g, '')
                          .replace(/[^0-9]/gi, '');
                        const formatted =
                          value.length > 2
                            ? `${value.substring(0, 2)}/${value.substring(2, 4)}`
                            : value;
                        handleChange({
                          target: { name: 'expiryDate', value: formatted },
                        });
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={`${styles.input} ${
                        errors.expiryDate ? styles.inputError : ''
                      }`}
                    />
                    {errors.expiryDate && (
                      <span className={styles.errorText}>{errors.expiryDate}</span>
                    )}
                  </label>
                  <label className={styles.label}>
                    CVV
                    <input
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="3"
                      className={`${styles.input} ${
                        errors.cvv ? styles.inputError : ''
                      }`}
                    />
                    {errors.cvv && (
                      <span className={styles.errorText}>{errors.cvv}</span>
                    )}
                  </label>
                </div>
              </div>
            )}
            <ShippingForm
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />
          </>
        );
      case 2:
        return (
          <OrderSummary
            cartItems={cartItems}
            total={total}
            paymentMethod={formData.paymentMethod}
            shippingAddress={formData}
          />
        );
      case 3:
        return (
          <div className={styles.successContent}>
            <Check size={48} color="#4caf50" />
            <h3>¡Pedido Realizado con Éxito!</h3>
            <p>
              Gracias por tu compra. Recibirás un correo electrónico con los detalles
              de tu pedido.
            </p>
            <div className={styles.orderProcessing}>
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
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{step === 3 ? 'Pedido Completado' : 'Finalizar Compra'}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading || step === 3}
            aria-label="Cerrar formulario"
          >
            <X size={24} />
          </button>
        </div>
        {error && (
          <div className={styles.error}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}
        <div className={styles.body}>{renderStep()}</div>
        {step !== 3 && (
          <div className={styles.footer}>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className={styles.backBtn}
              >
                Volver
              </button>
            )}
            <button
              onClick={handleNextStep}
              disabled={loading}
              className={styles.nextBtn}
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