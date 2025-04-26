import React, { useState, useEffect, useRef } from 'react';
import { AmbientAudioProcessor } from '../../services/voice/AmbientAudioProcessor';
import { TranscriptVisualizer } from './TranscriptVisualizer';
import { Transcript } from '../../types/voice';

interface AmbientAudioRecorderProps {
  onTranscript?: (transcript: Transcript) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const AmbientAudioRecorder: React.FC<AmbientAudioRecorderProps> = ({
  onTranscript,
  onError,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [unclearWords, setUnclearWords] = useState<string[]>([]);
  const audioProcessorRef = useRef<AmbientAudioProcessor | null>(null);

  useEffect(() => {
    audioProcessorRef.current = new AmbientAudioProcessor({
      speakerProfiles: [
        {
          id: 'professional',
          name: 'Profesional',
          color: 'blue',
          voiceCharacteristics: {
            pitch: 0.7,
            timbre: 0.8,
            speakingRate: 1.2
          }
        },
        {
          id: 'patient',
          name: 'Paciente',
          color: 'green',
          voiceCharacteristics: {
            pitch: 0.5,
            timbre: 0.6,
            speakingRate: 1.0
          }
        },
        {
          id: 'other',
          name: 'Tercero',
          color: 'purple',
          voiceCharacteristics: {
            pitch: 0.6,
            timbre: 0.7,
            speakingRate: 1.1
          }
        }
      ]
    });

    const processor = audioProcessorRef.current;

    processor.on('transcript', (transcript: Transcript) => {
      setTranscripts(prev => [...prev, transcript]);
      if (onTranscript) {
        onTranscript(transcript);
      }
    });

    processor.on('error', (error: Error) => {
      if (onError) {
        onError(error);
      }
    });

    return () => {
      processor.stopRecording();
    };
  }, [onTranscript, onError]);

  const toggleRecording = async () => {
    if (!audioProcessorRef.current) return;

    if (!isRecording) {
      try {
        await audioProcessorRef.current.startRecording();
        setIsRecording(true);
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
      }
    } else {
      audioProcessorRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handleWordClick = (word: string) => {
    setUnclearWords(prev => [...prev, word]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <button
          onClick={toggleRecording}
          className={`
            px-4 py-2 rounded-lg font-medium
            ${isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          {isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
        </button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <span className="text-sm">Profesional</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <span className="text-sm">Paciente</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
            <span className="text-sm">Tercero</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {transcripts.map((transcript, index) => (
          <TranscriptVisualizer
            key={index}
            transcript={transcript}
            onWordClick={handleWordClick}
          />
        ))}
      </div>

      {unclearWords.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">
            Palabras para Clarificar
          </h3>
          <div className="flex flex-wrap gap-2">
            {unclearWords.map((word, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 