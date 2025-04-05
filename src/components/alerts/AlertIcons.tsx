import * as React from 'react';
import { ClinicalAlertSeverity, ClinicalAlertType } from './ClinicalAlert';

interface AlertIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface SeverityIconProps extends AlertIconProps {
  severity: ClinicalAlertSeverity;
}

interface TypeIconProps extends AlertIconProps {
  type: ClinicalAlertType;
}

/**
 * Componente que muestra un ícono según la severidad de la alerta
 */
export const AlertSeverityIcon: React.FC<SeverityIconProps> = ({
  severity,
  size = 'md',
  className = ''
}) => {

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    critical: 'text-red-600 dark:text-red-400',
    high: 'text-red-500 dark:text-red-400',
    moderate: 'text-amber-500 dark:text-amber-400',
    low: 'text-blue-500 dark:text-blue-400',
    info: 'text-gray-500 dark:text-gray-400'
  };

  const baseClass = `${sizeClasses[size]} ${colorClasses[severity]} ${className}`;

  switch (severity) {
    case 'critical':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        })
      ]);
    case 'high':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      ]);
    case 'moderate':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        })
      ]);
    case 'low':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      ]);
    case 'info':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      ]);
    default:
      return null;
  }
};

/**
 * Componente que muestra un ícono según el tipo de alerta
 */
export const AlertTypeIcon: React.FC<TypeIconProps> = ({
  type,
  size = 'md',
  className = ''
}) => {

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const baseClass = `${sizeClasses[size]} ${className}`;

  switch (type) {
    case 'contraindication':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        })
      ]);
    case 'interaction':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
        })
      ]);
    case 'monitoring':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        })
      ]);
    case 'advisory':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        })
      ]);
    case 'clinical-decision':
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        })
      ]);
    default:
      return React.createElement('svg', {
        className: baseClass,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg"
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        })
      ]);
  }
};

/**
 * Badge que muestra la severidad de una alerta
 */
export const SeverityBadge: React.FC<SeverityIconProps> = ({
  severity,
  size = 'md',
  className = ''
}) => {

  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const colorClasses = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    info: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  };

  return React.createElement('span', {
    className: `${baseClasses} ${sizeClasses[size]} ${colorClasses[severity]} ${className}`
  }, [
    React.createElement('AlertSeverityIcon', {
      key: 'icon',
      severity: severity,
      size: "sm",
      className: "mr-1"
    }),
    React.createElement('span', { key: 'text' },
      severity.charAt(0).toUpperCase() + severity.slice(1)
    )
  ]);
};

/**
 * Badge que muestra el tipo de alerta
 */
export const TypeBadge: React.FC<TypeIconProps> = ({
  type,
  size = 'md',
  className = ''
}) => {

  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const colorClasses = {
    'contraindication': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'interaction': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'monitoring': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'advisory': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    'clinical-decision': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  };

  // Función para convertir el tipo a un formato más legible
  const formatType = (type: ClinicalAlertType): string => {
    switch (type) {
      case 'contraindication':
        return 'Contraindicación';
      case 'interaction':
        return 'Interacción';
      case 'monitoring':
        return 'Monitoreo';
      case 'advisory':
        return 'Aviso';
      case 'clinical-decision':
        return 'Decisión Clínica';
      default:
        return type;
    }
  };

  return React.createElement('span', {
    className: `${baseClasses} ${sizeClasses[size]} ${colorClasses[type]} ${className}`
  }, [
    React.createElement('AlertTypeIcon', {
      key: 'icon',
      type: type,
      size: "sm",
      className: "mr-1"
    }),
    React.createElement('span', { key: 'text' }, formatType(type))
  ]);
};
