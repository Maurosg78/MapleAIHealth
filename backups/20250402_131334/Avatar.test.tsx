import React from "react";
import { render, screen } from "@testing-library/react";import { useState, useEffect } from "react";describe('Avatar', () => {
import { Button, Input, Select, Modal, Spinner } from "@chakra-ui/react";  it('renderiza correctamente con una imagen', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Usuario" />);
    const container = screen.getByRole('img').parentElement;
    const img = screen.getByAltText('Usuario');
    expect(container).toBeInTheDocument();
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'Usuario');
  });

  it('renderiza correctamente sin imagen, mostrando iniciales', () => {
    render(<Avatar alt="Juan Pérez" />);
    const container = screen.getByText('JP').parentElement;
    expect(container).toBeInTheDocument();
    expect(screen.getByText('JP')).toBeInTheDocument();
    expect(screen.getByText('JP')).toHaveAttribute('aria-label', 'Juan Pérez');
  });

  it('aplica los tamaños correctamente', () => {
    const { rerender } = render(
      <Avatar size="sm" src="https://example.com/avatar.jpg" />
    );
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('w-8', 'h-8', 'text-sm');

    rerender(<Avatar size="md" src="https://example.com/avatar.jpg" />);
    expect(container).toHaveClass('w-10', 'h-10', 'text-base');

    rerender(<Avatar size="lg" src="https://example.com/avatar.jpg" />);
    expect(container).toHaveClass('w-12', 'h-12', 'text-lg');

    rerender(<Avatar size="xl" src="https://example.com/avatar.jpg" />);
    expect(container).toHaveClass('w-16', 'h-16', 'text-xl');
  });

  it('aplica las variantes correctamente', () => {
    const { rerender } = render(
      <Avatar variant="circle" src="https://example.com/avatar.jpg" />
    );
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('rounded-full');

    rerender(<Avatar variant="square" src="https://example.com/avatar.jpg" />);
    expect(container).toHaveClass('rounded-none');

    rerender(<Avatar variant="rounded" src="https://example.com/avatar.jpg" />);
    expect(container).toHaveClass('rounded-lg');
  });

  it('aplica el estado deshabilitado correctamente', () => {
    render(<Avatar disabled src="https://example.com/avatar.jpg" />);
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('aplica el estado de carga correctamente', () => {
    render(<Avatar isLoading src="https://example.com/avatar.jpg" />);
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('animate-pulse');
    expect(container.querySelector('div')).toHaveClass('animate-pulse');
  });

  it('aplica clases personalizadas a través de className', () => {
    render(
      <Avatar className="custom-class" src="https://example.com/avatar.jpg" />
    );
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('custom-class');
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
