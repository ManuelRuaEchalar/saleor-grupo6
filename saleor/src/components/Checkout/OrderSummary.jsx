import React from 'react';
import styles from '../../styles/OrderSummary.module.css';

const OrderSummary = ({ cartItems, total, paymentMethod, shippingAddress }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.subtitle}>Confirmar Pedido</h3>
      <div className={styles.orderSummary}>
        <h4>Resumen del Pedido</h4>
        <div className={styles.orderItems}>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.orderItem}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemQuantity}>x {item.quantity}</span>
              <span className={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.orderTotal}>
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <div className={styles.paymentSummary}>
        <h4>Método de Pago</h4>
        <p>
          {paymentMethod === 'creditCard'
            ? `Tarjeta de Crédito terminada en ${shippingAddress.cardNumber?.slice(
                -4
              )}`
            : 'Efectivo al entregar'}
        </p>
      </div>
      <div className={styles.shippingSummary}>
        <h4>Dirección de Envío</h4>
        <p>{shippingAddress.address}</p>
        <p>
          {shippingAddress.city}, CP {shippingAddress.zipCode}
        </p>
        <p>Teléfono: {shippingAddress.phone}</p>
      </div>
    </div>
  );
};

export default OrderSummary;