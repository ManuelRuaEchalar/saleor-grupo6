import React from 'react';
import styles from '../../styles/CustomerTable.module.css';

const CustomerTable = ({ customers, loading }) => {
  const exportToCSV = () => {
    const headers = [
      'ID,Nombre,Email,Teléfono,Tipo de Cliente,Notas,Fecha de Registro,Fecha de Actualización',
    ];
    const rows = customers.map((customer) =>
      [
        customer.id,
        `"${customer.name}"`, // Comillas para manejar comas en el nombre
        customer.email,
        customer.phone || '',
        customer.customer_type || '',
        customer.notes ? `"${customer.notes}"` : '', // Comillas para manejar comas
        new Date(customer.createdAt).toLocaleDateString(),
        new Date(customer.updatedAt).toLocaleDateString(),
      ].join(',')
    );

    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.subtitle}>Lista de Clientes</h3>
        <button
          onClick={exportToCSV}
          disabled={loading || customers.length === 0}
          className={styles.exportBtn}
        >
          Exportar a CSV
        </button>
      </div>
      {loading ? (
        <p className={styles.loading}>Cargando clientes...</p>
      ) : customers.length === 0 ? (
        <p className={styles.empty}>No se encontraron clientes</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo de Cliente</th>
              <th>Notas</th>
              <th>Fecha de Registro</th>
              <th>Fecha de Actualización</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.customer_type || '-'}</td>
                <td>{customer.notes || '-'}</td>
                <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                <td>{new Date(customer.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerTable;