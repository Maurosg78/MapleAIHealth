import React, { useState, useEffect } from 'react';
import { SubjectiveData, ObjectiveData, AssessmentData, PlanData, SpecialtyType } from '../../../types/clinical';
import { AIHealthService, AISuggestion, SOAPSection } from '../../../services/AIHealthService';

// Tipos de sugerencias que puede mostrar el panel
export type SuggestionType = 'info' | 'warning' | 'required' | 'recommendation';

// Interfaz para una sugerencia individual
export interface ClinicalSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  section: SOAPSection;
  field?: string;
  priority: 'high' | 'medium' | 'low';
}

// Props para el componente de sugerencias
interface SmartSuggestionPanelProps {
  soapData: {
    patientId: string;
    subjective: SubjectiveData | null;
    objective: ObjectiveData | null;
    assessment: AssessmentData | null;
    plan: PlanData | null;
  };
  specialty: SpecialtyType;
  activeSection: SOAPSection;
  onSuggestionSelect?: (suggestion: AISuggestion) => void;
  onSuggestionDismiss?: (suggestionId: string) => void;
  className?: string;
}

/**
 * Panel inteligente de sugerencias clínicas que analiza los datos SOAP
 * y proporciona recomendaciones contextuales al profesional clínico.
 */
export const SmartSuggestionPanel: React.FC<SmartSuggestionPanelProps> = ({
  soapData,
  specialty,
  activeSection,
  onSuggestionSelect,
  onSuggestionDismiss,
  className = '',
}) => {
  // Estado para almacenar sugerencias activas
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  // Estado para almacenar sugerencias descartadas (para no mostrarlas nuevamente)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  // Estado para indicar si estamos cargando sugerencias
  const [isLoading, setIsLoading] = useState(false);
  // Estado para mostrar errores
  const [error, setError] = useState<string | null>(null);

  // Efecto para generar sugerencias basadas en los datos SOAP
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!soapData.subjective && !soapData.objective && !soapData.assessment && !soapData.plan) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Obtener instancia del servicio
        const aiService = AIHealthService.getInstance();
        
        // Llamar al servicio para analizar los datos
        const response = await aiService.analyzeClinicalData(
          soapData,
          {
            specialty,
            activeSection,
            maxSuggestions: 5, // Limitar a 5 sugerencias para evitar sobrecarga visual
            minConfidence: 0.7 // Solo sugerencias con confianza > 70%
          }
        );
        
        // Filtrar sugerencias ya descartadas
        const filteredSuggestions = response.suggestions
          .filter(suggestion => !dismissedSuggestions.includes(suggestion.id))
          .map(aiSuggestionToClinicalSuggestion);
        
        setSuggestions(filteredSuggestions);
      } catch (err) {
        console.error('Error obteniendo sugerencias:', err);
        setError('No se pudieron cargar las sugerencias. Por favor, intente nuevamente.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
    
    // Incluir dismissedSuggestions en las dependencias para que se actualice cuando cambie
  }, [soapData.subjective, soapData.objective, soapData.assessment, soapData.plan, activeSection, specialty, dismissedSuggestions]);

  // Función para convertir AISuggestion a ClinicalSuggestion
  const aiSuggestionToClinicalSuggestion = (aiSuggestion: AISuggestion): AISuggestion => {
    return aiSuggestion;
  };

  // Función para manejar el clic en una sugerencia
  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  const handleSuggestionKeyDown = (event: React.KeyboardEvent, suggestion: AISuggestion) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSuggestionClick(suggestion);
    }
  };

  // Función para descartar una sugerencia
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic se propague
    setDismissedSuggestions(prev => [...prev, id]);
    
    if (onSuggestionDismiss) {
      onSuggestionDismiss(id);
    }
    
    // Proporcionar feedback al servicio de IA (no lo consideró útil)
    AIHealthService.getInstance().provideFeedback(id, false);
  };

  // Si estamos cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Asistente Clínico</h3>
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Asistente Clínico</h3>
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  // Si no hay sugerencias, mostrar mensaje informativo
  if (suggestions.length === 0) {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Asistente Clínico</h3>
        <p className="text-gray-500">No hay sugerencias en este momento.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h3 className="text-lg font-medium text-gray-900">Asistente Clínico</h3>
      </div>
      
      <div className="mt-4 space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            role="button"
            tabIndex={0}
            onClick={() => handleSuggestionClick(suggestion)}
            onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion)}
            className="p-3 rounded-lg border border-gray-200 hover:border-primary-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {suggestion.type === 'info' && (
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 000-2H9z" clipRule="evenodd" />
                    </svg>
                  )}
                  {suggestion.type === 'warning' && (
                    <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {suggestion.type === 'required' && (
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {suggestion.type === 'recommendation' && (
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                  <p className="text-sm text-gray-500">{suggestion.description}</p>
                  {suggestion.priority === 'high' && (
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      Alta prioridad
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleDismiss(suggestion.id, e)}
                className="ml-2 flex-shrink-0 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Descartar</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 