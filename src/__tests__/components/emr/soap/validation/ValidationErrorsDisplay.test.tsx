/** @jsx React.createElement */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ValidationErrorsDisplay } from '../../../../../components/emr/soap/validation/ValidationErrorsDisplay';

// Usamos la sintaxis jest tradicional para mayor compatibilidad
describe('ValidationErrorsDisplay', () => {
  test('renders error messages correctly', () => {
    const errors = ['Campo requerido 1', 'Campo requerido 2'];
    
    const { getByText } = render(<ValidationErrorsDisplay errors={errors} />);
    
    // Verificar que el título esté presente
    expect(getByText('Campos requeridos faltantes:')).toBeInTheDocument();
    
    // Verificar que los mensajes de error estén presentes
    expect(getByText('Campo requerido 1')).toBeInTheDocument();
    expect(getByText('Campo requerido 2')).toBeInTheDocument();
  });
  
  test('does not render when there are no errors', () => {
    const { container } = render(<ValidationErrorsDisplay errors={[]} />);
    
    // El componente no debería renderizar nada cuando no hay errores
    expect(container.firstChild).toBeNull();
  });
  
  test('applies additional class names', () => {
    const errors = ['Campo requerido'];
    const className = 'custom-class';
    
    const { container } = render(
      <ValidationErrorsDisplay errors={errors} className={className} />
    );
    
    // Verificar que la clase personalizada se aplica correctamente
    const alertElement = container.firstChild as HTMLElement;
    expect(alertElement.classList.contains('custom-class')).toBe(true);
  });
  
  test('has the correct accessibility attributes', () => {
    const errors = ['Campo requerido'];
    
    const { getByRole, getByText } = render(<ValidationErrorsDisplay errors={errors} />);
    
    // Verificar que tenga el rol de alerta
    const alertElement = getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    
    // Verificar que el título tenga el id correcto
    const title = getByText('Campos requeridos faltantes:');
    expect(title.id).toBe('validation-errors-title');
  });
}); 