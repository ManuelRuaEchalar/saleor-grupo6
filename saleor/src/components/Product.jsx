import React, { useState } from 'react';

const Product = ({ id, name, description, price, image }) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  
  // Usuario por defecto para pruebas
  const userId = 1;
  
  const handleAddToCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/cart-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId: id,
          quantity: 1,
          // Es posible que necesites otros campos según tu API
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Producto añadido con éxito
      setAdded(true);
      
      // Mostrar mensaje de éxito durante 2 segundos
      setTimeout(() => {
        setAdded(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('No se pudo añadir el producto al carrito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {image ? (
          <img src={image} alt={name} className="product-image" />
        ) : (
          <div className="product-image-placeholder">
            <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" fill="none" />
              <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z" stroke="#ffffff" strokeWidth="2" />
              <path d="M4 16L8.29289 11.7071C8.68342 11.3166 9.31658 11.3166 9.70711 11.7071L14 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 14L15.2929 12.7071C15.6834 12.3166 16.3166 12.3166 16.7071 12.7071L20 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="#ffffff" />
            </svg>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        {description && <p className="product-description">{description}</p>}
        <div className="product-footer">
          <p className="product-price">${price.toFixed(2)}</p>
          <button 
            className={`product-button ${loading ? 'loading' : ''} ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? 'Añadiendo...' : added ? '¡Añadido!' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;