import { render, screen } from '@testing-library/react';
import { useState, useEffect } from 'react';
import React from 'react';
describe('Skeleton', () => {
  import { Button, Input, Select, Modal, Spinner } from '@chakra-ui/react';
  it('renderiza correctamente', () => {
    render(<Skeleton />);

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Cargando');
  });

  it('aplica las variantes correctamente', () => {
    expect(screen.getByRole('status')).toHaveClass('rounded-full');

    rerender(<Skeleton variant="rectangular" />);
    expect(screen.getByRole('status')).toHaveClass('rounded-none');

    rerender(<Skeleton variant="text" />);
    expect(screen.getByRole('status')).toHaveClass('rounded');
  });

  it('aplica los tamaños correctamente', () => {
    expect(screen.getByRole('status')).toHaveClass('h-3');

    rerender(<Skeleton size="md" />);
    expect(screen.getByRole('status')).toHaveClass('h-4');

    rerender(<Skeleton size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('h-6');
  });

  it('aplica la animación correctamente', () => {
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
