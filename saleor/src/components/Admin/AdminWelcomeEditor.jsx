import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/use-api';
import { fetchWelcomeMessage, updateWelcomeMessage } from '../../services/api';
import { Check, AlertCircle } from 'lucide-react';
import styles from '../../styles/AdminWelcomeEditor.module.css';

const AdminWelcomeEditor = () => {
  const { data, loading, error, execute } = useApi();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    execute(fetchWelcomeMessage);
  }, [execute]);

  useEffect(() => {
    if (data && data.message) {
      setMessage(data.message);
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await execute(updateWelcomeMessage, message);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Error ya está manejado por useApi
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Editar Mensaje de Bienvenida</h2>
      {loading && <p className={styles.loading}>Cargando...</p>}
      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className={styles.success}>
          <Check size={20} />
          <p>Mensaje actualizado con éxito</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="welcomeMessage" className={styles.label}>
          Mensaje de Bienvenida
        </label>
        <textarea
          id="welcomeMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.textarea}
          placeholder="Escribe el mensaje de bienvenida..."
          rows="4"
        />
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};

export default AdminWelcomeEditor;