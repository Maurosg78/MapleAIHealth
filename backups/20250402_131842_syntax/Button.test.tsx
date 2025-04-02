import React from "react";
import { render, screen } from "@testing-library/react";import { useState, useEffect } from "react";describe('Button', () => {
import { Button, Input, Select, Modal, Spinner } from "@chakra-ui/react";  it('renderiza correctamente con el texto proporcionado', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('aplica la variante primary por defecto', () => {
    render(<Button>Click me</Button>);

    expect(button).toHaveClass('bg-primary-600');
  });

  it('aplica la variante secondary cuando se especifica', () => {
    render(<Button variant="secondary">Click me</Button>);

    expect(button).toHaveClass('bg-secondary-600');
  });

  it('muestra el estado de carga cuando isLoading es true', () => {
    render(<Button isLoading>Click me</Button>);

    expect(button).toHaveClass('disabled:opacity-50');
    expect(button).toBeDisabled();
  });

  it('llama a onClick cuando se hace clic', () => {

    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no llama a onClick cuando está deshabilitado', () => {

    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('muestra los iconos izquierdo y derecho cuando se proporcionan', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        Click me
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
