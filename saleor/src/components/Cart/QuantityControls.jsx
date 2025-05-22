import React from 'react';
import { Plus, Minus } from 'lucide-react';
import styles from '../../styles/QuantityControls.module.css';

const QuantityControls = ({ quantity, onIncrement, onDecrement }) => {
  return (
    <div className={styles.quantityControls}>
      <button
        className={styles.quantityBtn}
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label="Disminuir cantidad"
      >
        <Minus size={16} />
      </button>
      <span className={styles.quantity}>{quantity}</span>
      <button
        className={styles.quantityBtn}
        onClick={onIncrement}
        aria-label="Aumentar cantidad"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantityControls;