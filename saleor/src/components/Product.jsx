import React, { useState, useEffect } from 'react';

function Product({ product, onAddToCart, isRecentlyViewed }) {
  const { id, name, description, price, image } = product;

  const [showTagOptions, setShowTagOptions] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [productTags, setProductTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagAdded, setTagAdded] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(true);

  const defaultUser = {
    id: 1,
    email: "usuario@test.com",
    role: "admin",
    createdAt: "2025-04-30T02:26:35.000Z",
    updatedAt: "2025-04-30T02:26:35.000Z"
  };

  useEffect(() => {
    const fetchDeliveryEstimate = async () => {
      try {
        setEstimateLoading(true);
        const response = await fetch(`http://localhost:4000/api/delivery-estimate/${id}`);
        if (!response.ok) {
          const randomDays = Math.floor(Math.random() * 5) + 3;
          setDeliveryEstimate({
            minDays: randomDays,
            maxDays: randomDays + 2,
            available: true
          });
        } else {
          const data = await response.json();
          setDeliveryEstimate(data);
        }
      } catch (error) {
        console.error('Error al obtener estimación de entrega:', error);
        const randomDays = Math.floor(Math.random() * 5) + 3;
        setDeliveryEstimate({
          minDays: randomDays,
          maxDays: randomDays + 2,
          available: true
        });
      } finally {
        setEstimateLoading(false);
      }
    };
    fetchDeliveryEstimate();
  }, [id]);

  useEffect(() => {
    if (showTagOptions) {
      fetchAvailableTags();
      fetchProductTags();
    }
  }, [showTagOptions]);

  const formatDeliveryDate = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const fetchAvailableTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/tags');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAvailableTags(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('No se pudieron cargar las etiquetas disponibles.');
      setAvailableTags([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductTags = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/tags/product/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setProductTags(data);
    } catch (err) {
      console.error('Error fetching product tags:', err);
      setProductTags([]);
    }
  };

  const addTagToProduct = async (tagId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/tags/product/${id}/tag/${tagId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      fetchProductTags();
      setTagAdded(true);
      setTimeout(() => setTagAdded(false), 2000);
      setError(null);
    } catch (err) {
      console.error('Error adding tag to product:', err);
      setError('No se pudo añadir la etiqueta al producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tagId) => {
    const isTagAlreadyAdded = productTags.some(tag => tag.id === tagId);
    if (!isTagAlreadyAdded) {
      addTagToProduct(tagId);
    } else {
      setError('Esta etiqueta ya está asociada al producto.');
      setTimeout(() => setError(null), 2000);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'string' && price.includes('$')) {
      return price;
    }
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numericPrice.toFixed(2)}`;
  };

  return (
    <div className={`product-card ${isRecentlyViewed ? 'recently-viewed' : ''}`}>
      {isRecentlyViewed && (
        <div className="recently-viewed-badge" style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#3182ce',
          color: 'white',
          fontSize: '11px',
          padding: '3px 8px',
          borderRadius: '10px',
          zIndex: 10
        }}>
          Visto recientemente
        </div>
      )}
      
      <div className="product-image-container">
        <img 
          src={image || 'https://via.placeholder.com/300x300?text=Producto'} 
          alt={name}
          className="product-image"
        />
      </div>
      <div className="product-info" style={isRecentlyViewed ? {
        borderTop: '2px solid #3182ce',
      } : {}}>
        <h3 className="product-name">{name}</h3>
        {description && (
          <p className="product-description">{description}</p>
        )}
        <p className="product-price">{formatPrice(price)}</p>
        <div className="delivery-estimate" style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          padding: '10px',
          margin: '10px 0',
          fontSize: '14px'
        }}>
          {estimateLoading ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Calculando tiempo de entrega...</p>
          ) : deliveryEstimate ? (
            deliveryEstimate.available ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontSize: '18px' }}>🚚</span>
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '2px', color: '#333' }}>Entrega estimada:</p>
                  <p style={{ color: '#4caf50', fontWeight: '500' }}>
                    {formatDeliveryDate(deliveryEstimate.minDays)} - {formatDeliveryDate(deliveryEstimate.maxDays)}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#e53935', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontSize: '18px' }}>⚠️</span>
                Producto sin stock disponible
              </p>
            )
          ) : null}
        </div>
        <button 
          className="add-to-cart-button" 
          style={{
            backgroundColor: '#161a1e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 15px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.2s ease',
            marginTop: '10px'
          }}
          onClick={() => onAddToCart(product)}
        >
          Añadir al carrito
        </button>
        {defaultUser?.role === 'admin' && (
          <div className="tag-management-section">
            <button 
              className="add-tag-button"
              onClick={() => setShowTagOptions(!showTagOptions)}
              style={{
                background: 'transparent',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                color: '#777',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              {showTagOptions ? '− Ocultar etiquetas' : '+ Añadir etiqueta'}
            </button>
            {showTagOptions && (
              <div className="tag-selector" style={{ marginTop: '10px' }}>
                {loading ? (
                  <p className="loading-tags">Cargando etiquetas...</p>
                ) : error ? (
                  <p className="error-message">{error}</p>
                ) : (
                  <>
                    <p style={{ fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                      Selecciona una etiqueta para añadir:
                    </p>
                    <div className="tags-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '5px',
                      marginBottom: '5px'
                    }}>
                      {availableTags.map(tag => {
                        const isTagAdded = productTags.some(pt => pt.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => handleTagSelect(tag.id)}
                            disabled={isTagAdded}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: isTagAdded ? '#e9e9e9' : '#f5f5f5',
                              border: '1px solid #ddd',
                              borderRadius: '3px',
                              cursor: isTagAdded ? 'default' : 'pointer',
                              color: isTagAdded ? '#999' : '#333',
                              textAlign: 'left',
                              opacity: isTagAdded ? 0.7 : 1
                            }}
                          >
                            {tag.name}
                            {isTagAdded && ' ✓'}
                          </button>
                        );
                      })}
                    </div>
                    {availableTags.length === 0 && (
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        No hay etiquetas disponibles.
                      </p>
                    )}
                  </>
                )}
                {productTags.length > 0 && (
                  <div className="current-tags" style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                      Etiquetas actuales:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {productTags.map(tag => (
                        <span 
                          key={tag.id}
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '10px',
                            color: '#555'
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {tagAdded && (
              <div 
                className="tag-added-notification"
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginTop: '8px',
                  textAlign: 'center'
                }}
              >
                ¡Etiqueta añadida correctamente!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Product;