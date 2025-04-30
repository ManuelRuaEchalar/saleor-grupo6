import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const AddedProduct = ({ id, name, price, image, quantity, onUpdate, onRemove }) => {
  const handleIncrement = () => {
    onUpdate(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdate(id, quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(id);
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {image ? (
          <img src={image} alt={name} className="cart-product-image" />
        ) : (
          <div className="cart-image-placeholder">
            <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" fill="none" />
              <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 20 19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z" stroke="#ffffff" strokeWidth="2" />
              <path d="M4 16L8.29289 11.7071C8.68342 11.3166 9.31658 11.3166 9.70711 11.7071L14 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 14L15.2929 12.7071C15.6834 12.3166 16.3166 12.3166 16.7071 12.7071L20 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="#ffffff" />
            </svg>
          </div>
        )}
      </div>
      <div className="cart-item-details">
        <h4 className="cart-item-name">{name}</h4>
        <p className="cart-item-price">${price.toFixed(2)}</p>
      </div>
      <div className="cart-item-actions">
        <div className="quantity-controls">
          <button 
            className="quantity-btn"
            onClick={handleDecrement}
            disabled={quantity <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="quantity">{quantity}</span>
          <button 
            className="quantity-btn"
            onClick={handleIncrement}
          >
            <Plus size={16} />
          </button>
        </div>
        <button 
          className="remove-btn"
          onClick={handleRemove}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default AddedProduct;