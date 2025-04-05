import * as React from 'react';
import { memo, useState, useEffect, useCallback } from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  type?: 'spinner' | 'dots' | 'progress' | 'pulse';
  progress?: number;
  isIndeterminate?: boolean;
  text?: string;
  ariaLabel?: string;
  showPercentage?: boolean;
}

/**
 * Componente optimizado para mostrar indicadores de carga
 * con soporte para diferentes tamaños, variantes y progreso.
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = memo(({
  size = 'md',
  color = '#6366f1', // indigo-500
  className = '',
  type = 'spinner',
  progress = 0,
  isIndeterminate = false,
  text = '',
  ariaLabel = 'Cargando...',
  showPercentage = false
}) => {
  const [dots, setDots] = useState<string>('.');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Tamaños para diferentes componentes
  const sizes = {
    sm: {
      spinner: 'w-4 h-4',
      dots: 'text-sm',
      progress: 'h-1',
      pulse: 'w-4 h-4'
    },
    md: {
      spinner: 'w-8 h-8',
      dots: 'text-base',
      progress: 'h-2',
      pulse: 'w-8 h-8'
    },
    lg: {
      spinner: 'w-12 h-12',
      dots: 'text-lg',
      progress: 'h-3',
      pulse: 'w-12 h-12'
    }
  };

  const updateDots = useCallback(() => {
    setDots(prev => prev.length >= 3 ? '.' : prev + '.');
  }, []);

  // Animación de puntos para tipo 'dots'
  useEffect(() => {
    if (type === 'dots' && !intervalId) {
      const id = setInterval(updateDots, 500);
      setIntervalId(id);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [type, updateDots, intervalId]);

  const renderSpinner = () => (
    <output
      className={`inline-flex items-center ${className}`}
      aria-label={ariaLabel}
    >
      <svg
        className={`animate-spin ${sizes[size].spinner}`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <span className="ml-2">{text}</span>}
    </output>
  );

  const renderDots = () => (
    <output
      className={`inline-flex items-center ${sizes[size].dots} ${className}`}
      aria-label={ariaLabel}
    >
      {text ? `${text}${dots}` : dots}
    </output>
  );

  const renderProgress = () => {
    const progressValue = isIndeterminate ? undefined : Math.min(Math.max(progress, 0), 100);
    return (
      <div className={`w-full ${className}`}>
        <progress
          className={`w-full ${sizes[size].progress} bg-gray-200 rounded-full overflow-hidden`}
          value={progressValue}
          max={100}
          aria-label={ariaLabel}
        />
        {(text || showPercentage) && (
          <div className="mt-1 text-sm text-center">
            {text} {showPercentage && !isIndeterminate && `${progressValue}%`}
          </div>
        )}
      </div>
    );
  };

  const renderPulse = () => (
    <output
      className={`inline-flex items-center ${className}`}
      aria-label={ariaLabel}
    >
      <div
        className={`${sizes[size].pulse} rounded-full animate-pulse`}
        style={{ backgroundColor: color }}
      />
      {text && <span className="ml-2">{text}</span>}
    </output>
  );

  // Renderizar indicador basado en el tipo
  switch (type) {
    case 'spinner':
      return renderSpinner();
    case 'dots':
      return renderDots();
    case 'progress':
      return renderProgress();
    case 'pulse':
      return renderPulse();
    default:
      return renderSpinner();
  }
});

// Asignar displayName para depuración en React DevTools
LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;
