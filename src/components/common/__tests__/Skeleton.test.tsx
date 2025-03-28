import { render, screen } from '@testing-library/react';
import { Skeleton } from '../Skeleton';
import { describe, it, expect } from 'vitest';

describe('Skeleton', () => {
    it('renderiza correctamente', () => {
        render(<Skeleton />);
        const skeleton = screen.getByRole('status');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveAttribute('aria-label', 'Cargando');
    });

    it('aplica las variantes correctamente', () => {
        const { rerender } = render(<Skeleton variant="circular" />);
        expect(screen.getByRole('status')).toHaveClass('rounded-full');

        rerender(<Skeleton variant="rectangular" />);
        expect(screen.getByRole('status')).toHaveClass('rounded-none');

        rerender(<Skeleton variant="text" />);
        expect(screen.getByRole('status')).toHaveClass('rounded');
    });

    it('aplica los tamaños correctamente', () => {
        const { rerender } = render(<Skeleton size="sm" />);
        expect(screen.getByRole('status')).toHaveClass('h-3');

        rerender(<Skeleton size="md" />);
        expect(screen.getByRole('status')).toHaveClass('h-4');

        rerender(<Skeleton size="lg" />);
        expect(screen.getByRole('status')).toHaveClass('h-6');
    });

    it('aplica la animación correctamente', () => {
        const { rerender } = render(<Skeleton animated />);
        expect(screen.getByRole('status')).toHaveClass('animate-pulse');

        rerender(<Skeleton animated={false} />);
        expect(screen.getByRole('status')).not.toHaveClass('animate-pulse');
    });

    it('aplica clases personalizadas a través de className', () => {
        render(<Skeleton className="custom-class" />);
        expect(screen.getByRole('status')).toHaveClass('custom-class');
    });

    it('tiene el color de fondo correcto', () => {
        render(<Skeleton />);
        expect(screen.getByRole('status')).toHaveClass('bg-gray-200');
    });
});
