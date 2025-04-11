import * as React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';

// Define tipos para el estado de actividad del asistente
type ActivityState = 'thinking' | 'writing' | 'analyzing' | 'complete' | 'idle';

interface AIAssistantActivityIndicatorProps {
  state: ActivityState;
  elapsedTime?: number; // Tiempo transcurrido en segundos
  completionPercentage?: number; // Porcentaje de completitud (0-100)
  taskDescription?: string; // Descripción de la tarea actual
  className?: string;
}

/**
 * Componente que muestra la actividad del asistente virtual en el EMR
 * Indica claramente al personal médico cuando el asistente está completando información
 */
const AIAssistantActivityIndicator: React.FC<AIAssistantActivityIndicatorProps> = memo(({
  state = 'idle',
  elapsedTime = 0,
  completionPercentage = 0,
  taskDescription = '',
  className = ''
}) => {
  const [displayTime, setDisplayTime] = useState(elapsedTime);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Actualizar el tiempo cada segundo cuando el asistente está activo
  useEffect(() => {
    if (state !== 'complete' && state !== 'idle') {
      const id = setInterval(() => {
        setDisplayTime(prev => prev + 1);
      }, 1000);

      setIntervalId(id);

      return () => {
        if (id) clearInterval(id);
      };
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state, intervalId]);

  // Formatear el tiempo transcurrido en formato mm:ss
  const formatElapsedTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Obtener el mensaje según el estado
  const getStateMessage = useCallback((currentState: ActivityState): string => {
    switch (currentState) {
      case 'thinking':
        return 'Analizando información...';
      case 'writing':
        return 'Escribiendo respuesta...';
      case 'analyzing':
        return 'Procesando datos clínicos...';
      case 'complete':
        return 'Tarea completada';
      default:
        return 'Asistente inactivo';
    }
  }, []);

  // Obtener el color de la barra de progreso según el estado
  const getStatusColor = useCallback((currentState: ActivityState): string => {
    switch (currentState) {
      case 'thinking':
        return 'bg-blue-500';
      case 'writing':
        return 'bg-green-500';
      case 'analyzing':
        return 'bg-purple-500';
      case 'complete':
        return 'bg-teal-500';
      default:
        return 'bg-gray-300';
    }
  }, []);

  return (
    <div className={`flex flex-col rounded-lg border border-gray-200 p-3 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full ${state !== 'idle' ? 'animate-pulse' : ''} ${getStatusColor(state)} mr-2`}></div>
          <span className="font-medium text-gray-700">{getStateMessage(state)}</span>
        </div>
        <div className="text-sm text-gray-500">
          {state !== 'idle' && state !== 'complete' && (
            <span>Tiempo: {formatElapsedTime(displayTime)}</span>
          )}
        </div>
      </div>

      {taskDescription && (
        <div className="text-sm text-gray-600 mb-2">{taskDescription}</div>
      )}

      {state !== 'idle' && (
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStatusColor(state)} transition-all duration-300 ease-in-out`}
            style={{ width: `${state === 'complete' ? 100 : completionPercentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
});

AIAssistantActivityIndicator.displayName = 'AIAssistantActivityIndicator';

export default AIAssistantActivityIndicator;
