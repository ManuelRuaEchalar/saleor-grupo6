import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormPago from '../components/FormPago';

describe('FormPago', () => {
  const mockCartItems = [{ id: 1, productId: 1, name: 'Test', price: 10, quantity: 1 }];
  
  it('muestra error si se intenta continuar sin datos de tarjeta', () => {
    render(<FormPago cartItems={mockCartItems} total={10} onClose={() => {}} />);
    
    const continuarBtn = screen.getByText(/continuar/i);
    fireEvent.click(continuarBtn);
    
    expect(screen.getByText(/complete todos los campos de la tarjeta/i)).toBeInTheDocument();
  });
});
