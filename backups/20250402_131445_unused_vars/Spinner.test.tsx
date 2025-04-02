import React from "react";
import { render, screen } from "@testing-library/react";import { useState, useEffect } from "react";describe('Spinner', () => {
import { Button, Input, Select, Modal, Spinner } from "@chakra-ui/react";  it('renderiza correctamente', () => {
    render(<Spinner />);

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Cargando');
  });

  it('aplica los estilos correctos según el tipo', () => {

    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'text-green-600'
    );

    rerender(<Spinner type="error" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'text-red-600'
    );

    rerender(<Spinner type="warning" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'text-yellow-600'
    );

    rerender(<Spinner type="info" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'text-blue-600'
    );
  });

  it('aplica los tamaños correctamente', () => {

    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'w-4',
      'h-4'
    );

    rerender(<Spinner size="md" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'w-6',
      'h-6'
    );

    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'w-8',
      'h-8'
    );
  });

  it('aplica el estado deshabilitado correctamente', () => {
    render(<Spinner disabled />);
    expect(screen.getByRole('status')).toHaveClass('opacity-50');
  });

  it('aplica clases personalizadas a través de className', () => {
    render(<Spinner className="custom-class" />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('tiene la estructura SVG correcta', () => {
    render(<Spinner />);

    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg?.querySelector('circle')).toBeInTheDocument();
    expect(svg?.querySelector('path')).toBeInTheDocument();
  });
});
