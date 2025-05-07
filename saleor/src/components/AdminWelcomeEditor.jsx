import React, { useEffect, useState } from 'react';

const AdminWelcomeEditor = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/welcome')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setError('Error cargando el mensaje'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaved(false);
      setError(null);
      const response = await fetch('http://localhost:4000/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el mensaje');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Error al guardar');
    }
  };

  return (
    <div className="admin-welcome-editor">
      <h3>Editar mensaje de bienvenida</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          />
          <button onClick={handleSave} style={{ marginTop: '10px' }}>
            Guardar mensaje
          </button>
          {saved && <p style={{ color: 'green' }}>¡Mensaje actualizado!</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default AdminWelcomeEditor;
