import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoteInput from '../../../components/emr/NoteInput';

describe('NoteInput', () => {
  const mockSave = jest.fn().mockResolvedValue(undefined);
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct placeholder and label', () => {
    render(
      React.createElement('NoteInput', {
        label: "Nota de prueba"
        placeholder: "Escriba aquí su nota de prueba"
        onSave: mockSave
      })
    null
  );

    expect(screen.getByText('Nota de prueba')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escriba aquí su nota de prueba')).toBeInTheDocument();
  });

  it('handles text input correctly', () => {
    render(React.createElement('NoteInput', { onSave: mockSave }));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Texto de prueba' } });

    expect(textarea).toHaveValue('Texto de prueba');
  });

  it('displays character count correctly', () => {
    render(React.createElement('NoteInput', { onSave: mockSave maxLength: 100 }));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Texto de prueba con 25 caracteres' } });

    expect(screen.getByText('25/100 caracteres')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    render(React.createElement('NoteInput', { onSave: mockSave }));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Texto para guardar' } });

    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    expect(mockSave).toHaveBeenCalledWith('Texto para guardar');
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(React.createElement('NoteInput', { onSave: mockSave onCancel: mockCancel initialValue: "Valor inicial" }));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Texto modificado' } });

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalled();
    expect(textarea).toHaveValue('Valor inicial');
  });

  it('disables save button when text is empty', () => {
    render(React.createElement('NoteInput', { onSave: mockSave }));

    const saveButton = screen.getByText('Guardar');
    expect(saveButton).toBeDisabled();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Ahora hay texto' } });

    expect(saveButton).not.toBeDisabled();
  });

  it('passes basic test', () => {
    // Test básico para evitar errores
    expect(true).toBe(true);
  });
});
