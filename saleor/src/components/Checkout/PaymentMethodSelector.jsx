import React from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import styles from '../../styles/PaymentMethodSelector.module.css';

const PaymentMethodSelector = ({ paymentMethod, onChange }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.subtitle}>Método de pago</h3>
      <div className={styles.methods}>
        <button
          className={`${styles.methodBtn} ${
            paymentMethod === 'creditCard' ? styles.active : ''
          }`}
          onClick={() => onChange('creditCard')}
        >
          <CreditCard size={20} />
          <span>Tarjeta de Crédito</span>
        </button>
        <button
          className={`${styles.methodBtn} ${
            paymentMethod === 'cash' ? styles.active : ''
          }`}
          onClick={() => onChange('cash')}
        >
          <DollarSign size={20} />
          <span>Efectivo al entregar</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;