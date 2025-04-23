import React, { useEffect, useState, useRef } from 'react';
import { MedicalVoiceAssistant } from '../services/voice/MedicalVoiceAssistant';;;;;
import { Transcript } from '../types/voice';;;;;

interface MedicalVoiceAssistantProps {
  specialistId: string;
  onMedicalTranscript?: (transcript: Transcript) => void;
  onError?: (error: Error) => void;
  defaultLanguage?: string;
  initialContext?: string;
}

interface SensitiveArea {
  id: string;
  type: 'diagnosis' | 'test' | 'medication' | 'interpretation';
  content: string;
  requiresConfirmation: boolean;
}

interface RestrictedContent {
  term: string;
  reason: string;
}

interface ContextWarning {
  reason: string;
}

export const MedicalVoiceAssistantComponent: React.FC<MedicalVoiceAssistantProps> = ({
  specialistId,
  onMedicalTranscript,
  onError,
  defaultLanguage = 'es-ES',
  initialContext = 'general'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [currentContext, setCurrentContext] = useState(initialContext);
  const [restrictions, setRestrictions] = useState({
    allowMedicationSuggestions: false,
    allowTestSuggestions: false,
    allowDiagnosisSuggestions: false,
    requireSpecialistRequest: true
  });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pendingConfirmations, setPendingConfirmations] = useState<SensitiveArea[]>([]);
  const assistantRef = useRef<MedicalVoiceAssistant | null>(null);

  useEffect(() => {
    assistantRef.current = new MedicalVoiceAssistant({
      continuous: true,
      interimResults: true,
      lang: defaultLanguage
    });

    const assistant = assistantRef.current;

    // Configurar especialista
    assistant.setSpecialist(specialistId);
    assistant.setMedicalContext(initialContext);

    // Configurar listeners
    assistant.on('medicalTranscript', (transcript: Transcript) => {
      if (onMedicalTranscript) {
        onMedicalTranscript(transcript);
      }
    });

    assistant.on('sensitiveAreaDetected', (area: SensitiveArea) => {
      setPendingConfirmations(prev => [...prev, area]);
    });

    assistant.on('sensitiveAreaConfirmed', (area: SensitiveArea) => {
      setPendingConfirmations(prev => prev.filter(a => a.id !== area.id));
    });

    assistant.on('sensitiveAreaRejected', (area: SensitiveArea) => {
      setPendingConfirmations(prev => prev.filter(a => a.id !== area.id));
    });

    assistant.on('restrictedContent', (data: RestrictedContent) => {
      setWarnings(prev => [...prev, `Contenido restringido: ${data.reason}`]);
    });

    assistant.on('contextWarning', (data: ContextWarning) => {
      setWarnings(prev => [...prev, `Advertencia de contexto: ${data.reason}`]);
    });

    assistant.on('error', (error: Error) => {
      if (onError) {
        onError(error);
      }
      setWarnings(prev => [...prev, `Error: ${error.message}`]);
    });

    return () => {
      assistant.stop();
    };
  }, [specialistId, defaultLanguage, initialContext, onMedicalTranscript, onError]);

  const handleConfirmation = (id: string, confirm: boolean): void => {
    if (assistantRef.current) {
      if (confirm) {
        assistantRef.current.confirmSensitiveArea(id);
      } else {
        assistantRef.current.rejectSensitiveArea(id);
      }
    }
  };

  const toggleListening = (): void => {
    if (!assistantRef.current) return;

    if (isListening) {
      assistantRef.current.stop();
    } else {
      assistantRef.current.start();
    }
    setIsListening(!isListening);
  };

  const updateContext = (context: string): void => {
    if (assistantRef.current) {
      assistantRef.current.setMedicalContext(context);
      setCurrentContext(context);
    }
  };

  const updateRestrictions = (newRestrictions: Partial<typeof restrictions>): void => {
    if (assistantRef.current) {
      assistantRef.current.updateRestrictions(newRestrictions);
      setRestrictions(prev => ({ ...prev, ...newRestrictions }));
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Asistente de Voz Médico</h2>
        <p className="text-sm text-gray-600">Especialista: {specialistId}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleListening}
          className={`px-4 py-2 rounded ${
            isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {isListening ? 'Detener' : 'Iniciar'} Grabación
        </button>

        <select
          value={currentContext}
          onChange={(e) => updateContext(e.target.value)}
          className="px-3 py-2 border rounded"
          aria-label="Seleccionar contexto médico"
        >
          <option value="general">General</option>
          <option value="evaluation">Evaluación</option>
          <option value="treatment">Tratamiento</option>
          <option value="followup">Seguimiento</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-bold mb-2">Restricciones</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={restrictions.allowMedicationSuggestions}
              onChange={(e) => updateRestrictions({ allowMedicationSuggestions: e.target.checked })}
              className="mr-2"
            />
            Permitir sugerencias de medicación
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={restrictions.allowTestSuggestions}
              onChange={(e) => updateRestrictions({ allowTestSuggestions: e.target.checked })}
              className="mr-2"
            />
            Permitir sugerencias de exámenes
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={restrictions.allowDiagnosisSuggestions}
              onChange={(e) => updateRestrictions({ allowDiagnosisSuggestions: e.target.checked })}
              className="mr-2"
            />
            Permitir sugerencias de diagnóstico
          </label>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          <h3 className="font-bold mb-2">Advertencias:</h3>
          <ul className="list-disc list-inside">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {pendingConfirmations.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <h3 className="font-bold mb-2">Confirmaciones Pendientes</h3>
          {pendingConfirmations.map(area => (
            <div key={area.id} className="mb-4 p-3 bg-white rounded border">
              <p className="font-semibold">
                {area.type === 'diagnosis' && 'Posible diagnóstico detectado'}
                {area.type === 'test' && 'Sugerencia de examen detectada'}
                {area.type === 'medication' && 'Mención de medicamento detectada'}
                {area.type === 'interpretation' && 'Interpretación de examen detectada'}
              </p>
              <p className="text-sm text-gray-600 mt-1">{area.content}</p>
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => handleConfirmation(area.id, false)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => handleConfirmation(area.id, true)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Confirmar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isListening && (
        <div className="mt-4 p-2 bg-blue-100 text-blue-800 rounded">
          Grabando en contexto: {currentContext}
        </div>
      )}
    </div>
  );
}; 