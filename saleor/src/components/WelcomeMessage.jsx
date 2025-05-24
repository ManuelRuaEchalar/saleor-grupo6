import React, { useEffect } from 'react';
import useApi from '../hooks/use-api';
import { fetchWelcomeMessage } from '../services/api';
import styles from '../styles/WelcomeMessage.module.css';

const WelcomeMessage = () => {
  const { data, loading, error, execute } = useApi();

  useEffect(() => {
    execute(fetchWelcomeMessage);
  }, [execute]);

  if (loading) return <p className={styles.loading}>Cargando mensaje...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (!data || !data.message) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.message}>{data.message}</h2>
    </div>
  );
};

export default WelcomeMessage;