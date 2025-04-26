import React, { useState, useEffect } from 'react';
import { ClinicalDocumentation } from './ClinicalDocumentation';
import { AssistantPanel } from './AssistantPanel';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicalAssistant } from '../../services/ClinicalAssistant';
import { ClinicalContext } from '../../types/clinical';

interface ClinicalWorkspaceProps {
  patientId: string;
  visitId: string;
  specialty: string;
}

export const ClinicalWorkspace: React.FC<ClinicalWorkspaceProps> = ({
  patientId,
  visitId,
  specialty
}) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'subjective' | 'objective' | 'assessment' | 'plan'>('subjective');
  const [documentation, setDocumentation] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [showAudioAssistant, setShowAudioAssistant] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clinicalAssistant = ClinicalAssistant.getInstance();

  // Inicializar contexto clínico
  useEffect(() => {
    const context: ClinicalContext = {
      patientId,
      visitId,
      specialty,
      activeSection,
      documentation,
      patientHistory: {
        conditions: [], // Estos datos deberían venir de la API
        medications: [],
        allergies: []
      }
    };
    clinicalAssistant.setContext(context);
  }, [patientId, visitId, specialty, activeSection, documentation]);

  // Cargar configuración del profesional
  useEffect(() => {
    const loadProfessionalConfig = async () => {
      try {
        const config = await clinicalAssistant.getProfessionalConfig(user.id);
        setShowAudioAssistant(config.preferences.useAudioAssistant);
      } catch (err) {
        setError('Error al cargar la configuración del profesional');
        console.error('Error:', err);
      }
    };
    loadProfessionalConfig();
  }, [user.id]);

  // Manejar cambios en la documentación
  const handleDocumentationChange = async (text: string) => {
    try {
      setDocumentation(text);
      const newSuggestions = await clinicalAssistant.analyzeDocumentation(text);
      setSuggestions(newSuggestions);
      setError(null);
    } catch (err) {
      setError('Error al analizar la documentación');
      console.error('Error:', err);
    }
  };

  // Manejar selección de sugerencias
  const handleSuggestionSelect = (suggestionId: string) => {
    setSelectedSuggestions(prev => [...prev, suggestionId]);
    clinicalAssistant.trackSuggestionUsage(suggestionId, true);
  };

  // Incorporar sugerencia a la documentación
  const incorporateSuggestion = (suggestion: AssistantSuggestion) => {
    const newText = `${documentation}\n${suggestion.content}`;
    setDocumentation(newText);
    handleSuggestionSelect(suggestion.id);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Columna de Documentación */}
      <div className="w-2/3 p-4">
        <ClinicalDocumentation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          documentation={documentation}
          onChange={handleDocumentationChange}
          showAudioAssistant={showAudioAssistant}
          onAudioAssistantToggle={() => setShowAudioAssistant(!showAudioAssistant)}
        />
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Columna del Asistente */}
      <div className="w-1/3 border-l border-gray-200 p-4">
        <AssistantPanel
          suggestions={suggestions}
          selectedSuggestions={selectedSuggestions}
          onSuggestionSelect={incorporateSuggestion}
          activeSection={activeSection}
          documentation={documentation}
        />
      </div>
    </div>
  );
}; 