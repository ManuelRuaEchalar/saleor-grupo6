import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Mock para fetch
global.fetch = jest.fn();

// Datos de prueba
const mockProducts = [
  {"id":1,"name":"Producto 1","description":"Descripción del producto 1","price":9.99,"stock":45,"image":"https://images.philips.com/is/image/philipsconsumer/82297dea811e471aa356b16f00253629?$pnglarge$&wid=1250","createdAt":"2025-04-30T04:38:00.000Z","updatedAt":"2025-04-30T04:54:18.000Z"},
  {"id":2,"name":"Producto 2","description":"Descripción del producto 2","price":9.99,"stock":41,"image":"https://www.tiendaamiga.com.bo/media/catalog/product/cache/deb88dadd509903c96aaa309d3e790dc/1/2/1279.gif","createdAt":"2025-04-30T04:38:00.000Z","updatedAt":"2025-05-02T12:00:18.000Z"}
];


test('muestra mensaje de error si fetch falla', async () => {
  // Configura el mock de fetch para rechazar la promesa
  fetch.mockRejectedValueOnce(new Error('Error de red'));
  
  // Renderiza el componente
  render(<App />);
  
  // Espera a que aparezca el mensaje de error
  await waitFor(() => {
    expect(screen.getByText('No se pudieron cargar los productos. Intente nuevamente más tarde.')).toBeInTheDocument();
  });
  
  // Verifica que el botón de reintentar esté presente
  expect(screen.getByText('Reintentar')).toBeInTheDocument();
});