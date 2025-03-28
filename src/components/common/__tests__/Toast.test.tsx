import { render, screen, act } from '@testing-library/react';
import { Toast } from '../Toast';
import { describe, it, expect, vi } from 'vitest';

describe('Toast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renderiza correctamente con el mensaje proporcionado', () => {
        render(<Toast message="Mensaje de prueba" />);
        expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
    });

    it('aplica los estilos correctos según el tipo', () => {
        const { rerender } = render(<Toast message="Mensaje de éxito" type="success" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

        rerender(<Toast message="Mensaje de error" type="error" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-red-50');

        rerender(<Toast message="Mensaje de advertencia" type="warning" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');

        rerender(<Toast message="Mensaje informativo" type="info" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
    });

    it('aplica la posición correcta', () => {
        const { rerender } = render(<Toast message="Mensaje" position="top-right" />);
        expect(screen.getByRole('alert')).toHaveClass('top-4', 'right-4');

        rerender(<Toast message="Mensaje" position="bottom-left" />);
        expect(screen.getByRole('alert')).toHaveClass('bottom-4', 'left-4');
    });

    it('llama a onClose después del tiempo especificado', () => {
        const onClose = vi.fn();
        render(<Toast message="Mensaje" duration={1000} onClose={onClose} />);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('tiene los atributos ARIA correctos', () => {
        render(<Toast message="Mensaje" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('aplica clases personalizadas a través de className', () => {
        render(<Toast message="Mensaje" className="custom-class" />);
        expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });

    it('muestra el icono correcto según el tipo', () => {
        const { rerender } = render(<Toast message="Mensaje" type="success" />);
        expect(screen.getByRole('alert').querySelector('.text-green-400')).toBeInTheDocument();

        rerender(<Toast message="Mensaje" type="error" />);
        expect(screen.getByRole('alert').querySelector('.text-red-400')).toBeInTheDocument();

        rerender(<Toast message="Mensaje" type="warning" />);
        expect(screen.getByRole('alert').querySelector('.text-yellow-400')).toBeInTheDocument();

        rerender(<Toast message="Mensaje" type="info" />);
        expect(screen.getByRole('alert').querySelector('.text-blue-400')).toBeInTheDocument();
    });
});
