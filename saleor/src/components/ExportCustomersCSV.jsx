import React, { useState, useEffect } from 'react';

function ExportCustomersCSV() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    customer_type: 'regular',
    notes: ''
  });

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Obtener clientes de la API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/customers');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos del servidor:', data);
      
      setCustomers(data);
      setCustomerCount(data.length);
      setError(null);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('No se pudieron cargar los clientes. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Enviar formulario para crear cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('El nombre del cliente es requerido');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear cliente');
      }
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        customer_type: 'regular',
        notes: ''
      });
      
      // Actualizar lista de clientes
      fetchCustomers();
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Cerrar formulario
      setShowAddForm(false);
    } catch (err) {
      console.error('Error al crear cliente:', err);
      setError(err.message || 'Error al crear cliente. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Exportar clientes a CSV
  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      if (customers.length === 0) {
        setError('No hay clientes para exportar.');
        return;
      }
      
      // Descargar CSV directamente desde el navegador
      window.location.href = 'http://localhost:4000/api/customers/export/csv';
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error exportando clientes:', err);
      setError('Error al exportar clientes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ 
          margin: 0,
          fontSize: '18px',
          color: '#333'
        }}>
          Gestión de Clientes
        </h3>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: showAddForm ? '#f1f1f1' : '#161a1e',
            color: showAddForm ? '#333' : 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          {showAddForm ? 'Cerrar Formulario' : '+ Añadir Cliente'}
        </button>
      </div>
      
      {showAddForm && (
        <div style={{ 
          backgroundColor: '#f9f9f9', 
          padding: '15px', 
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Añadir Nuevo Cliente</h4>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Nombre: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre del cliente"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Email:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Teléfono:
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Teléfono de contacto"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="customer_type" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Tipo de cliente:
              </label>
              <select
                id="customer_type"
                name="customer_type"
                value={formData.customer_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="wholesale">Mayorista</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Notas:
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notas adicionales sobre el cliente"
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'wait' : 'pointer',
                width: '100%',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Guardando...' : 'Añadir Cliente'}
            </button>
          </form>
        </div>
      )}
      
      <p style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '15px'
      }}>
        {customerCount > 0 ? (
          `Tienes ${customerCount} cliente${customerCount !== 1 ? 's' : ''} en la base de datos.`
        ) : (
          'No hay clientes disponibles. Añade un cliente para empezar.'
        )}
      </p>
      
      {/* Tabla de clientes */}
      {loading && !error && customers.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Cargando clientes...</p>
        </div>
      ) : customers.length > 0 ? (
        <div style={{ marginTop: '15px', marginBottom: '15px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Nombre</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Teléfono</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 5).map(customer => (
                <tr key={customer.id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{customer.id}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{customer.name}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {customer.email ? customer.email : '(No disponible)'}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{customer.phone || '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {customer.customer_type === 'premium' ? 'Premium' : 
                    customer.customer_type === 'wholesale' ? 'Mayorista' : 'Regular'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length > 5 && (
            <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
              Mostrando 5 de {customers.length} clientes. Exporta para ver todos.
            </p>
          )}
        </div>
      ) : null}
      
      <button 
        onClick={handleExport} 
        disabled={loading || customerCount === 0}
        style={{
          backgroundColor: customerCount === 0 ? '#d1d5db' : '#161a1e',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '10px 15px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: customerCount === 0 ? 'not-allowed' : (loading ? 'wait' : 'pointer'),
          width: '100%',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Exportando...' : 'Exportar a CSV'}
      </button>
      
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '14px',
          marginTop: '15px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '14px',
          marginTop: '15px'
        }}>
          ¡Operación realizada con éxito!
        </div>
      )}
    </div>
  );
}

export default ExportCustomersCSV;