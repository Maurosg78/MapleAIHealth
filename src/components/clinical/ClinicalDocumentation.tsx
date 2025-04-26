import React from 'react';
import { AmbientAudioRecorder } from '../voice/AmbientAudioRecorder';

interface ClinicalDocumentationProps {
  activeSection: 'subjective' | 'objective' | 'assessment' | 'plan';
  onSectionChange: (section: 'subjective' | 'objective' | 'assessment' | 'plan') => void;
  documentation: string;
  onChange: (text: string) => void;
  showAudioAssistant: boolean;
  onAudioAssistantToggle: () => void;
}

export const ClinicalDocumentation: React.FC<ClinicalDocumentationProps> = ({
  activeSection,
  onSectionChange,
  documentation,
  onChange,
  showAudioAssistant,
  onAudioAssistantToggle
}) => {
  const sections = [
    { id: 'subjective', label: 'Subjetivo' },
    { id: 'objective', label: 'Objetivo' },
    { id: 'assessment', label: 'Análisis' },
    { id: 'plan', label: 'Plan' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Barra de secciones */}
      <div className="flex space-x-2 mb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id as any)}
            className={`
              px-4 py-2 rounded-lg font-medium
              ${activeSection === section.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Controles de audio */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onAudioAssistantToggle}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium
              ${showAudioAssistant
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
              }
            `}
          >
            {showAudioAssistant ? 'Asistente de Audio Activo' : 'Activar Asistente de Audio'}
          </button>
        </div>
      </div>

      {/* Área de documentación */}
      <div className="flex-1 relative">
        <textarea
          value={documentation}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Documentación ${sections.find(s => s.id === activeSection)?.label.toLowerCase()}...`}
        />

        {/* Asistente de audio (condicional) */}
        {showAudioAssistant && (
          <div className="absolute bottom-4 right-4">
            <AmbientAudioRecorder
              onTranscript={(transcript) => {
                onChange(`${documentation}\n${transcript.text}`);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 