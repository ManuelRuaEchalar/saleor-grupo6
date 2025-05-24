import React, { useEffect, useState } from 'react';
import useApi from '../../hooks/use-api';
import useForm from '../../hooks/use-form';
import { fetchCustomers } from '../../services/api';
import CustomerForm from './CustomerForm';
import CustomerTable from './CustomerTable';
import styles from '../../styles/ExportCustomerCSV.module.css';

const ExportCustomersCSV = () => {
  const { data, loading, error, execute } = useApi();
  const { formData, handleChange, errors, validateForm } = useForm({
    initialValues: {
      name: '',
      email: '',
    },
    validate: (values) => {
      const errors = {};
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Correo electrónico inválido';
      }
      return errors;
    },
  });
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handleSearch = () => {
    if (validateForm()) {
      setSearchTriggered(true);
      execute(fetchCustomers, formData);
    }
  };

  // Búsqueda inicial al montar el componente
  useEffect(() => {
    execute(fetchCustomers, {}); // Sin filtros inicialmente
  }, [execute]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Exportar Clientes</h2>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}
      <CustomerForm
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        loading={loading}
        onSearch={handleSearch}
      />
      <CustomerTable customers={data || []} loading={loading} />
    </div>
  );
};

export default ExportCustomersCSV;