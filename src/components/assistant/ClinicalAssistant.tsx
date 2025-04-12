import { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  XIcon, 
  DocumentTextIcon,
  SparklesIcon,
  ClipboardCheckIcon,
  ExclamationIcon,
  ClockIcon,
  ChatIcon,
  MicrophoneIcon
} from '@heroicons/react/outline';

// Tipos para las sugerencias del asistente
interface AssistantSuggestion {
  id: string;
  type: 'clinical' | 'diagnostic' | 'alert' | 'documentation' | 'reminder';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  evidence?: {
    level: string;
    source: string;
  };
  action?: string;
}

// Componente de sugerencia individual
const SuggestionItem = ({ suggestion, onAction }: { 
  suggestion: AssistantSuggestion; 
  onAction: (suggestion: AssistantSuggestion, action: string) => void 
}) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };
  
  const getIconByType = (type: string) => {
    switch (type) {
      case 'clinical':
        return <SparklesIcon className="h-5 w-5 text-blue-600" />;
      case 'diagnostic':
        return <ClipboardCheckIcon className="h-5 w-5 text-purple-600" />;
      case 'alert':
        return <ExclamationIcon className="h-5 w-5 text-red-600" />;
      case 'documentation':
        return <DocumentTextIcon className="h-5 w-5 text-green-600" />;
      case 'reminder':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <LightBulbIcon className="h-5 w-5 text-blue-600" />;
    }
  };
  
  return (
    <div className={`p-3 mb-3 border rounded-lg ${getPriorityStyles(suggestion.priority)}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          {getIconByType(suggestion.type)}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
          <p className="mt-1 text-xs text-gray-700">{suggestion.description}</p>
          
          {suggestion.evidence && (
            <div className="mt-2 text-xs text-gray-600 bg-white bg-opacity-50 p-1 rounded">
              <span className="font-medium">Evidencia {suggestion.evidence.level}:</span> {suggestion.evidence.source}
            </div>
          )}
          
          {suggestion.action && (
            <button 
              onClick={() => onAction(suggestion, suggestion.action || '')}
              className="mt-2 text-xs bg-white px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {suggestion.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal del asistente clínico
export default function ClinicalAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat'>('suggestions');
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Hola Dr. Ramírez, ¿en qué puedo ayudarle hoy?' }
  ]);
  
  // Datos simulados de sugerencias
  const [suggestions] = useState<AssistantSuggestion[]>([
    {
      id: 'sug1',
      type: 'alert',
      title: 'Posible interacción medicamentosa',
      description: 'La amoxicilina que está considerando recetar podría interactuar con el anticoagulante que el paciente ya está tomando.',
      priority: 'high',
      action: 'Ver alternativas'
    },
    {
      id: 'sug2',
      type: 'clinical',
      title: 'Considerar prueba de HbA1c',
      description: 'El paciente tiene factores de riesgo para diabetes tipo 2 y no se ha realizado esta prueba en los últimos 12 meses.',
      priority: 'medium',
      evidence: {
        level: 'A',
        source: 'American Diabetes Association, 2024 Clinical Guidelines'
      },
      action: 'Ordenar prueba'
    },
    {
      id: 'sug3',
      type: 'documentation',
      title: 'Completar evaluación de dolor',
      description: 'La escala numérica de dolor no ha sido documentada para esta consulta.',
      priority: 'low',
      action: 'Completar ahora'
    },
    {
      id: 'sug4',
      type: 'diagnostic',
      title: 'Diagnóstico diferencial sugerido',
      description: 'Basado en los síntomas, considere estenosis del canal lumbar como diagnóstico alternativo.',
      priority: 'medium',
      evidence: {
        level: 'B',
        source: 'North American Spine Society Guidelines, 2023'
      },
      action: 'Ver detalles'
    }
  ]);
  
  // Manejo de acciones de sugerencias
  const handleSuggestionAction = (suggestion: AssistantSuggestion, action: string) => {
    console.log(`Acción '${action}' para sugerencia: ${suggestion.title}`);
    // Aquí implementaríamos la lógica real para cada acción
  };
  
  // Envío de mensaje de chat
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Añadir mensaje del usuario al historial
    setChatHistory([...chatHistory, { role: 'user', content: message }]);
    
    // Simulación de respuesta del asistente (en una aplicación real, esto sería una llamada a la API)
    setTimeout(() => {
      let response = '';
      
      // Simulación simple de respuestas basadas en palabras clave
      if (message.toLowerCase().includes('dolor')) {
        response = 'Basado en la descripción del dolor, recomendaría completar una evaluación de dolor utilizando la escala McGill. ¿Le gustaría que prepare un cuestionario para el paciente?';
      } else if (message.toLowerCase().includes('diagnóstico') || message.toLowerCase().includes('diagnostico')) {
        response = 'Considerando los síntomas descritos, los diagnósticos diferenciales podrían incluir: radiculopatía lumbar, estenosis espinal, o síndrome facetario. ¿Desea ver los criterios diagnósticos?';
      } else if (message.toLowerCase().includes('ejercicio') || message.toLowerCase().includes('tratamiento')) {
        response = 'La evidencia actual (nivel A) sugiere que ejercicios específicos de control motor y estabilización lumbar son efectivos para este tipo de condición. ¿Desea ver un protocolo de ejercicios recomendado?';
      } else {
        response = 'Entiendo. ¿Hay algo más específico en lo que pueda ayudarle con este paciente?';
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
    
    // Limpiar el campo de mensaje
    setMessage('');
  };
  
  // Simulación de dictado por voz
  const toggleListening = () => {
    setIsListening(!isListening);
    
    // Simulamos que se ha completado el reconocimiento de voz después de 3 segundos
    if (!isListening) {
      setTimeout(() => {
        setMessage(prev => prev + ' El paciente refiere dolor lumbar irradiado a miembro inferior derecho, con parestesias en dermatoma L5.');
        setIsListening(false);
      }, 3000);
    }
  };
  
  // Efectos visuales para el botón de dictado
  useEffect(() => {
    if (!isListening) return;
    
    const interval = setInterval(() => {
      const micButton = document.getElementById('mic-button');
      if (micButton) {
        micButton.classList.toggle('bg-red-100');
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [isListening]);
  
  return (
    <div className={`fixed bottom-4 right-4 bg-white shadow-lg rounded-lg transition-all duration-300 ${isExpanded ? 'w-96 h-[500px]' : 'w-12 h-12'}`}>
      {/* Cabecera del asistente */}
      <div className="p-3 bg-primary-600 text-white rounded-t-lg flex justify-between items-center">
        <span className={`font-medium transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          Asistente Clínico AIDUX
        </span>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full hover:bg-primary-500 focus:outline-none"
          aria-label={isExpanded ? 'Minimizar asistente' : 'Expandir asistente'}
        >
          {isExpanded ? (
            <XIcon className="w-5 h-5" />
          ) : (
            <LightBulbIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Contenido del asistente (visible solo cuando está expandido) */}
      {isExpanded && (
        <div className="flex flex-col h-[calc(100%-48px)]">
          {/* Pestañas de navegación */}
          <div className="border-b">
            <nav className="flex" aria-label="Pestañas">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'suggestions'
                    ? 'border-b-2 border-primary-600 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sugerencias
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-primary-600 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Chat
              </button>
            </nav>
          </div>
          
          {/* Contenedor principal */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'suggestions' ? (
              // Contenido de sugerencias
              <div>
                <p className="text-xs text-gray-500 mb-3">
                  Sugerencias contextuales basadas en el paciente actual:
                </p>
                
                {suggestions.map(suggestion => (
                  <SuggestionItem 
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAction={handleSuggestionAction}
                  />
                ))}
              </div>
            ) : (
              // Contenido de chat
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto mb-3">
                  {chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`mb-3 max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-primary-100 text-gray-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Área de entrada para el chat */}
          {activeTab === 'chat' && (
            <div className="p-3 border-t">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe o dicta tu consulta..."
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    id="mic-button"
                    onClick={toggleListening}
                    className={`absolute right-2 bottom-2 p-1 rounded-full ${
                      isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label="Activar dictado por voz"
                  >
                    <MicrophoneIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none"
                  aria-label="Enviar mensaje"
                >
                  <ChatIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Puedes preguntar sobre diagnósticos, tratamientos, o solicitar documentación.
              </p>
            </div>
          )}
          
          {/* Acciones rápidas para la pestaña de sugerencias */}
          {activeTab === 'suggestions' && (
            <div className="p-3 border-t">
              <p className="text-xs text-gray-500 mb-2">Acciones rápidas:</p>
              <div className="flex flex-wrap gap-2">
                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors">
                  Generar nota clínica
                </button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors">
                  Buscar guías clínicas
                </button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors">
                  Verificar interacciones
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 