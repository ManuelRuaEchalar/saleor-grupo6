// ProductCard.jsx
import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import useCart from '../../hooks/useCart';
import styles from '../../styles/ProductCard.module.css';

const formatPrice = (price) => {
  if (typeof price === 'string' && price.includes('$')) return price;
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `$${numericPrice.toFixed(2)}`;
};

const ProductCard = ({ product, onAddToCart, isRecentlyViewed, onView, isAdmin }) => {
  if (!product || typeof product !== 'object') return null;

  const { id, name, description, price, image } = product;
  const { addToCart } = useCart(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addToCart({ productId: id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (onAddToCart) onAddToCart(product);
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('No se pudo añadir el producto al carrito.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (onView) {
      console.log('Product clicked, marking as viewed:', id);
      onView(product);
    }
  };

  return (
    <div
      className={`${styles.productCard} ${isRecentlyViewed ? styles.recentlyViewed : ''}`}
      onClick={handleClick}
    >
      {isRecentlyViewed && <div className={styles.recentlyViewedBadge}>Visto recientemente</div>}
      <div className={styles.productImageContainer}>
        <img
          src={image || 'https://via.placeholder.com/300x300?text=Producto'}
          alt={name}
          className={styles.productImage}
          onError={(e) => (e.target.src = '/placeholder-image.jpg')}
        />
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{name || 'Nombre no disponible'}</h3>
        <p className={styles.productDescription}>{description || 'Descripción no disponible'}</p>
        <p className={styles.productPrice}>{formatPrice(price)}</p>
        <button
          className={styles.addToCartButton}
          onClick={handleAddToCart}
          disabled={loading}
        >
          {loading ? (
            'Añadiendo...'
          ) : added ? (
            <>
              <Check size={16} /> Añadido
            </>
          ) : (
            <>
              <ShoppingCart size={16} /> Añadir
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;