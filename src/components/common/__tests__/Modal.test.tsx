import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';
import { describe, it, expect, vi } from 'vitest';

describe('Modal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    it('no renderiza cuando isOpen es false', () => {
        render(
            <Modal isOpen={false} onClose={mockOnClose}>
                <div>Contenido del modal</div>
            </Modal>
        );
        expect(screen.queryByText('Contenido del modal')).not.toBeInTheDocument();
    });

    it('renderiza correctamente cuando isOpen es true', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose}>
                <div>Contenido del modal</div>
            </Modal>
        );
        expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
    });

    it('muestra el título cuando se proporciona', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Título del Modal">
                <div>Contenido del modal</div>
            </Modal>
        );
        expect(screen.getByText('Título del Modal')).toBeInTheDocument();
    });

    it('llama a onClose cuando se hace clic en el backdrop', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose}>
                <div>Contenido del modal</div>
            </Modal>
        );
        const backdrop = screen
            .getByRole('dialog')
            .parentElement?.querySelector('[aria-hidden="true"]');
        fireEvent.click(backdrop!);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('aplica diferentes tamaños correctamente', () => {
        const { rerender } = render(
            <Modal isOpen={true} onClose={mockOnClose} size="sm">
                <div>Contenido del modal</div>
            </Modal>
        );
        expect(screen.getByRole('dialog').querySelector('.max-w-sm')).toBeInTheDocument();

        rerender(
            <Modal isOpen={true} onClose={mockOnClose} size="xl">
                <div>Contenido del modal</div>
            </Modal>
        );
        expect(screen.getByRole('dialog').querySelector('.max-w-xl')).toBeInTheDocument();
    });

    it('tiene los atributos ARIA correctos', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Título del Modal">
                <div>Contenido del modal</div>
            </Modal>
        );
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('aplica clases personalizadas a través de className', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} className="bg-blue-100">
                <div>Contenido del modal</div>
            </Modal>
        );
        const modalContent = screen.getByRole('dialog').querySelector('.bg-blue-100');
        expect(modalContent).toBeInTheDocument();
    });
});
