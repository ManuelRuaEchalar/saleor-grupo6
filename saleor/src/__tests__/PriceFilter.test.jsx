import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import PriceFilter from './components/PriceFilter';

describe('PriceFilter Component', () => {
  const mockOnApplyFilter = jest.fn();
  
  beforeEach(() => {
    mockOnApplyFilter.mockClear();
  });

  test('renders without crashing', () => {
    render(<PriceFilter onApplyFilter={mockOnApplyFilter} />);
    expect(screen.getByText('Filtro de precio')).toBeInTheDocument();
  });

  test('shows input fields with default values', () => {
    render(<PriceFilter onApplyFilter={mockOnApplyFilter} />);
    
    const minInput = screen.getByPlaceholderText('0.00');
    const maxInput = screen.getByPlaceholderText('999.00');
    
    expect(minInput).toHaveValue('0.00');
    expect(maxInput).toHaveValue('999.00');
  });

  test('updates min price through range slider', async () => {
    render(<PriceFilter onApplyFilter={mockOnApplyFilter} />);
    
    const minSlider = screen.getByLabelText('Precio mínimo');
    const minInput = screen.getByPlaceholderText('0.00');
    
    fireEvent.change(minSlider, { target: { value: '50' } });
    
    await waitFor(() => {
      expect(minInput).toHaveValue('50.00');
    });
  });

  test('updates max price through range slider', async () => {
    render(<PriceFilter onApplyFilter={mockOnApplyFilter} />);
    
    const maxSlider = screen.getByLabelText('Precio máximo');
    const maxInput = screen.getByPlaceholderText('999.00');
    
    fireEvent.change(maxSlider, { target: { value: '500' } });
    
    await waitFor(() => {
      expect(maxInput).toHaveValue('500.00');
    });
  });

  test('allows direct input in the min price field', async () => {
    render(<PriceFilter onApplyFilter={mockOnApplyFilter} />);
    
    const minInput = screen.getByPlaceholderText('0.00');
    
    fireEvent.change(minInput, { target: { value: '25.75' } });
    fireEvent.blur(minInput);
    
    await waitFor(() => {
      expect(minInput).toHaveValue('25.75');
    });
  });

  test('allows direct input in the max price field', async () => {
    render(<PriceFilter onApplyFilter={mockOnApplyFilter} />);
    
    const maxInput = screen.getByPlaceholderText('999.00');
    
    fireEvent.change(maxInput, { target: { value: '750.50' } });
    fireEvent.blur(maxInput);
    
    await waitFor(() => {
      expect(maxInput).toHaveValue('750.50');
    });
  });

  test('calls onApplyFilter with correct values when apply button is clicked', () => {
    render(<PriceFilter onApplyFilter={mockOnApplyFilter} />);
    
    const minInput = screen.getByPlaceholderText('0.00');
    const maxInput = screen.getByPlaceholderText('999.00');
    const applyButton = screen.getByText('Aplicar filtro');
    
    fireEvent.change(minInput, { target: { value: '10.50' } });
    fireEvent.change(maxInput, { target: { value: '200.75' } });
    fireEvent.click(applyButton);
    
    expect(mockOnApplyFilter).toHaveBeenCalledWith(10.5, 200.75);
  });

  test('shows clean filter button when activeFilter prop is provided', () => {
    render(<PriceFilter 
      onApplyFilter={mockOnApplyFilter} 
      activeFilter={{ min: 10, max: 200 }} 
    />);
    
    expect(screen.getByText('Limpiar filtro')).toBeInTheDocument();
  });

  test('calls onApplyFilter with null when clean filter button is clicked', () => {
    render(<PriceFilter 
      onApplyFilter={mockOnApplyFilter} 
      activeFilter={{ min: 10, max: 200 }} 
    />);
    
    const cleanButton = screen.getByText('Limpiar filtro');
    fireEvent.click(cleanButton);
    
    expect(mockOnApplyFilter).toHaveBeenCalledWith(null);
  });
});