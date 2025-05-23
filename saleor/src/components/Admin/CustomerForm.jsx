import React from 'react';
import { Search } from 'lucide-react';
import styles from '../../styles/CustomerForm.module.css';

const CustomerForm = ({ formData, handleChange, errors, loading, onSearch }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.subtitle}>Filtrar Clientes</h3>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Nombre
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Buscar por nombre"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            disabled={loading}
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Buscar por email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            disabled={loading}
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={styles.searchBtn}
          aria-label="Buscar clientes"
        >
          <Search size={20} />
          Buscar
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;