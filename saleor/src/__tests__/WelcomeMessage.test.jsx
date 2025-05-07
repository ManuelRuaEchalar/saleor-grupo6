import { render, screen } from '@testing-library/react';
import WelcomeMessage from '../src/components/WelcomeMessage';

describe('WelcomeMessage', () => {
  it('debería renderizar el mensaje cuando se proporciona', () => {
    render(<WelcomeMessage message="¡Bienvenido a la tienda!" />);
    expect(screen.getByText(/bienvenido a la tienda/i)).toBeInTheDocument();
  });

  it('no debería renderizar nada si no se pasa mensaje', () => {
    const { container } = render(<WelcomeMessage message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
