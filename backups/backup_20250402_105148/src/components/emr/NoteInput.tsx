import React, { useState, ChangeEvent } from 'react';
import { Button, Select, TextArea } from '../common';

interface NoteInputProps {
  onSubmit: (note: {
    content: string;
    type:
      | 'consultation'
      | 'emergency'
      | 'follow-up'
      | 'lab-result'
      | 'prescription'
      | 'other';
    timestamp: string;
    author: string;
  }) => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<
    | 'consultation'
    | 'emergency'
    | 'follow-up'
    | 'lab-result'
    | 'prescription'
    | 'other'
  >('consultation');

  const noteTypes = [
    { value: 'consultation', label: 'Consulta' },
    { value: 'emergency', label: 'Emergencia' },
    { value: 'follow-up', label: 'Seguimiento' },
    { value: 'lab-result', label: 'Resultado de Laboratorio' },
    { value: 'prescription', label: 'Prescripción' },
    { value: 'other', label: 'Otro' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      content,
      type,
      timestamp: new Date().toISOString(),
      author: 'Dr. Ejemplo', // Esto debería venir del contexto de autenticación
    });

    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="note-type"
          className="block text-sm font-medium text-gray-700"
        >
          Tipo de Nota
        </label>
        <Select
          id="note-type"
          value={type}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setType(e.target.value as typeof type)
          }
          className="mt-1"
          options={noteTypes}
        />
      </div>

      <div>
        <label
          htmlFor="note-content"
          className="block text-sm font-medium text-gray-700"
        >
          Contenido de la Nota
        </label>
        <TextArea
          id="note-content"
          rows={4}
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setContent(e.target.value)
          }
          placeholder="Escribe aquí la nota médica..."
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full">
        Procesar Nota
      </Button>
    </form>
  );
};
