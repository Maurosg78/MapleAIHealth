
describe('Card', () => {
  it('renderiza correctamente con contenido básico', () => {
    render(
      <Card>
        <div>Contenido de la tarjeta</div>
      </Card>
    );
    expect(screen.getByText('Contenido de la tarjeta')).toBeInTheDocument();
  });

  it('aplica la variante elevated correctamente', () => {
    render(
      <Card variant="elevated">
        <div>Contenido elevado</div>
      </Card>
    );
    const card = screen.getByText('Contenido elevado').parentElement;
    expect(card).toHaveClass('shadow-md');
  });

  it('aplica la variante outlined correctamente', () => {
    render(
      <Card variant="outlined">
        <div>Contenido con borde</div>
      </Card>
    );
    const card = screen.getByText('Contenido con borde').parentElement;
    expect(card).toHaveClass('border-2');
  });

  it('aplica diferentes tamaños de padding', () => {
    render(
      <Card padding="lg">
        <div>Contenido con padding grande</div>
      </Card>
    );
    const card = screen.getByText('Contenido con padding grande').parentElement;
    expect(card).toHaveClass('p-8');
  });

  it('renderiza correctamente con header, body y footer', () => {
    render(
      <Card>
        <CardHeader>Encabezado</CardHeader>
        <CardBody>Cuerpo</CardBody>
        <CardFooter>Pie de página</CardFooter>
      </Card>
    );

    expect(screen.getByText('Encabezado')).toBeInTheDocument();
    expect(screen.getByText('Cuerpo')).toBeInTheDocument();
    expect(screen.getByText('Pie de página')).toBeInTheDocument();
  });

  it('aplica clases personalizadas a través de className', () => {
    render(
      <Card className="bg-blue-100">
        <div>Contenido personalizado</div>
      </Card>
    );
    const card = screen.getByText('Contenido personalizado').parentElement;
    expect(card).toHaveClass('bg-blue-100');
  });

  it('mantiene la estructura semántica con header, body y footer', () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    const header = container.querySelector('[class*="border-b"]');
    const body = container.querySelector('[class*="px-6 py-4"]');
    const footer = container.querySelector('[class*="border-t"]');

    expect(header).toBeInTheDocument();
    expect(body).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});
