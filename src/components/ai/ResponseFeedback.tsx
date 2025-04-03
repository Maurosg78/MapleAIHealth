import React, { useState } from 'react';
import { AIResponse } from '../../services/ai';

interface ResponseFeedbackProps {
  response: AIResponse;
  onFeedbackSubmit?: (feedback: { helpful: boolean; comments: string }) => void;
}

/**
 * Componente para recibir retroalimentación sobre respuestas de IA
 */
const ResponseFeedback: React.FC<ResponseFeedbackProps> = ({ onFeedbackSubmit }) => {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (helpful === null) return;

    if (onFeedbackSubmit) {
      onFeedbackSubmit({ helpful, comments });
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-3 rounded-md bg-gray-50 mt-4">
        <p className="text-green-600 font-medium text-sm">¡Gracias por tu valoración!</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 mt-4 bg-gray-50">
      <h4 className="font-medium text-sm mb-2">¿Fue útil esta respuesta?</h4>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setHelpful(true)}
          className={`px-3 py-1 rounded-md text-sm ${helpful === true ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Sí
        </button>
        <button
          onClick={() => setHelpful(false)}
          className={`px-3 py-1 rounded-md text-sm ${helpful === false ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          No
        </button>
      </div>

      {helpful !== null && (
        <>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-2 border rounded-md text-sm mb-3"
            placeholder="Comentarios adicionales (opcional)"
            rows={3}
          />

          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          >
            Enviar valoración
          </button>
        </>
      )}
    </div>
  );
};

export default ResponseFeedback;
