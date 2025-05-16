import React, { useState, useEffect } from 'react';

const PriceFilter = ({ onApplyFilter, activeFilter }) => {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(999);
  const [minInputValue, setMinInputValue] = useState('0.00');
  const [maxInputValue, setMaxInputValue] = useState('999.00');
  
  // Resetear estado cuando cambia el filtro activo
  useEffect(() => {
    if (!activeFilter) {
      setMinPrice(0);
      setMaxPrice(999);
      setMinInputValue('0.00');
      setMaxInputValue('999.00');
    } else {
      setMinPrice(activeFilter.min);
      setMaxPrice(activeFilter.max);
      setMinInputValue(activeFilter.min.toFixed(2));
      setMaxInputValue(activeFilter.max.toFixed(2));
    }
  }, [activeFilter]);
  
  // Actualizar los valores de entrada cuando cambian los deslizadores
  useEffect(() => {
    setMinInputValue(minPrice.toFixed(2));
  }, [minPrice]);
  
  useEffect(() => {
    setMaxInputValue(maxPrice.toFixed(2));
  }, [maxPrice]);
  
  // Manejar cambio en el input del precio mínimo
  const handleMinInputChange = (e) => {
    const value = e.target.value;
    
    // Permitir entrada de números y un punto decimal
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setMinInputValue(value);
      
      // Actualizar el valor numérico si es válido
      if (value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setMinPrice(numValue);
        }
      }
    }
  };
  
  // Manejar cambio en el input del precio máximo
  const handleMaxInputChange = (e) => {
    const value = e.target.value;
    
    // Permitir entrada de números y un punto decimal
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setMaxInputValue(value);
      
      // Actualizar el valor numérico si es válido
      if (value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setMaxPrice(numValue);
        }
      }
    }
  };
  
  // Cuando se pierde el foco, formatear a dos decimales
  const handleInputBlur = (type) => {
    if (type === 'min') {
      setMinInputValue(minPrice.toFixed(2));
    } else {
      setMaxInputValue(maxPrice.toFixed(2));
    }
  };
  
  // Manejar cambio en el deslizador del precio mínimo
  const handleMinSliderChange = (e) => {
    const newMin = parseFloat(e.target.value);
    setMinPrice(newMin);
  };
  
  // Manejar cambio en el deslizador del precio máximo
  const handleMaxSliderChange = (e) => {
    const newMax = parseFloat(e.target.value);
    setMaxPrice(newMax);
  };
  
  return (
    <div style={{ 
      width: '250px', 
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '20px',
      marginRight: '20px'
    }}>
      <h3 style={{ 
        textAlign: 'center',
        color: '#555',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '20px'
      }}>
        Filtro de precio
      </h3>
      
      {/* Deslizador para el precio mínimo */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          Precio mínimo
        </label>
        <input
          type="range"
          min="0"
          max="999"
          step="0.01"
          value={minPrice}
          onChange={handleMinSliderChange}
          style={{
            width: '100%',
            accentColor: '#4CAF50'
          }}
        />
      </div>
      
      {/* Deslizador para el precio máximo */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          Precio máximo
        </label>
        <input
          type="range"
          min="0"
          max="999"
          step="0.01"
          value={maxPrice}
          onChange={handleMaxSliderChange}
          style={{
            width: '100%',
            accentColor: '#4CAF50'
          }}
        />
      </div>
      
      {/* Campos de entrada */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <input 
          type="text"
          placeholder="0.00"
          value={minInputValue}
          onChange={handleMinInputChange}
          onBlur={() => handleInputBlur('min')}
          style={{
            width: '80px',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        />
        <span style={{ color: '#888' }}>–</span>
        <input 
          type="text"
          placeholder="999.00"
          value={maxInputValue}
          onChange={handleMaxInputChange}
          onBlur={() => handleInputBlur('max')}
          style={{
            width: '80px',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        />
      </div>
      
      {/* Botones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={() => onApplyFilter(minPrice, maxPrice)}
          style={{
            backgroundColor: '#161a1e',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Aplicar filtro
        </button>
        
        {activeFilter && (
          <button 
            onClick={() => onApplyFilter(null)}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#555',
              border: '1px solid #ddd',
              padding: '10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Limpiar filtro
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceFilter;

//