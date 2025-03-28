import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';
import { describe, it, expect } from 'vitest';

describe('Avatar', () => {
    it('renderiza correctamente con una imagen', () => {
        render(<Avatar src="https://example.com/avatar.jpg" alt="Usuario" />);
        const avatar = screen.getByRole('img');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
        expect(avatar).toHaveAttribute('alt', 'Usuario');
    });

    it('renderiza correctamente sin imagen, mostrando iniciales', () => {
        render(<Avatar alt="Juan Pérez" />);
        expect(screen.getByText('JP')).toBeInTheDocument();
    });

    it('aplica los tamaños correctamente', () => {
        const { rerender } = render(<Avatar size="sm" />);
        expect(screen.getByRole('img')).toHaveClass('w-8', 'h-8', 'text-sm');

        rerender(<Avatar size="md" />);
        expect(screen.getByRole('img')).toHaveClass('w-10', 'h-10', 'text-base');

        rerender(<Avatar size="lg" />);
        expect(screen.getByRole('img')).toHaveClass('w-12', 'h-12', 'text-lg');

        rerender(<Avatar size="xl" />);
        expect(screen.getByRole('img')).toHaveClass('w-16', 'h-16', 'text-xl');
    });

    it('aplica las variantes correctamente', () => {
        const { rerender } = render(<Avatar variant="circle" />);
        expect(screen.getByRole('img')).toHaveClass('rounded-full');

        rerender(<Avatar variant="square" />);
        expect(screen.getByRole('img')).toHaveClass('rounded-none');

        rerender(<Avatar variant="rounded" />);
        expect(screen.getByRole('img')).toHaveClass('rounded-lg');
    });

    it('aplica el estado deshabilitado correctamente', () => {
        render(<Avatar disabled />);
        expect(screen.getByRole('img')).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('aplica el estado de carga correctamente', () => {
        render(<Avatar isLoading />);
        const avatar = screen.getByRole('img');
        expect(avatar).toHaveClass('animate-pulse');
        expect(avatar.querySelector('div')).toHaveClass('animate-pulse');
    });

    it('aplica clases personalizadas a través de className', () => {
        render(<Avatar className="custom-class" />);
        expect(screen.getByRole('img')).toHaveClass('custom-class');
    });

    it('genera las iniciales correctamente', () => {
        const { rerender } = render(<Avatar alt="Juan Pérez" />);
        expect(screen.getByText('JP')).toBeInTheDocument();

        rerender(<Avatar alt="María José García" />);
        expect(screen.getByText('MJG')).toBeInTheDocument();

        rerender(<Avatar alt="Carlos" />);
        expect(screen.getByText('C')).toBeInTheDocument();
    });
});
