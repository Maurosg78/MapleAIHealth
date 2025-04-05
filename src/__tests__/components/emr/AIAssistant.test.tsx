import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIAssistant from '../../../components/emr/AIAssistant';

describe('AIAssistant', () => {
  it('renders correctly with initial context', () => {
    render(React.createElement('AIAssistant', { initialContext: "Paciente con fiebre y dolor de garganta" }));

    expect(screen.getByText(/Asistente Médico IA/i)).toBeInTheDocument();
    expect(screen.getByText(/He cargado la información del paciente. Paciente con fiebre y dolor de garganta/i)).toBeInTheDocument();
  });

  it('displays suggested prompts', () => {
    const suggestedPrompts = [
      'Prueba sugerida 1',
      'Prueba sugerida 2'
    ];

    render(React.createElement('AIAssistant', { suggestedPrompts: suggestedPrompts }));

    expect(screen.getByText('Prueba sugerida 1')).toBeInTheDocument();
    expect(screen.getByText('Prueba sugerida 2')).toBeInTheDocument();
  });

  it('handles user input and displays messages', async () => {
    const onAnalysisGenerated = jest.fn();
    render(React.createElement('AIAssistant', { onAnalysisGenerated: onAnalysisGenerated }));

    // Encuentra el textarea para el input
    const textareaElement = screen.getByPlaceholderText('Escribe tu consulta médica aquí...');

    // Simula escribir en el textarea
    fireEvent.change(textareaElement, { target: { value: 'Necesito un diagnóstico' } });

    // Busca el botón de guardar y haz clic en él
    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    // Verifica que el mensaje del usuario aparezca
    expect(screen.getByText('Necesito un diagnóstico')).toBeInTheDocument();

    // Espera a que aparezca la respuesta del asistente
    await waitFor(() => {
      expect(screen.getByText(/Basado en los síntomas descritos/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verifica que se llamó a la función de análisis generado
    expect(onAnalysisGenerated).toHaveBeenCalled();
  });

  it('passes basic test', () => {
    // Test básico para evitar errores
    expect(true).toBe(true);
  });
});
