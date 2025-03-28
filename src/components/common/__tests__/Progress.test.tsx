import { render, screen } from '@testing-library/react';
import { Progress } from '../Progress';
import { describe, it, expect } from 'vitest';

describe('Progress', () => {
    it('renderiza correctamente con el valor proporcionado', () => {
        render(<Progress value={75} />);
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '75');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('aplica los estilos correctos según el tipo', () => {
        const { rerender } = render(<Progress value={50} type="success" />);
        expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('bg-green-600');

        rerender(<Progress value={50} type="error" />);
        expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('bg-red-600');

        rerender(<Progress value={50} type="warning" />);
        expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('bg-yellow-600');

        rerender(<Progress value={50} type="info" />);
        expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('bg-blue-600');
    });

    it('aplica los tamaños correctamente', () => {
        const { rerender } = render(<Progress value={50} size="sm" />);
        expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-1.5');

        rerender(<Progress value={50} size="md" />);
        expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-2');

        rerender(<Progress value={50} size="lg" />);
        expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-3');
    });

    it('muestra el estado indeterminado correctamente', () => {
        render(<Progress value={50} isIndeterminate />);
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-busy', 'true');
        expect(progressBar).not.toHaveAttribute('aria-valuenow');
        expect(progressBar.querySelector('div')).toHaveClass('animate-progress-indeterminate');
    });

    it('aplica el estado deshabilitado correctamente', () => {
        render(<Progress value={50} disabled />);
        expect(screen.getByRole('progressbar')).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('limita el valor entre 0 y 100', () => {
        const { rerender } = render(<Progress value={150} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

        rerender(<Progress value={-50} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('aplica clases personalizadas a través de className', () => {
        render(<Progress value={50} className="custom-class" />);
        expect(screen.getByRole('progressbar')).toHaveClass('custom-class');
    });
});
