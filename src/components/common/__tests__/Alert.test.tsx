import { render, screen } from '@testing-library/react';
import { Alert } from '../Alert';
import { describe, it, expect } from 'vitest';

describe('Alert', () => {
    it('renderiza correctamente con el contenido proporcionado', () => {
        render(<Alert>Mensaje de alerta</Alert>);
        expect(screen.getByText('Mensaje de alerta')).toBeInTheDocument();
    });

    it('muestra el título cuando se proporciona', () => {
        render(<Alert title="Título de la alerta">Mensaje de alerta</Alert>);
        expect(screen.getByText('Título de la alerta')).toBeInTheDocument();
    });

    it('aplica los estilos correctos según el tipo', () => {
        const { rerender } = render(<Alert type="success">Mensaje de éxito</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

        rerender(<Alert type="error">Mensaje de error</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('bg-red-50');

        rerender(<Alert type="warning">Mensaje de advertencia</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');

        rerender(<Alert type="info">Mensaje informativo</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
    });

    it('aplica las variantes correctamente', () => {
        const { rerender } = render(<Alert variant="solid">Mensaje sólido</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');

        rerender(<Alert variant="outlined">Mensaje outline</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('bg-white');

        rerender(<Alert variant="ghost">Mensaje ghost</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('bg-transparent');
    });

    it('muestra el icono correcto según el tipo', () => {
        const { rerender } = render(<Alert type="success">Mensaje</Alert>);
        expect(screen.getByRole('alert').querySelector('.text-green-400')).toBeInTheDocument();

        rerender(<Alert type="error">Mensaje</Alert>);
        expect(screen.getByRole('alert').querySelector('.text-red-400')).toBeInTheDocument();

        rerender(<Alert type="warning">Mensaje</Alert>);
        expect(screen.getByRole('alert').querySelector('.text-yellow-400')).toBeInTheDocument();

        rerender(<Alert type="info">Mensaje</Alert>);
        expect(screen.getByRole('alert').querySelector('.text-blue-400')).toBeInTheDocument();
    });

    it('permite personalizar el icono', () => {
        const customIcon = <span data-testid="custom-icon">🔔</span>;
        render(<Alert icon={customIcon}>Mensaje</Alert>);
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('tiene los atributos ARIA correctos', () => {
        render(<Alert>Mensaje</Alert>);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('aplica clases personalizadas a través de className', () => {
        render(<Alert className="custom-class">Mensaje</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });
});
