import * as React from 'react';
import { useState, useCallback, memo } from 'react';

interface EMRModuleCardProps {
  title: string;
  icon?: React.ReactNode;
  status?: 'updated' | 'pending' | 'processing' | 'warning';
  lastUpdate?: Date;
  summaryText?: string;
  content?: React.ReactNode;
  onEdit?: () => void;
  onView?: () => void;
  className?: string;
}

/**
 * Tarjeta de módulo EMR optimizada con estilos Tailwind y rendimiento mejorado
 */
const EMRModuleCard: React.FC<EMRModuleCardProps> = memo(({
  title,
  icon,
  status = 'pending',
  lastUpdate,
  summaryText,
  content,
  onEdit,
  onView,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handler de toggle optimizado
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Formatear fecha de última actualización
  const formattedDate = useCallback((date?: Date): string => {
    if (!date) return 'No actualizado';

    // Si es hoy, mostrar hora
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateValue = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateValue.getTime() === today.getTime()) {
      return `Hoy, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // Si es ayer
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (dateValue.getTime() === yesterday.getTime()) {
      return `Ayer, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // Otro día
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }, []);

  // Configuración visual según el status
  const statusConfig = {
    updated: {
      borderClass: 'border-green-200 dark:border-green-900',
      iconColor: 'text-green-500 dark:text-green-400',
      bgClass: '',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'Actualizado',
    },
    pending: {
      borderClass: '',
      iconColor: 'text-gray-500 dark:text-gray-400',
      bgClass: '',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Pendiente',
    },
    processing: {
      borderClass: 'border-blue-200 dark:border-blue-900',
      iconColor: 'text-blue-500 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      icon: (
        <div className="relative mr-1 w-4 h-4 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-500 animate-ping opacity-75"></div>
        </div>
      ),
      text: 'Procesando',
    },
    warning: {
      borderClass: 'border-amber-200 dark:border-amber-900',
      iconColor: 'text-amber-500 dark:text-amber-400',
      bgClass: '',
      icon: (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      text: 'Requiere atención',
    },
  };

  const currentStatus = statusConfig[status];

  // Creamos un renderizado condicional para el botón de expansión
  const renderToggleButton = () => {
    if (isExpanded) {
      return (
        <button
          onClick={toggleExpanded}
          className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Contraer contenido"
          aria-expanded="true"
        >
          <svg
            className="w-5 h-5 transform rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
    null
  );
    }

    return (
      <button
        onClick={toggleExpanded}
        className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Expandir contenido"
        aria-expanded="false"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    null
  );
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 border ${currentStatus.borderClass || 'border-gray-200 dark:border-gray-700'} rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <div className="mt-1 flex items-center">
              <div className={`flex items-center ${currentStatus.iconColor}`}>
                {currentStatus.icon}
                <span className="text-xs font-medium">{currentStatus.text}</span>
              </div>
              {lastUpdate && (
                <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                  Actualizado: {formattedDate(lastUpdate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {onEdit && (
            <button
              onClick={onEdit}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Editar módulo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {onView && (
            <button
              onClick={onView}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Ver detalles del módulo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}

          {renderToggleButton()}
        </div>
      </div>

      {/* Resumen visible siempre */}
      {summaryText && !isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {summaryText}
          </p>
        </div>
      )}

      {/* Contenido expandido */}
      {isExpanded && content && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {content}
        </div>
      )}

      {/* Indicador de procesamiento */}
      {status === 'processing' && (
        <div className={`p-3 ${currentStatus.bgClass} border-t ${currentStatus.borderClass || 'border-gray-100'}`}>
          <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando información para este módulo
          </p>
        </div>
      )}
    </div>
    null
  );
});

EMRModuleCard.displayName = 'EMRModuleCard';

export default EMRModuleCard;
