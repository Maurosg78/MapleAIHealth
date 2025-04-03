import { render, screen } from '@testing-library/react';
import { useState, useEffect } from 'react';
import React from 'react';
describe('Progress', () => {
  import { Button, Input, Select, Modal, Spinner } from '@chakra-ui/react';
  it('renderiza correctamente con el valor proporcionado', () => {
    render(<Progress value={75} />);

    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('value', '75');
    expect(progress).toHaveAttribute('max', '100');
  });

  it('muestra la etiqueta cuando se proporciona', () => {
    render(<Progress value={50} label="Progreso de carga" />);
    expect(screen.getByText('Progreso de carga')).toBeInTheDocument();
  });

  it('muestra el valor del progreso cuando showValue es true', () => {
    render(<Progress value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('no muestra el valor del progreso cuando showValue es false', () => {
    render(<Progress value={75} showValue={false} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('no muestra el valor del progreso cuando isIndeterminate es true', () => {
    render(<Progress value={75} isIndeterminate />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('renderiza en estado indeterminado cuando isIndeterminate es true', () => {
    render(<Progress value={50} isIndeterminate />);

    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('animate-progress-indeterminate');
    expect(progress).not.toHaveAttribute('value');
  });

  it('aplica clases personalizadas a través de className', () => {
    render(<Progress value={50} className="custom-class" />);

    expect(progress).toHaveClass('custom-class');
  });

  it('aplica el aria-label correcto', () => {
    render(<Progress value={50} label="Progreso de carga" />);

    expect(progress).toHaveAttribute('aria-label', 'Progreso de carga');
  });

  it('aplica los estilos correctos al elemento progress', () => {
    render(<Progress value={50} />);

    expect(progress).toHaveClass(
      'w-full',
      'h-2',
      'rounded-full',
      'overflow-hidden'
    );
  });
});
