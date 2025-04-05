import * as React from 'react';
import { useState } from 'react';
import { AIResponse } from '../../services/ai';

interface ResponseFeedbackProps {
  response: AIResponse;
  onFeedbackSubmit?: (feedback: { helpful: boolean; comments: string }) => void;
}

/**
 * Componente para recibir retroalimentación sobre respuestas de IA
 */
const ResponseFeedback: React.FC<ResponseFeedbackProps> = ({
  onFeedbackSubmit,
}) => {
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
    return React.createElement('div',
      { className: "p-3 rounded-md bg-gray-50 mt-4" },
      React.createElement('p',
        { className: "text-green-600 font-medium text-sm" },
        "¡Gracias por tu valoración!"
      )
    );
  }

  return React.createElement('div',
    { className: "border rounded-md p-4 mt-4 bg-gray-50" },
    [
      React.createElement('h4',
        {
          key: 'title',
          className: "font-medium text-sm mb-2"
        },
        "¿Fue útil esta respuesta?"
      ),
      React.createElement('div',
        {
          key: 'buttons',
          className: "flex gap-2 mb-3"
        },
        [
          React.createElement('button',
            {
              key: 'yes',
              onClick: () => setHelpful(true),
              className: `px-3 py-1 rounded-md text-sm ${helpful === true ? 'bg-green-600 text-white' : 'bg-gray-200'}`
            },
            "Sí"
          ),
          React.createElement('button',
            {
              key: 'no',
              onClick: () => setHelpful(false),
              className: `px-3 py-1 rounded-md text-sm ${helpful === false ? 'bg-red-600 text-white' : 'bg-gray-200'}`
            },
            "No"
          )
        ]
      ),
      helpful !== null && React.createElement('div',
        {
          key: 'feedback',
          className: "space-y-3"
        },
        [
          React.createElement('textarea',
            {
              key: 'comments',
              value: comments,
              onChange: (e) => setComments(e.target.value),
              className: "w-full p-2 border rounded-md text-sm",
              placeholder: "Comentarios adicionales (opcional)",
              rows: 3
            }
          ),
          React.createElement('button',
            {
              key: 'submit',
              onClick: handleSubmit,
              className: "px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            },
            "Enviar valoración"
          )
        ]
      )
    ]
  );
};

export default ResponseFeedback;
