import React, { useState, useEffect } from 'react';

function Product({ id, name, description, price, image }) {
  const [showTagOptions, setShowTagOptions] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [productTags, setProductTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagAdded, setTagAdded] = useState(false);

  // Usuario por defecto para pruebas - en producción esto vendría de un contexto o sistema de autenticación
  const defaultUser = {
    id: 1, 
    email: "usuario@test.com",
    role: "user", // Esto determina si se muestra el botón de añadir etiqueta
    createdAt: "2025-04-30T02:26:35.000Z",
    updatedAt: "2025-04-30T02:26:35.000Z"
  };

  // Obtener las etiquetas disponibles y las etiquetas del producto al cargar el componente
  useEffect(() => {
    // Solo cargar si se muestra el selector de etiquetas
    if (showTagOptions) {
      fetchAvailableTags();
      fetchProductTags();
    }
  }, [showTagOptions]);

  // Función para obtener todas las etiquetas disponibles
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

  // Función para obtener las etiquetas del producto actual
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

  // Función para añadir una etiqueta al producto
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
      
      // Refrescar las etiquetas del producto
      fetchProductTags();
      
      // Mostrar notificación de éxito temporal
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

  // Función para manejar la selección de una etiqueta
  const handleTagSelect = (tagId) => {
    // Verificar si la etiqueta ya está asociada al producto
    const isTagAlreadyAdded = productTags.some(tag => tag.id === tagId);
    
    if (!isTagAlreadyAdded) {
      addTagToProduct(tagId);
    } else {
      setError('Esta etiqueta ya está asociada al producto.');
      setTimeout(() => setError(null), 2000);
    }
  };

  // Función para formatear el precio
  const formatPrice = (price) => {
    // Si ya incluye el símbolo de moneda, devolverlo como está
    if (typeof price === 'string' && price.includes('$')) {
      return price;
    }
    
    // Convertir a número si es string y formatear
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numericPrice.toFixed(2)}`;
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={image || 'https://via.placeholder.com/300x300?text=Producto'} 
          alt={name}
          className="product-image"
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        
        {description && (
          <p className="product-description">{description}</p>
        )}
        
        <p className="product-price">{formatPrice(price)}</p>
        
        <button className="add-to-cart-button" style={{
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
        }}>
          Añadir al carrito
        </button>
        
        {/* Botón para añadir etiqueta (solo visible para admin) */}
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
            
            {/* Selector de etiquetas */}
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
                        // Comprobar si la etiqueta ya está añadida al producto
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
                
                {/* Etiquetas actuales del producto */}
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
            
            {/* Notificación de etiqueta añadida */}
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