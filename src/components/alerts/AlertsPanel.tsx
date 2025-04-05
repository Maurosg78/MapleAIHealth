import * as React from 'react';
import { useState, useMemo, useCallback, memo } from 'react';
import ClinicalAlert, { ClinicalAlertType, ClinicalAlertSeverity } from './ClinicalAlert';
import { AlertSeverityIcon, AlertTypeIcon } from './AlertIcons';

export interface ClinicalAlertData {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  type: ClinicalAlertType;
  severity: ClinicalAlertSeverity;
  acknowledged: boolean;
  url?: string;
  relatedPatientId?: string;
  relatedMedication?: string;
  relatedCondition?: string;
  recommendations?: string[];
  evidence?: {
    level: string;
    source: string;
  };
  relatedItems?: Array<{
    id: string;
    name: string;
    type: 'medication' | 'condition' | 'patient' | 'appointment';
  }>;
  actions?: Array<{
    id: string;
    label: string;
    action: 'dismiss' | 'view' | 'custom';
    url?: string;
  }>;
}

export interface AlertsPanelProps {
  alerts: ClinicalAlertData[];
  title?: string;
  loading?: boolean;
  error?: Error | null;
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string, actionId: string) => void;
  className?: string;
  emptyMessage?: string;
}

export const AlertsPanel = memo(({
  alerts = [],
  title = 'Alertas Clínicas',
  loading = false,
  error = null,
  onDismiss,
  onAction,
  className = '',
  emptyMessage = 'No hay alertas disponibles en este momento.'
}: AlertsPanelProps) => {
  // Estados para los filtros
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedSeverities, setSelectedSeverities] = useState<ClinicalAlertSeverity[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ClinicalAlertType[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Todas las severidades y tipos disponibles
  const allSeverities: ClinicalAlertSeverity[] = ['critical', 'high', 'moderate', 'low', 'info'];
  const allTypes: ClinicalAlertType[] = ['contraindication', 'interaction', 'monitoring', 'advisory', 'clinical-decision'];

  // Memoizar las alertas filtradas
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Filtrado por severidad
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(alert.severity)) {
        return false;
      }

      // Filtrado por tipo
      if (selectedTypes.length > 0 && !selectedTypes.includes(alert.type)) {
        return false;
      }

      // Filtrado por estado de reconocimiento
      if (!showAcknowledged && alert.acknowledged) {
        return false;
      }

      return true;
    });
  }, [alerts, selectedSeverities, selectedTypes, showAcknowledged]);

  // Manejar cambios en los filtros de severidad
  const handleSeverityFilterChange = useCallback((severity: ClinicalAlertSeverity) => {
    setSelectedSeverities(prevSelected => {
      if (prevSelected.includes(severity)) {
        return prevSelected.filter(s => s !== severity);
      } else {
        return [...prevSelected, severity];
      }
    });
  }, []);

  // Manejar cambios en los filtros de tipo
  const handleTypeFilterChange = useCallback((type: ClinicalAlertType) => {
    setSelectedTypes(prevSelected => {
      if (prevSelected.includes(type)) {
        return prevSelected.filter(t => t !== type);
      } else {
        return [...prevSelected, type];
      }
    });
  }, []);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setSelectedSeverities([]);
    setSelectedTypes([]);
    setShowAcknowledged(false);
  }, []);

  // Renderizado del panel de filtros
  const renderFilterPanel = () => {
    if (!isFilterExpanded) return null;

    return React.createElement('div', {
      className: 'p-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 space-y-4'
    }, [
      // Sección de severidad
      React.createElement('div', { key: 'severity-filters', className: 'space-y-2' }, [
        React.createElement('h4', { key: 'severity-title', className: 'text-sm font-medium text-gray-700 dark:text-gray-300' }, 'Filtrar por severidad'),
        React.createElement('div', { key: 'severity-options', className: 'flex flex-wrap gap-2' },
          allSeverities.map(severity =>
            React.createElement('button', {
              key: severity,
              type: 'button',
              className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                selectedSeverities.includes(severity)
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`,
              onClick: () => handleSeverityFilterChange(severity)
            }, [
              React.createElement(AlertSeverityIcon, {
                key: `icon-${severity}`,
                severity,
                size: 'sm',
                className: 'mr-1'
              }),
              severity.charAt(0).toUpperCase() + severity.slice(1)
            ])
          )
        )
      ]),

      // Sección de tipo
      React.createElement('div', { key: 'type-filters', className: 'space-y-2' }, [
        React.createElement('h4', { key: 'type-title', className: 'text-sm font-medium text-gray-700 dark:text-gray-300' }, 'Filtrar por tipo'),
        React.createElement('div', { key: 'type-options', className: 'flex flex-wrap gap-2' },
          allTypes.map(type =>
            React.createElement('button', {
              key: type,
              type: 'button',
              className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                selectedTypes.includes(type)
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`,
              onClick: () => handleTypeFilterChange(type)
            }, [
              React.createElement(AlertTypeIcon, {
                key: `icon-${type}`,
                type,
                size: 'sm',
                className: 'mr-1'
              }),
              type
            ])
          )
        )
      ]),

      // Mostrar reconocidas
      React.createElement('div', { key: 'acknowledged-filter', className: 'flex items-center' }, [
        React.createElement('label', {
          key: 'acknowledged-label',
          className: 'inline-flex items-center cursor-pointer'
        }, [
          React.createElement('input', {
            key: 'acknowledged-input',
            type: 'checkbox',
            checked: showAcknowledged,
            onChange: () => setShowAcknowledged(!showAcknowledged),
            className: 'sr-only'
          }),
          React.createElement('span', {
            key: 'acknowledged-toggle',
            className: `${showAcknowledged ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
          },
            React.createElement('span', {
              key: 'toggle-dot',
              className: `${showAcknowledged ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`
            })
          ),
          React.createElement('span', {
            key: 'toggle-label',
            className: 'ml-3 text-sm font-medium text-gray-700 dark:text-gray-300'
          }, 'Mostrar alertas reconocidas')
        ])
      ]),

      // Botón para limpiar filtros
      React.createElement('div', { key: 'filter-actions', className: 'flex justify-end pt-2' },
        React.createElement('button', {
          type: 'button',
          className: 'text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
          onClick: clearFilters
        }, 'Limpiar filtros')
      )
    ]);
  };

  // Renderizado del estado vacío
  const renderEmptyState = () => {
    if (loading || error || filteredAlerts.length > 0) return null;

    return React.createElement('div', {
      className: 'py-8 px-4 text-center'
    }, [
      React.createElement('svg', {
        key: 'empty-icon',
        className: 'mx-auto h-12 w-12 text-gray-400',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24',
        'aria-hidden': true
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '2',
          d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
        })
      ]),
      React.createElement('h3', {
        key: 'empty-title',
        className: 'mt-2 text-sm font-medium text-gray-900 dark:text-gray-100'
      }, 'No hay alertas'),
      React.createElement('p', {
        key: 'empty-message',
        className: 'mt-1 text-sm text-gray-500 dark:text-gray-400'
      }, emptyMessage)
    ]);
  };

  // Renderizado del estado de carga
  const renderLoadingState = () => {
    if (!loading) return null;

    return React.createElement('div', {
      className: 'py-6 px-4 text-center'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'
      }),
      React.createElement('p', {
        key: 'loading-text',
        className: 'mt-2 text-sm text-gray-500'
      }, 'Cargando alertas...')
    ]);
  };

  // Renderizado del estado de error
  const renderErrorState = () => {
    if (!error) return null;

    return React.createElement('div', {
      className: 'py-6 px-4 text-center text-red-500'
    }, [
      React.createElement('svg', {
        key: 'error-icon',
        className: 'mx-auto h-12 w-12',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '2',
          d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        })
      ]),
      React.createElement('h3', {
        key: 'error-title',
        className: 'mt-2 text-lg font-medium'
      }, 'Error al cargar alertas'),
      React.createElement('p', {
        key: 'error-message',
        className: 'mt-1'
      }, error.message)
    ]);
  };

  // Función para renderizar el botón de filtro con el atributo aria-expanded correcto
  const renderFilterButton = () => {
    return React.createElement('button', {
      type: 'button',
      className: 'inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
      onClick: () => setIsFilterExpanded(!isFilterExpanded),
      'aria-expanded': isFilterExpanded ? 'true' : 'false'
    }, [
      React.createElement('svg', {
        key: 'filter-icon',
        className: '-ml-0.5 mr-2 h-4 w-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, [
        React.createElement('path', {
          key: 'path',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '2',
          d: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
        })
      ]),
      'Filtrar'
    ]);
  };

  // Renderizado del componente
  return React.createElement('div', {
    className: `bg-white dark:bg-gray-900 shadow overflow-hidden rounded-lg ${className}`
  }, [
    // Encabezado
    React.createElement('div', {
      key: 'header',
      className: 'px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-lg font-medium text-gray-900 dark:text-gray-100'
      }, title),
      renderFilterButton()
    ]),

    // Panel de filtros (condicional)
    renderFilterPanel(),

    // Estados de carga, error o contenido vacío
    renderLoadingState(),
    renderErrorState(),
    renderEmptyState(),

    // Lista de alertas
    filteredAlerts.length > 0 ? React.createElement('div', {
      key: 'alert-list',
      className: 'divide-y divide-gray-200 dark:divide-gray-700'
    },
      filteredAlerts.map(alert =>
        React.createElement(ClinicalAlert, {
          key: alert.id,
          id: alert.id,
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          type: alert.type,
          timestamp: new Date(alert.createdAt),
          acknowledged: alert.acknowledged,
          relatedItems: alert.relatedItems,
          actions: alert.actions,
          onDismiss: onDismiss ? () => onDismiss(alert.id) : undefined,
          onAction: onAction ? (actionId) => onAction(alert.id, actionId) : undefined
        })
      )
    ) : null
  ]);
});

AlertsPanel.displayName = 'AlertsPanel';

export default AlertsPanel;
