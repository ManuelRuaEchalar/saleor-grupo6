import React from 'react';
import { render, screen } from '@testing-library/react';
import WelcomeMessage from '../components/WelcomeMessage';

describe('WelcomeMessage', () => {
  it('debería renderizar el mensaje cuando se proporciona', () => {
    render(<WelcomeMessage message="Hoy hay descuentos! No te los pierdas!" />);
    expect(screen.getByText(/hoy hay descuentos/i)).toBeInTheDocument();
  });

  it('no debería renderizar nada si no se pasa mensaje', () => {
    const { container } = render(<WelcomeMessage message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
