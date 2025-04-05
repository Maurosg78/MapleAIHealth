import * as React from 'react';
import { useState, useEffect, useCallback, useRef, memo } from 'react';
import NoteInput from './NoteInput';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AnalysisData {
  id: string;
  type: string;
  items: {
    id: string;
    title: string;
    description: string;
    confidence: number;
    timestamp: string;
  }[];
}

interface AIAssistantProps {
  initialContext?: string;
  patientId?: string;
  onAnalysisGenerated?: (analysisData: AnalysisData) => void;
  suggestedPrompts?: string[];
  className?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = memo(({
  initialContext = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patientId,
  onAnalysisGenerated,
  suggestedPrompts = [
    '¿Cuáles son los diagnósticos diferenciales para estos síntomas?',
    'Sugiere pruebas de laboratorio apropiadas para este caso',
    'Resume la evidencia clínica actual para este tratamiento',
    'Ayuda a interpretar los resultados de estos análisis'
  ],
  className = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingEffect, setTypingEffect] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Al iniciar, si hay un contexto inicial, mostrar un mensaje de asistente con ese contexto
  useEffect(() => {
    if (initialContext) {
      setMessages([{
        id: 'initial',
        content: `He cargado la información del paciente. ${initialContext}`,
        role: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, [initialContext]);

  // Simular la respuesta del asistente
  const simulateAssistantResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true);

    try {
      // En un sistema real, aquí iría la llamada a la API del asistente
      await new Promise(resolve => setTimeout(resolve, 1500));

      let response = '';
      if (userMessage.includes('diagnóstico')) {
        response = 'Basado en los síntomas descritos, los diagnósticos diferenciales a considerar incluyen: infección respiratoria aguda, bronquitis, o exacerbación de asma. Recomendaría realizar una radiografía de tórax y análisis de sangre para precisar el diagnóstico.';
      } else if (userMessage.includes('prueba') || userMessage.includes('análisis')) {
        response = 'Para este caso, recomendaría las siguientes pruebas: hemograma completo, panel metabólico básico, proteína C reactiva, y pruebas de función pulmonar si hay antecedentes de asma o EPOC.';
      } else if (userMessage.includes('tratamiento') || userMessage.includes('medicamento')) {
        response = 'La evidencia actual respalda el uso de broncodilatadores de acción corta para el alivio sintomático. Para casos moderados a severos, los corticosteroides inhalados son efectivos según múltiples ensayos clínicos.';
      } else {
        response = 'He analizado la información proporcionada. ¿En qué aspecto específico necesitas asistencia? Puedo ayudarte con diagnósticos diferenciales, interpretación de resultados, o recomendaciones de tratamiento basadas en evidencia.';
      }

      // Simular efecto de escritura
      setShowTyping(true);
      let currentText = '';
      const words = response.split(' ');

      for (let i = 0; i < items.length; i++let i = 0; i < words.length; i++) {
        currentText += words[i] + ' ';
        setTypingEffect(currentText);
        // Simular velocidad de escritura variable
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
      }

      setShowTyping(false);
      setTypingEffect('');

      // Agregar el mensaje del asistente
      const newMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);

      // Simular generación de análisis para propagarlo al componente padre
      if (onAnalysisGenerated) {
        const mockAnalysis: AnalysisData = {
          id: `analysis-${Date.now()}`,
          type: userMessage.includes('diagnóstico') ? 'diagnosis' :
                userMessage.includes('prueba') || userMessage.includes('análisis') ? 'test' :
                userMessage.includes('tratamiento') ? 'treatment' : 'observation',
          items: [
            {
              id: `item-${Date.now()}`,
              title: userMessage.includes('diagnóstico') ? 'Infección Respiratoria Aguda' :
                    userMessage.includes('prueba') ? 'Hemograma Completo' :
                    userMessage.includes('tratamiento') ? 'Broncodilatadores' : 'Observación General',
              description: response.substring(0, 100) + '...',
              confidence: 0.85,
              timestamp: new Date().toISOString()
            }
          ]
        };
        onAnalysisGenerated(mockAnalysis);
      }

    } catch (error) {
      console.error('Error al obtener respuesta del asistente:', error);
      // Mensaje de error
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: 'Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta de nuevo.',
        role: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [onAnalysisGenerated]);

  // Scroll al final de los mensajes cuando se agrega uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingEffect]);

  // Manejar el envío de un mensaje del usuario
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await simulateAssistantResponse(content);
  }, [simulateAssistantResponse]);

  // Manejar clic en sugerencia
  const handleSuggestedPrompt = useCallback((prompt: string) => {
    handleSendMessage(prompt);
  }, [handleSendMessage]);

  // Formatear fecha
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col rounded-lg border border-gray-200 shadow-sm bg-white h-full ${className}`}>
      <div className="p-3 border-b border-gray-200 bg-blue-50">
        <h3 className="text-lg font-medium text-blue-900">Asistente Médico IA</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="text-sm mb-1">{message.content}</div>
              <div className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'} text-right`}>
                {formatMessageTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {showTyping && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-gray-100 text-gray-800 rounded-bl-none">
              <div className="text-sm mb-1">{typingEffect}<span className="animate-pulse">▋</span></div>
              <div className="text-xs text-gray-500 text-right">
                {formatMessageTime(new Date())}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {suggestedPrompts.length > 0 && messages.length < 2 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition"
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-200">
        <NoteInput
          placeholder="Escribe tu consulta médica aquí..."
          label=""
          onSave={handleSendMessage}
          autoFocus
          maxLength={500}
        />
      </div>
    </div>
    null
  );
});

AIAssistant.displayName = 'AIAssistant';

export default AIAssistant;
