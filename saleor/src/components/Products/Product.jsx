import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { fetchTags, fetchProductTags, addTagToProduct, fetchDeliveryEstimate } from '../../services/api';
import styles from '../../styles/Product.module.css';

const Product = ({ product, onAddToCart, isRecentlyViewed, isAdmin }) => {
  const { id, name, description, price, image } = product;
  const [showTagOptions, setShowTagOptions] = useState(false);
  const [tagAdded, setTagAdded] = useState(false);
  const { data: availableTags, loading: tagsLoading, error: tagsError, execute: fetchTagsExecute } = useApi();
  const { data: productTags, execute: fetchProductTagsExecute } = useApi();
  const { data: deliveryEstimate, loading: estimateLoading, execute: fetchDeliveryEstimateExecute } = useApi();

  useEffect(() => {
    fetchDeliveryEstimateExecute(() => fetchDeliveryEstimate(id));
  }, [id, fetchDeliveryEstimateExecute]);

  useEffect(() => {
    if (showTagOptions) {
      fetchTagsExecute(fetchTags);
      fetchProductTagsExecute(() => fetchProductTags(id));
    }
  }, [showTagOptions, fetchTagsExecute, fetchProductTagsExecute, id]);

  const formatDeliveryDate = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleTagSelect = async (tagId) => {
    const isTagAlreadyAdded = productTags?.some((tag) => tag.id === tagId);
    if (isTagAlreadyAdded) {
      alert('Esta etiqueta ya está asociada al producto.');
      return;
    }
    try {
      await addTagToProduct(id, tagId);
      fetchProductTagsExecute(() => fetchProductTags(id));
      setTagAdded(true);
      setTimeout(() => setTagAdded(false), 2000);
    } catch (err) {
      console.error('Error adding tag to product:', err);
      alert('No se pudo añadir la etiqueta al producto.');
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'string' && price.includes('$')) return price;
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numericPrice.toFixed(2)}`;
  };

  return (
    <div className={`${styles.productCard} ${isRecentlyViewed ? styles.recentlyViewed : ''}`}>
      {isRecentlyViewed && <div className={styles.recentlyViewedBadge}>Visto recientemente</div>}
      <div className={styles.productImageContainer}>
        <img
          src={image || 'https://via.placeholder.com/300x300?text=Producto'}
          alt={name}
          className={styles.productImage}
        />
      </div>
      <div className={`${styles.productInfo} ${isRecentlyViewed ? styles.recentlyViewedBorder : ''}`}>
        <h3 className={styles.productName}>{name}</h3>
        {description && <p className={styles.productDescription}>{description}</p>}
        <p className={styles.productPrice}>{formatPrice(price)}</p>
        <div className={styles.deliveryEstimate}>
          {estimateLoading ? (
            <p className={styles.estimateLoading}>Calculando tiempo de entrega...</p>
          ) : deliveryEstimate ? (
            deliveryEstimate.available ? (
              <div className={styles.estimateAvailable}>
                <span className={styles.truckIcon}>🚚</span>
                <div>
                  <p className={styles.estimateTitle}>Entrega estimada:</p>
                  <p className={styles.estimateDates}>
                    {formatDeliveryDate(deliveryEstimate.minDays)} - {formatDeliveryDate(deliveryEstimate.maxDays)}
                  </p>
                </div>
              </div>
            ) : (
              <p className={styles.estimateUnavailable}>
                <span className={styles.warningIcon}>⚠️</span> Producto sin stock disponible
              </p>
            )
          ) : null}
        </div>
        <button className={styles.addToCartButton} onClick={() => onAddToCart(product)}>
          Añadir al carrito
        </button>
        {isAdmin && (
          <div className={styles.tagManagement}>
            <button
              className={styles.addTagButton}
              onClick={() => setShowTagOptions(!showTagOptions)}
            >
              {showTagOptions ? '− Ocultar etiquetas' : '+ Añadir etiqueta'}
            </button>
            {showTagOptions && (
              <div className={styles.tagSelector}>
                {tagsLoading ? (
                  <p className={styles.loadingTags}>Cargando etiquetas...</p>
                ) : tagsError ? (
                  <p className={styles.errorMessage}>{tagsError}</p>
                ) : (
                  <>
                    <p className={styles.tagSelectorTitle}>Selecciona una etiqueta para añadir:</p>
                    <div className={styles.tagsGrid}>
                      {availableTags?.map((tag) => {
                        const isTagAdded = productTags?.some((pt) => pt.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => handleTagSelect(tag.id)}
                            disabled={isTagAdded}
                            className={`${styles.tagButton} ${isTagAdded ? styles.tagButtonDisabled : ''}`}
                          >
                            {tag.name}
                            {isTagAdded && ' ✓'}
                          </button>
                        );
                      })}
                    </div>
                    {availableTags?.length === 0 && (
                      <p className={styles.noTags}>No hay etiquetas disponibles.</p>
                    )}
                  </>
                )}
                {productTags?.length > 0 && (
                  <div className={styles.currentTags}>
                    <p className={styles.currentTagsTitle}>Etiquetas actuales:</p>
                    <div className={styles.currentTagsList}>
                      {productTags.map((tag) => (
                        <span key={tag.id} className={styles.currentTag}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {tagAdded && (
              <div className={styles.tagAddedNotification}>¡Etiqueta añadida correctamente!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;