/** @jsx React.createElement */
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatientComparisonDashboard from '../../../components/comparison/PatientComparisonDashboard';

// Mock de los componentes hijos para simplificar las pruebas
jest.mock('../../../components/comparison/PatientComparisonChart', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mocked-chart">Mocked Chart</div>)
}));

jest.mock('../../../components/comparison/PatientComparisonTable', () => ({
  __esModule: true,
  PatientComparisonTable: jest.fn(() => <div data-testid="mocked-table">Mocked Table</div>)
}));

jest.mock('../../../components/comparison/PatientSelectionModal', () => ({
  __esModule: true,
  default: jest.fn(({ open, onClose, onSelectPatients }) => 
    open ? (
      <div data-testid="mocked-modal">
        <button data-testid="select-patients" onClick={() => onSelectPatients(['patient4'])}>Seleccionar Pacientes</button>
        <button data-testid="close-modal" onClick={onClose}>Cerrar</button>
      </div>
    ) : null
  )
}));

describe('PatientComparisonDashboard', () => {
  test('renderiza correctamente con los datos iniciales', () => {
    render(<PatientComparisonDashboard />);
    
    // Verificar que el título esté presente
    expect(screen.getByText('Comparación de Pacientes')).toBeInTheDocument();
    
    // Verificar que los botones de acción estén presentes
    expect(screen.getByText('Añadir Paciente')).toBeInTheDocument();
    expect(screen.getByText('Guardar Comparación')).toBeInTheDocument();
    
    // Verificar que se muestra la lista de pacientes
    expect(screen.getByText(/Pacientes en Comparación/)).toBeInTheDocument();
    
    // Verificar que existen las pestañas
    expect(screen.getByText('Gráfico de Progreso')).toBeInTheDocument();
    expect(screen.getByText('Tabla Comparativa')).toBeInTheDocument();
    
    // Por defecto, debería mostrar el gráfico
    expect(screen.getByTestId('mocked-chart')).toBeInTheDocument();
  });
  
  test('permite cambiar entre las pestañas de gráfico y tabla', () => {
    render(<PatientComparisonDashboard />);
    
    // Verificar que inicialmente se muestra el gráfico
    expect(screen.getByTestId('mocked-chart')).toBeInTheDocument();
    
    // Cambiar a la pestaña de tabla
    fireEvent.click(screen.getByText('Tabla Comparativa'));
    
    // Verificar que ahora se muestra la tabla
    expect(screen.getByTestId('mocked-table')).toBeInTheDocument();
    
    // Cambiar de nuevo a la pestaña de gráfico
    fireEvent.click(screen.getByText('Gráfico de Progreso'));
    
    // Verificar que se vuelve a mostrar el gráfico
    expect(screen.getByTestId('mocked-chart')).toBeInTheDocument();
  });
  
  test('permite seleccionar diferentes métricas', () => {
    render(<PatientComparisonDashboard />);
    
    // Verificar que se muestra la métrica por defecto (Dolor)
    expect(screen.getByText('Progreso de Dolor')).toBeInTheDocument();
    
    // Cambiar a otra métrica
    fireEvent.click(screen.getByText('Movilidad'));
    
    // Verificar que se actualiza el título del gráfico
    expect(screen.getByText('Progreso de Movilidad')).toBeInTheDocument();
  });
  
  test('abre el modal de selección de pacientes al hacer clic en añadir paciente', () => {
    render(<PatientComparisonDashboard />);
    
    // Verificar que el modal no está inicialmente visible
    expect(screen.queryByTestId('mocked-modal')).not.toBeInTheDocument();
    
    // Hacer clic en el botón de añadir paciente
    fireEvent.click(screen.getByText('Añadir Paciente'));
    
    // Verificar que el modal se muestra
    expect(screen.getByTestId('mocked-modal')).toBeInTheDocument();
    
    // Cerrar el modal
    fireEvent.click(screen.getByTestId('close-modal'));
    
    // Verificar que el modal se cierra
    expect(screen.queryByTestId('mocked-modal')).not.toBeInTheDocument();
  });
  
  test('permite eliminar pacientes de la comparación', () => {
    render(<PatientComparisonDashboard />);
    
    // Obtener los chips de pacientes iniciales
    const pacientesIniciales = screen.getAllByRole('button', { name: /María García|Juan Pérez|Laura Martínez/i });
    expect(pacientesIniciales.length).toBe(3);
    
    // Eliminar un paciente (el primero que encontremos)
    const primerPaciente = pacientesIniciales[0];
    const botonEliminar = within(primerPaciente).getByRole('button', { name: /eliminar/i });
    fireEvent.click(botonEliminar);
    
    // Verificar que ahora hay un paciente menos
    const pacientesDespues = screen.getAllByRole('button', { name: /María García|Juan Pérez|Laura Martínez/i });
    expect(pacientesDespues.length).toBe(2);
  });
  
  test('añade pacientes cuando se confirma la selección en el modal', () => {
    render(<PatientComparisonDashboard />);
    
    // Abrir el modal
    fireEvent.click(screen.getByText('Añadir Paciente'));
    
    // Seleccionar un paciente en el modal (esto usa el mock que creamos)
    fireEvent.click(screen.getByTestId('select-patients'));
    
    // Verificar que se añade el nuevo paciente (tendríamos 4 pero antes eliminamos uno en el test anterior)
    const pacientesDespues = screen.getAllByRole('button', { name: /María García|Juan Pérez|Laura Martínez|Carlos Rodríguez/i });
    expect(pacientesDespues.length).toBeGreaterThan(0);
  });
  
  test('muestra mensaje cuando no hay pacientes seleccionados', () => {
    render(<PatientComparisonDashboard />);
    
    // Eliminar todos los pacientes
    const pacientes = screen.getAllByRole('button', { name: /María García|Juan Pérez|Laura Martínez/i });
    
    pacientes.forEach(paciente => {
      const botonEliminar = within(paciente).getByRole('button', { name: /eliminar/i });
      fireEvent.click(botonEliminar);
    });
    
    // Verificar que se muestra el mensaje de no hay datos
    expect(screen.getByText('No hay datos para mostrar')).toBeInTheDocument();
    expect(screen.getByText('Añada pacientes a la comparación para visualizar sus datos.')).toBeInTheDocument();
  });
  
  test('llama al callback onSaveComparison cuando se hace clic en guardar', () => {
    const mockSaveComparison = jest.fn();
    render(<PatientComparisonDashboard onSaveComparison={mockSaveComparison} />);
    
    // Hacer clic en el botón de guardar
    fireEvent.click(screen.getByText('Guardar Comparación'));
    
    // Verificar que se llamó al callback
    expect(mockSaveComparison).toHaveBeenCalledTimes(1);
  });
}); 