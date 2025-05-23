import React from 'react';
import useForm from '../../hooks/useForm';
import styles from '../../styles/PriceFilter.module.css';

const PriceFilter = ({ onApplyFilter, activeFilter }) => {
  const { formData, handleChange, errors, validateForm } = useForm({
    initialValues: {
      minPrice: activeFilter?.min?.toString() || '',
      maxPrice: activeFilter?.max?.toString() || '',
    },
    validate: (values) => {
      const errors = {};
      if (values.minPrice && (isNaN(values.minPrice) || values.minPrice < 0)) {
        errors.minPrice = 'Precio mínimo debe ser un número positivo';
      }
      if (values.maxPrice && (isNaN(values.maxPrice) || values.maxPrice < 0)) {
        errors.maxPrice = 'Precio máximo debe ser un número positivo';
      }
      if (
        values.minPrice &&
        values.maxPrice &&
        Number(values.minPrice) > Number(values.maxPrice)
      ) {
        errors.maxPrice = 'Precio máximo debe ser mayor que el mínimo';
      }
      return errors;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const min = formData.minPrice ? Number(formData.minPrice) : null;
      const max = formData.maxPrice ? Number(formData.maxPrice) : null;
      onApplyFilter(min, max);
    }
  };

  const handleReset = () => {
    onApplyFilter(null, null); // Reset filters
    handleChange({ target: { name: 'minPrice', value: '' } });
    handleChange({ target: { name: 'maxPrice', value: '' } });
  };

  return (
    <div className={styles.priceFilter}>
      <h3>Filtrar por Precio</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="minPrice">Precio Mínimo</label>
          <input
            id="minPrice"
            type="number"
            name="minPrice"
            value={formData.minPrice}
            onChange={handleChange}
            placeholder="Mínimo"
            className={styles.input}
          />
          {errors.minPrice && <span className={styles.error}>{errors.minPrice}</span>}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="maxPrice">Precio Máximo</label>
          <input
            id="maxPrice"
            type="number"
            name="maxPrice"
            value={formData.maxPrice}
            onChange={handleChange}
            placeholder="Máximo"
            className={styles.input}
          />
          {errors.maxPrice && <span className={styles.error}>{errors.maxPrice}</span>}
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.applyButton}>
            Aplicar Filtros
          </button>
          <button type="button" onClick={handleReset} className={styles.resetButton}>
            Limpiar Filtros
          </button>
        </div>
      </form>
    </div>
  );
};

export default PriceFilter;