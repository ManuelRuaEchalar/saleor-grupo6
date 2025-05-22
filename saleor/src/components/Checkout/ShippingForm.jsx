import React from 'react';
import styles from '../../styles/ShippingForm.module.css';

const ShippingForm = ({ formData, handleChange, errors }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.subtitle}>Información de Envío</h3>
      <label className={styles.label}>
        Dirección
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Calle, número, colonia"
          className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
        />
        {errors.address && (
          <span className={styles.errorText}>{errors.address}</span>
        )}
      </label>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Ciudad
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Ciudad"
            className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
          />
          {errors.city && <span className={styles.errorText}>{errors.city}</span>}
        </label>
        <label className={styles.label}>
          Código Postal
          <input
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="12345"
            maxLength="5"
            className={`${styles.input} ${errors.zipCode ? styles.inputError : ''}`}
          />
          {errors.zipCode && (
            <span className={styles.errorText}>{errors.zipCode}</span>
          )}
        </label>
      </div>
      <label className={styles.label}>
        Teléfono
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="123 456 7890"
          className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
        />
        {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
      </label>
      <div className={styles.checkboxGroup}>
        <label>
          <input
            type="checkbox"
            name="subscribeToNewsletter"
            checked={formData.subscribeToNewsletter}
            onChange={handleChange}
          />
          Deseo recibir promociones y noticias por correo electrónico
        </label>
      </div>
    </div>
  );
};

export default ShippingForm;