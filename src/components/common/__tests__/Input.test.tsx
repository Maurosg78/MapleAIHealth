import { 
   render, screen 
 } from '@testing-library/react'
import { 
   useState, useEffect 
 } from 'react'
import React from 'react'
describe('Input', () => {
  import {
   Button, Input, Select, Modal, Spinner 
} from '@chakra-ui/react';
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
    render(<Input leftIcon={leftIcon} rightIcon={rightIcon} />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('llama a onChange cuando se cambia el valor', () => {
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
