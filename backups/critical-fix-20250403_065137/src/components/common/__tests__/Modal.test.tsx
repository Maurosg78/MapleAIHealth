import { 
   render, screen 
 } from '@testing-library/react'
import { 
   useState, useEffect 
 } from 'react'
import React from 'react'
describe('Modal', () => {
  import {
   Button, Input, Select, Modal, Spinner 
} from '@chakra-ui/react';

  beforeEach(() => {
    mockOnClose.mockClear();
    // Mock del elemento dialog
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('renders correctly when open', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking outside', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const overlay = screen.getByRole('button', {
      name: /cerrar modal \(clic fuera\)/i,
      hidden: true,
    });
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('llama a onClose cuando se hace clic en el botón de cerrar', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button', {
      name: /cerrar modal \(botón x\)/i,
      hidden: true,
    });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose cuando se hace clic en el overlay', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const overlay = screen.getByRole('button', {
      name: /cerrar modal \(clic fuera\)/i,
      hidden: true,
    });
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose cuando se presiona Enter en el overlay', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const overlay = screen.getByRole('button', {
      name: /cerrar modal \(clic fuera\)/i,
      hidden: true,
    });
    fireEvent.keyDown(overlay, { key: 'Enter' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('aplica clases personalizadas a través de className', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        className="custom-class"
      >
        <div>Modal content</div>
      </Modal>
    );

    expect(dialog).toHaveClass('custom-class');
  });

  it('no muestra el título cuando no se proporciona', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('muestra el contenido del modal', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div data-testid="modal-content">Contenido personalizado</div>
      </Modal>
    );

    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });
});
