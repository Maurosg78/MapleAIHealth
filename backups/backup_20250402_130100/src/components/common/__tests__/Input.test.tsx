import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';
import { describe, it, expect, vi } from 'vitest';

describe('Input', () => {
  it('renderiza correctamente con el label proporcionado', () => {
    render(<Input label="Nombre" />);
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });

  it('muestra el error cuando se proporciona', () => {
    render(<Input error="Este campo es requerido" />);
    expect(screen.getByText('Este campo es requerido')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('muestra el texto de ayuda cuando se proporciona', () => {
    render(<Input helperText="Ingresa tu nombre completo" />);
    expect(screen.getByText('Ingresa tu nombre completo')).toBeInTheDocument();
  });

  it('muestra los iconos izquierdo y derecho cuando se proporcionan', () => {
    const leftIcon = <span data-testid="left-icon">🔍</span>;
    const rightIcon = <span data-testid="right-icon">✓</span>;

    render(<Input leftIcon={leftIcon} rightIcon={rightIcon} />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('llama a onChange cuando se cambia el valor', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it('está deshabilitado cuando se proporciona la prop disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('aplica la clase fullWidth cuando se proporciona la prop fullWidth', () => {
    render(<Input fullWidth />);
    expect(
      screen.getByRole('textbox').parentElement?.parentElement
    ).toHaveClass('w-full');
  });
});
