import React from 'react';
import { render, screen } from '@testing-library/react';
import { useState, useEffect } from 'react';
describe('Badge', () => {
  import { Button, Input, Select, Modal, Spinner } from '@chakra-ui/react';
  it('renderiza correctamente con el contenido proporcionado', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('aplica los estilos correctos según el tipo', () => {
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<Badge type="error">Error</Badge>);
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');

    rerender(<Badge type="warning">Warning</Badge>);
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');

    rerender(<Badge type="info">Info</Badge>);
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('aplica las variantes correctamente', () => {
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');

    rerender(<Badge variant="outlined">Outlined</Badge>);
    expect(badge).toHaveClass('border-blue-200', 'text-blue-800');

    rerender(<Badge variant="ghost">Ghost</Badge>);
    expect(badge).toHaveClass('text-blue-800');
  });

  it('aplica los tamaños correctamente', () => {
    expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5');

    rerender(<Badge size="md">Medium</Badge>);
    expect(badge).toHaveClass('text-sm', 'px-2.5', 'py-0.5');

    rerender(<Badge size="lg">Large</Badge>);
    expect(badge).toHaveClass('text-base', 'px-3', 'py-1');
  });

  it('muestra el icono cuando se proporciona', () => {
    render(<Badge icon="https://example.com/icon.svg">With Icon</Badge>);

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', 'https://example.com/icon.svg');
    expect(icon).toHaveAttribute('alt', '');
  });

  it('aplica clases personalizadas a través de className', () => {
    render(<Badge className="custom-class">Custom</Badge>);

    expect(badge).toHaveClass('custom-class');
  });

  it('aplica el tamaño correcto al icono según el tamaño del badge', () => {
    const { rerender } = render(
      <Badge size="sm" icon="https://example.com/icon.svg">
        Small
      </Badge>
    );

    expect(icon).toHaveClass('w-3', 'h-3');

    rerender(
      <Badge size="md" icon="https://example.com/icon.svg">
        Medium
      </Badge>
    );
    expect(icon).toHaveClass('w-4', 'h-4');

    rerender(
      <Badge size="lg" icon="https://example.com/icon.svg">
        Large
      </Badge>
    );
    expect(icon).toHaveClass('w-5', 'h-5');
  });
});
