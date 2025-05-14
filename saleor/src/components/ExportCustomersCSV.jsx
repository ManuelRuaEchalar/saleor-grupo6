import React, { useState, useEffect } from 'react';

function ExportCustomersCSV() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Verificar la disponibilidad de la API al cargar el componente
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/customers');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data || []);
          setCustomerCount(data?.length || 0);
          setApiAvailable(true);
        } else if (response.status === 404) {
          // API no encontrada
          setApiAvailable(false);
          setError('API de clientes no disponible. Contacte al administrador del sistema.');
          
          // Datos de prueba para demostración
          const sampleCustomers = [
            {
              id: 1,
              email: 'cliente1@ejemplo.com',
              name: 'Cliente Uno',
              createdAt: '2025-01-15T10:00:00.000Z',
              updatedAt: '2025-01-15T10:00:00.000Z'
            },
            {
              id: 2,
              email: 'cliente2@ejemplo.com',
              name: 'Cliente Dos',
              createdAt: '2025-02-20T14:30:00.000Z',
              updatedAt: '2025-02-20T14:30:00.000Z'
            }
          ];
          setCustomers(sampleCustomers);
          setCustomerCount(sampleCustomers.length);
        } else {
          setApiAvailable(false);
          setError('Error al conectar con la API de clientes.');
        }
      } catch (err) {
        console.error('Error verificando API:', err);
        setApiAvailable(false);
        setError('No se pudo conectar con el servidor. ¿Está el servidor en ejecución?');
        
        // Datos de prueba para demostración
        const sampleCustomers = [
          {
            id: 1,
            email: 'cliente1@ejemplo.com',
            name: 'Cliente Uno',
            createdAt: '2025-01-15T10:00:00.000Z',
            updatedAt: '2025-01-15T10:00:00.000Z'
          },
          {
            id: 2,
            email: 'cliente2@ejemplo.com',
            name: 'Cliente Dos',
            createdAt: '2025-02-20T14:30:00.000Z',
            updatedAt: '2025-02-20T14:30:00.000Z'
          }
        ];
        setCustomers(sampleCustomers);
        setCustomerCount(sampleCustomers.length);
      }
    };

    checkApiStatus();
  }, []);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Verificar si hay clientes para exportar
      if (customers.length === 0) {
        setError('No hay clientes para exportar.');
        return;
      }
      
      let customersData = customers;
      
      // Si la API está disponible, intentar obtener los datos más recientes
      if (apiAvailable) {
        try {
          const response = await fetch('http://localhost:4000/api/customers');
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              customersData = data;
            }
          }
        } catch (err) {
          console.log('Usando datos en caché para exportación');
        }
      }
      
      // Convertir a CSV
      const headers = ['id', 'email', 'name', 'createdAt', 'updatedAt'];
      const csvRows = [];
      
      // Añadir encabezados
      csvRows.push(headers.join(','));
      
      // Añadir filas de datos
      for (const customer of customersData) {
        const values = headers.map(header => {
          const value = customer[header] || '';
          // Envolver valores en comillas y escapar comillas internas
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }
      
      // Combinar en una sola cadena CSV
      const csvString = csvRows.join('\n');
      
      // Crear un blob y un enlace de descarga
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Ocultar mensaje de éxito después de 3 segundos
    } catch (err) {
      console.error('Error exportando clientes:', err);
      setError(err.message);
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
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '10px',
        fontSize: '18px',
        color: '#333'
      }}>
        Exportar Clientes
      </h3>
      
      <p style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '20px'
      }}>
        {customerCount > 0 ? (
          `Descarga una lista completa de ${customerCount} cliente${customerCount !== 1 ? 's' : ''} en formato CSV para análisis externo.`
        ) : (
          'No hay clientes disponibles para exportar.'
        )}
        {!apiAvailable && (
          <span style={{ 
            display: 'block', 
            marginTop: '5px', 
            fontSize: '12px', 
            color: '#f59e0b' 
          }}>
            <strong>Nota:</strong> Usando datos de prueba (API no disponible)
          </span>
        )}
      </p>
      
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
          ¡Archivo CSV descargado con éxito!
        </div>
      )}
    </div>
  );
}

export default ExportCustomersCSV;