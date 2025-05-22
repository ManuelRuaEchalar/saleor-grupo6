import React from 'react';
import { X } from 'lucide-react';
import AddedProduct from './AddedProduct';
import styles from '../../styles/CartSidebar.module.css';

const CartSidebar = ({ isOpen, cartItems, total, onClose, onUpdate, onRemove }) => {
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.cartSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>Tu Carrito</h3>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>
        <div className={styles.content}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Tu carrito está vacío</p>
              <button onClick={onClose} className={styles.continueBtn}>
                Continuar comprando
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <AddedProduct
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    quantity={item.quantity}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                  />
                ))}
              </div>
              <div className={styles.summary}>
                <div className={styles.total}>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button className={styles.checkoutBtn}>Proceder al pago</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;