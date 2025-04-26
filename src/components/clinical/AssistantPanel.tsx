import React from 'react';
import { AssistantSuggestion } from '../../types/clinical';

interface AssistantPanelProps {
  suggestions: AssistantSuggestion[];
  selectedSuggestions: string[];
  onSuggestionSelect: (suggestion: AssistantSuggestion) => void;
  activeSection: string;
  documentation: string;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  suggestions,
  selectedSuggestions,
  onSuggestionSelect,
  activeSection,
  documentation
}) => {
  const categorizeSuggestions = (suggestions: AssistantSuggestion[]) => {
    return suggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.type]) {
        acc[suggestion.type] = [];
      }
      acc[suggestion.type].push(suggestion);
      return acc;
    }, {} as Record<string, AssistantSuggestion[]>);
  };

  const categorizedSuggestions = categorizeSuggestions(suggestions);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Asistente Clínico</h2>
        <p className="text-sm text-gray-500">
          Sugerencias y advertencias basadas en la documentación
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Sugerencias de Documentación */}
        {categorizedSuggestions['documentation'] && (
          <div className="space-y-2">
            <h3 className="font-medium text-blue-600">Sugerencias de Documentación</h3>
            {categorizedSuggestions['documentation'].map(suggestion => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedSuggestions.includes(suggestion.id)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-white border border-gray-200 hover:border-blue-200'
                }`}
                onClick={() => onSuggestionSelect(suggestion)}
              >
                <p className="text-sm">{suggestion.content}</p>
                {suggestion.confidence && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Advertencias Clínicas */}
        {categorizedSuggestions['warning'] && (
          <div className="space-y-2">
            <h3 className="font-medium text-yellow-600">Advertencias Clínicas</h3>
            {categorizedSuggestions['warning'].map(suggestion => (
              <div
                key={suggestion.id}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="text-sm text-yellow-800">{suggestion.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Puntos Ciegos */}
        {categorizedSuggestions['blindspot'] && (
          <div className="space-y-2">
            <h3 className="font-medium text-red-600">Posibles Puntos Ciegos</h3>
            {categorizedSuggestions['blindspot'].map(suggestion => (
              <div
                key={suggestion.id}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-800">{suggestion.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Interacciones */}
        {categorizedSuggestions['interaction'] && (
          <div className="space-y-2">
            <h3 className="font-medium text-purple-600">Interacciones Detectadas</h3>
            {categorizedSuggestions['interaction'].map(suggestion => (
              <div
                key={suggestion.id}
                className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <p className="text-sm text-purple-800">{suggestion.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas de uso */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-700">Estadísticas de Sugerencias</h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>Sugerencias aceptadas: {selectedSuggestions.length}</p>
          <p>Sugerencias totales: {suggestions.length}</p>
        </div>
      </div>
    </div>
  );
}; 