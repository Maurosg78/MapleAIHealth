import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';
import { describe, it, expect } from 'vitest';

describe('Badge', () => {
    it('renderiza correctamente con el contenido proporcionado', () => {
        render(<Badge>Nuevo</Badge>);
        expect(screen.getByText('Nuevo')).toBeInTheDocument();
    });

    it('aplica los estilos correctos según el tipo', () => {
        const { rerender } = render(<Badge type="success">Éxito</Badge>);
        expect(screen.getByText('Éxito')).toHaveClass('bg-green-100');

        rerender(<Badge type="error">Error</Badge>);
        expect(screen.getByText('Error')).toHaveClass('bg-red-100');

        rerender(<Badge type="warning">Advertencia</Badge>);
        expect(screen.getByText('Advertencia')).toHaveClass('bg-yellow-100');

        rerender(<Badge type="info">Info</Badge>);
        expect(screen.getByText('Info')).toHaveClass('bg-blue-100');
    });

    it('aplica las variantes correctamente', () => {
        const { rerender } = render(<Badge variant="solid">Sólido</Badge>);
        expect(screen.getByText('Sólido')).toHaveClass('bg-blue-100');

        rerender(<Badge variant="outlined">Outline</Badge>);
        expect(screen.getByText('Outline')).toHaveClass('bg-white');

        rerender(<Badge variant="ghost">Ghost</Badge>);
        expect(screen.getByText('Ghost')).toHaveClass('bg-transparent');
    });

    it('aplica los tamaños correctamente', () => {
        const { rerender } = render(<Badge size="sm">Pequeño</Badge>);
        expect(screen.getByText('Pequeño')).toHaveClass('text-xs');

        rerender(<Badge size="md">Mediano</Badge>);
        expect(screen.getByText('Mediano')).toHaveClass('text-sm');

        rerender(<Badge size="lg">Grande</Badge>);
        expect(screen.getByText('Grande')).toHaveClass('text-base');
    });

    it('muestra el icono correcto según el tipo', () => {
        const { rerender } = render(<Badge type="success">Éxito</Badge>);
        expect(screen.getByText('Éxito').querySelector('.text-green-800')).toBeInTheDocument();

        rerender(<Badge type="error">Error</Badge>);
        expect(screen.getByText('Error').querySelector('.text-red-800')).toBeInTheDocument();

        rerender(<Badge type="warning">Advertencia</Badge>);
        expect(
            screen.getByText('Advertencia').querySelector('.text-yellow-800')
        ).toBeInTheDocument();

        rerender(<Badge type="info">Info</Badge>);
        expect(screen.getByText('Info').querySelector('.text-blue-800')).toBeInTheDocument();
    });

    it('permite personalizar el icono', () => {
        const customIcon = <span data-testid="custom-icon">🔔</span>;
        render(<Badge icon={customIcon}>Personalizado</Badge>);
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('aplica clases personalizadas a través de className', () => {
        render(<Badge className="custom-class">Personalizado</Badge>);
        expect(screen.getByText('Personalizado')).toHaveClass('custom-class');
    });

    it('tiene la estructura correcta con icono y texto', () => {
        render(<Badge>Texto con icono</Badge>);
        const badge = screen.getByText('Texto con icono');
        expect(badge.parentElement).toHaveClass('inline-flex', 'items-center');
        expect(badge.previousElementSibling).toHaveClass('flex-shrink-0');
    });
});
