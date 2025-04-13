import React, { useState, useEffect, useRef } from 'react';
import { ChatAltIcon, PaperAirplaneIcon, PlusCircleIcon, UserCircleIcon } from '@heroicons/react/solid';
import { VerificationRequest } from '../services/ClinicalBlindSpotService';

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: Date;
  type?: 'suggestion' | 'question' | 'warning' | 'info';
  field?: string;
}

interface ConversationalAssistantProps {
  clinicalCase: VerificationRequest;
  isNewPatient: boolean;
  patientName?: string;
  missingFields: string[];
  onUpdateCase: (field: string, value: string) => void;
  onRequestFullForm: () => void;
}

/**
 * Asistente clínico conversacional que guía al médico a través de preguntas y sugerencias
 * 
 * ADVERTENCIA DE SEGURIDAD MÉDICA - PRIORIDAD ALTA
 * Este asistente NUNCA genera información médica no verificada.
 * Solo hace preguntas para completar la información y ofrece sugerencias
 * basadas en guías clínicas documentadas.
 */
export const ConversationalAssistant: React.FC<ConversationalAssistantProps> = ({
  // clinicalCase no se usa directamente pero podría ser útil para lógica futura
  isNewPatient,
  patientName = "el paciente",
  missingFields,
  onUpdateCase,
  onRequestFullForm
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll al final de la conversación cuando se agregan mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Iniciar conversación cuando se carga el componente
  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
  }, []);
  
  // Actualizar el asistente cuando cambian los campos faltantes
  useEffect(() => {
    if (activeConversation && missingFields.length > 0 && !currentField) {
      suggestNextField();
    }
  }, [missingFields, activeConversation]);
  
  const startConversation = () => {
    const initialMessages: Message[] = [];
    
    // Mensaje de bienvenida inicial
    initialMessages.push({
      id: `welcome-${Date.now()}`,
      sender: 'assistant',
      text: isNewPatient 
        ? `Hola, veo que estás atendiendo a ${patientName} por primera vez. Te ayudaré a completar su historia clínica.`
        : `Bienvenido nuevamente. Continuaré ayudándote con la historia clínica de ${patientName}.`,
      timestamp: new Date(),
      type: 'info'
    });
    
    // Agregar todas las sugerencias iniciales
    if (missingFields.length > 0) {
      initialMessages.push({
        id: `missing-${Date.now()}`,
        sender: 'assistant',
        text: isNewPatient
          ? 'Necesitamos completar la siguiente información para este nuevo paciente:'
          : 'Falta completar la siguiente información importante:',
        timestamp: new Date(),
        type: 'info'
      });
      
      // Listar los primeros 3 campos faltantes
      missingFields.slice(0, 3).forEach((field, index) => {
        initialMessages.push({
          id: `field-${Date.now()}-${index}`,
          sender: 'assistant',
          text: `Te sugiero indagar en: ${field}`,
          timestamp: new Date(),
          type: 'suggestion',
          field: field
        });
      });
      
      // Si hay más de 3 campos, agregar un mensaje indicando que hay más
      if (missingFields.length > 3) {
        initialMessages.push({
          id: `more-${Date.now()}`,
          sender: 'assistant',
          text: `Hay ${missingFields.length - 3} campos adicionales por completar. ¿Deseas ver el formulario completo?`,
          timestamp: new Date(),
          type: 'question'
        });
      }
    } else {
      initialMessages.push({
        id: `complete-${Date.now()}`,
        sender: 'assistant',
        text: '¡Excelente! La historia clínica está completa. ¿Hay algo específico en lo que pueda ayudarte?',
        timestamp: new Date(),
        type: 'info'
      });
    }
    
    setMessages(initialMessages);
    setActiveConversation(true);
  };
  
  const suggestNextField = () => {
    if (missingFields.length === 0 || currentField) return;
    
    // Seleccionar el siguiente campo faltante
    const nextField = missingFields[0];
    setCurrentField(nextField);
    
    // Generar una pregunta específica basada en el campo
    let question = '';
    
    switch (nextField) {
      case 'ID del paciente':
        question = `¿Cuál es el número de identificación de ${patientName}?`;
        break;
      case 'edad del paciente':
        question = `¿Qué edad tiene ${patientName}?`;
        break;
      case 'motivo de consulta':
        question = `¿Cuál es el motivo principal de consulta?`;
        break;
      case 'descripción de la enfermedad actual':
        question = `¿Podrías describir la enfermedad o condición actual? Te sugiero incluir inicio, evolución y síntomas asociados.`;
        break;
      case 'antecedentes médicos':
        question = `¿Qué antecedentes médicos relevantes presenta ${patientName}?`;
        break;
      case 'estado funcional del paciente':
        question = `¿Cuál es el estado funcional actual? (Por ejemplo: limitaciones en actividades diarias, uso de dispositivos de asistencia, etc.)`;
        break;
      case 'presión arterial':
        question = `¿Cuál es la lectura de presión arterial?`;
        break;
      case 'frecuencia cardíaca':
        question = `¿Cuál es la frecuencia cardíaca registrada?`;
        break;
      case 'examen musculoesquelético':
        question = `¿Podrías proporcionar detalles del examen musculoesquelético?`;
        break;
      case 'examen neurológico':
        question = `¿Cuáles son los hallazgos del examen neurológico?`;
        break;
      case 'diagnósticos diferenciales':
        question = `Basado en la evaluación, ¿cuáles son los diagnósticos diferenciales que estás considerando?`;
        break;
      case 'plan de tratamiento':
        question = `¿Cuál es el plan de tratamiento propuesto? Recuerda incluir seguimiento y criterios de reevaluación.`;
        break;
      default:
        question = `¿Podrías proporcionar información sobre ${nextField}?`;
    }
    
    // Agregar la pregunta a la conversación
    addMessage('assistant', question, 'question', nextField);
  };
  
  const handleUserResponse = () => {
    if (!userInput.trim()) return;
    
    // Agregar el mensaje del usuario a la conversación
    addMessage('user', userInput);
    
    // Si hay un campo activo, actualizar ese campo con la respuesta
    if (currentField) {
      onUpdateCase(currentField, userInput);
      
      // Agregar un mensaje de confirmación
      setTimeout(() => {
        addMessage(
          'assistant', 
          `Gracias, he registrado la información de ${currentField.toLowerCase()}.`, 
          'info'
        );
        
        // Limpiar el campo actual y sugerir el siguiente
        setCurrentField(null);
        
        // Pequeña pausa antes de sugerir el siguiente campo
        setTimeout(suggestNextField, 500);
      }, 500);
    } else {
      // Si el usuario solicita ver el formulario completo
      if (userInput.toLowerCase().includes('formulario') || 
          userInput.toLowerCase().includes('completo') ||
          userInput.toLowerCase().includes('ver todo')) {
        
        setTimeout(() => {
          addMessage(
            'assistant',
            'Mostrando el formulario completo para que puedas llenar todos los campos de una vez.',
            'info'
          );
          
          onRequestFullForm();
        }, 500);
      } else {
        // Respuesta genérica si no hay un campo específico en curso
        setTimeout(() => {
          addMessage(
            'assistant',
            '¿Hay algún campo específico que desees completar? También puedo mostrarte el formulario completo si lo prefieres.',
            'question'
          );
        }, 500);
      }
    }
    
    // Limpiar la entrada del usuario
    setUserInput('');
  };
  
  const addMessage = (
    sender: 'assistant' | 'user', 
    text: string, 
    type?: 'suggestion' | 'question' | 'warning' | 'info',
    field?: string
  ) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender,
      text,
      timestamp: new Date(),
      type,
      field
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  const getMessageClasses = (message: Message): string => {
    const baseClasses = "rounded-lg p-3 max-w-[80%]";
    
    if (message.sender === 'assistant') {
      const typeClasses = {
        suggestion: "bg-blue-50 text-blue-800 border border-blue-200",
        question: "bg-indigo-50 text-indigo-800 border border-indigo-200",
        warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
        info: "bg-gray-50 text-gray-800 border border-gray-200"
      };
      
      return `${baseClasses} mr-auto ${message.type ? typeClasses[message.type] : typeClasses.info}`;
    } else {
      return `${baseClasses} ml-auto bg-primary-100 text-primary-800 border border-primary-200`;
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUserResponse();
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="flex items-center p-4 bg-primary-700 text-white">
        <ChatAltIcon className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-medium">Asistente Clínico</h3>
      </div>
      
      {/* Área de la conversación */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            {message.sender === 'assistant' && (
              <div className="flex-shrink-0 mr-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <span className="text-xs font-bold">AI</span>
                </div>
              </div>
            )}
            
            <div className={getMessageClasses(message)}>
              <p className="text-sm">{message.text}</p>
              
              {/* Si es una sugerencia, mostrar botón para agregar a campos activos */}
              {message.type === 'suggestion' && message.field && (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setCurrentField(message.field || null)}
                >
                  <PlusCircleIcon className="h-4 w-4 mr-1" />
                  Completar este campo
                </button>
              )}
            </div>
            
            {message.sender === 'user' && (
              <div className="flex-shrink-0 ml-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <UserCircleIcon className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      
      {/* Área de entrada */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center rounded-full border border-gray-300 bg-white px-3 py-1">
          <input
            type="text"
            placeholder={currentField 
              ? `Introduce información sobre ${currentField.toLowerCase()}...` 
              : "Escribe tu respuesta..."}
            className="flex-1 outline-none text-sm py-1"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            className="ml-2 rounded-full p-1 text-primary-600 hover:bg-primary-50"
            onClick={handleUserResponse}
            aria-label="Enviar mensaje"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-500">
          {missingFields.length > 0 
            ? `Faltan ${missingFields.length} campos por completar` 
            : "Todos los campos requeridos están completos"}
        </div>
      </div>
    </div>
  );
}; 