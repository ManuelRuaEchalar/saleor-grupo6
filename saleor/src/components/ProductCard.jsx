import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

const ProductCard = ({ product }) => {
  // Validación de datos del producto
  if (!product || typeof product !== 'object') {
    return null; // O mostrar un placeholder de error
  }

  const { id, name, description, price, image } = product;
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
        <img
          src={image || '/placeholder-image.jpg'}
          alt={name || 'Producto sin nombre'}
          className="product-image"
          loading="lazy"
          onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
        />
      </div>
      <div className="product-details">
        <h3 className="product-title">{name || 'Nombre no disponible'}</h3>
        <p className="product-description">
          {description || 'Descripción no disponible'}
        </p>
        <div className="product-footer">
          <span className="product-price">${(price || 0).toFixed(2)}</span>
          <button
            className={`product-button ${loading ? 'loading' : ''} ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading
              ? 'Añadiendo...'
              : added
                ? <><Check size={16} /> Añadido</>
                : <><ShoppingCart size={16} /> Añadir</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
