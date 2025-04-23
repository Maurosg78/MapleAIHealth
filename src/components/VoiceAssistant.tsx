import React, { useEffect, useState, useRef } from 'react';
import { VoiceAssistant } from '../services/voice/VoiceAssistant';;;;;
import { Transcript, VoiceError } from '../types/voice';;;;;

interface VoiceAssistantProps {
  onTranscript?: (transcript: Transcript) => void;
  onError?: (error: VoiceError) => void;
  defaultLanguage?: string;
  showLanguageIssues?: boolean;
}

export const VoiceAssistantComponent: React.FC<VoiceAssistantProps> = ({
  onTranscript,
  onError,
  defaultLanguage = 'es-ES',
  showLanguageIssues = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [languageIssues, setLanguageIssues] = useState<string[]>([]);
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant({
      continuous: true,
      interimResults: true,
      lang: selectedLanguage,
      accentDetection: showLanguageIssues
    });

    const assistant = voiceAssistantRef.current;

    // Agregar terapeuta como speaker
    assistant.addSpeaker({
      id: 'therapist',
      name: 'Terapeuta',
      accent: 'es-ES',
      nativeLanguage: 'es'
    });

    // Agregar paciente como speaker
    assistant.addSpeaker({
      id: 'patient',
      name: 'Paciente',
      accent: 'es-ES',
      nativeLanguage: 'es'
    });

    setAvailableLanguages(assistant.getAvailableLanguages());

    assistant.on('transcript', (transcript: Transcript) => {
      if (onTranscript) {
        onTranscript(transcript);
      }
      if (transcript.languageIssues) {
        setLanguageIssues(transcript.languageIssues);
      }
    });

    assistant.on('error', (error: VoiceError) => {
      if (onError) {
        onError(error);
      }
    });

    assistant.on('listening', (listening: boolean) => {
      setIsListening(listening);
    });

    return () => {
      assistant.stop();
    };
  }, [onTranscript, onError, selectedLanguage, showLanguageIssues]);

  const toggleListening = (): void => {
    if (!voiceAssistantRef.current) return;

    if (isListening) {
      voiceAssistantRef.current.stop();
    } else {
      voiceAssistantRef.current.start();
    }
  };

  const changeSpeaker = (speakerId: string): void => {
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.setCurrentSpeaker(speakerId);
      setCurrentSpeaker(speakerId);
    }
  };

  const changeLanguage = (lang: string): void => {
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.setLanguage(lang);
      setSelectedLanguage(lang);
    }
  };

  if (!voiceAssistantRef.current?.isSupported()) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        El reconocimiento de voz no está disponible en este navegador
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
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
          value={selectedLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="px-3 py-2 border rounded"
          aria-label="Seleccionar idioma"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => changeSpeaker('therapist')}
          className={`px-4 py-2 rounded ${
            currentSpeaker === 'therapist'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          Terapeuta
        </button>
        <button
          onClick={() => changeSpeaker('patient')}
          className={`px-4 py-2 rounded ${
            currentSpeaker === 'patient'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          Paciente
        </button>
      </div>

      {isListening && (
        <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Escuchando...
        </div>
      )}

      {showLanguageIssues && languageIssues.length > 0 && (
        <div className="mt-4 p-2 bg-blue-100 text-blue-800 rounded">
          <h3 className="font-bold mb-2">Problemas de lenguaje detectados:</h3>
          <ul className="list-disc list-inside">
            {languageIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 