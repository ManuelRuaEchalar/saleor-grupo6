const request = require('supertest');
const app = require('../app'); // Ajusta la ruta si es necesario

describe('Exportación de clientes a CSV', () => {
  test('Debe exportar clientes correctamente en formato CSV', async () => {
    const res = await request(app)
      .get('/api/customers/export/csv')
      .expect(200);

    // Verifica el tipo de contenido
    expect(res.headers['content-type']).toMatch(/text\/csv/);

    // Verifica que se proporciona un nombre de archivo
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="clientes_/);

    // Verifica que contiene headers CSV válidos
    expect(res.text).toContain('ID;Nombre;Email;Teléfono;Tipo de Cliente;Notas');

    // Verifica que hay al menos una fila de datos si hay clientes
    const lines = res.text.trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(1); // Al menos encabezado
  });
});
