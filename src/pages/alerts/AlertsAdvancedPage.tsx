import * as React from 'react';
import { useState, useEffect } from 'react';
import AlertsPanel from '../../components/alerts/AlertsPanel';
import type { ClinicalAlertData } from '../../components/alerts/AlertsPanel';
import { ClinicalAlertSeverity, ClinicalAlertType } from '../../components/alerts/ClinicalAlert';

// Interfaz para los filtros de alertas
interface AlertFilters {
  showAcknowledged: boolean;
  severity?: string;
  type?: string;
}

const MOCK_PATIENT_ID = "P-12345";

// Función auxiliar para crear alertas de ejemplo
const createMockAlert = (
  title: string,
  description: string,
  severity: ClinicalAlertSeverity,
  type: ClinicalAlertType
): ClinicalAlertData => {
  const now = new Date().toISOString();
  return {
    id: `alert-${Math.random().toString(36).substring(2, 11)}`,
    title,
    description,
    severity,
    type,
    acknowledged: false,
    createdAt: now,
    actions: [
      {
        id: 'view',
        label: 'Ver detalles',
        action: 'view'
      },
      {
        id: 'acknowledge',
        label: 'Confirmar',
        action: 'custom'
      }
    ],
    relatedItems: [
      {
        id: MOCK_PATIENT_ID,
        name: "Paciente de prueba",
        type: "patient"
      }
    ]
  };
};

const AlertsAdvancedPage: React.FC = () => {
  const [alerts, setAlerts] = useState<ClinicalAlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Cargar alertas al montar el componente
  useEffect(() => {
    loadAlerts();
  }, []);

  // Función para cargar alertas
  const loadAlerts = () => {
    // Simular una espera para obtener datos
    setLoading(true);
    setTimeout(() => {
      // Crear algunas alertas de ejemplo manualmente
      generateSampleAlerts();
      setLoading(false);
    }, 1000);
  };

  // Generar alertas de ejemplo
  const generateSampleAlerts = () => {
    try {
      // Creamos alertas de ejemplo directamente
      const mockAlerts = [
        createMockAlert(
          "Posible reacción adversa a medicamento",
          "El paciente ha reportado mareos y náuseas después de iniciar tratamiento con Amiodarona.",
          "high",
          "monitoring"
        ),
        createMockAlert(
          "Contraindicación detectada: Aspirina e Ibuprofeno",
          "Se ha detectado una posible interacción medicamentosa entre Aspirina e Ibuprofeno.",
          "high",
          "contraindication"
        ),
        createMockAlert(
          "Monitorizar función renal",
          "Paciente con insuficiencia renal requiere monitoreo de función renal con uso de Metformina.",
          "moderate",
          "monitoring"
        ),
        createMockAlert(
          "Verificar dosis de Enalapril",
          "La dosis de Enalapril podría ser alta considerando la función renal del paciente.",
          "moderate",
          "advisory"
        ),
        createMockAlert(
          "Recordatorio de control de HbA1c",
          "Paciente diabético requiere control trimestral de hemoglobina glicosilada.",
          "low",
          "monitoring"
        )
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      console.error("Error generando alertas:", error);
    }
  };

  // Manejar descarte de alertas
  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  // Manejar reconocimiento de alertas
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  // Manejar acciones de alerta
  const handleAlertAction = (id: string, actionId: string) => {
    if (actionId === 'acknowledge') {
      handleAcknowledgeAlert(id);
    } else if (actionId === 'intervene') {
      // Marca como reconocida tras la intervención
      handleAcknowledgeAlert(id);
      // Simular alguna acción de intervención
      alert(`Intervención registrada para alerta ${id}`);
    } else if (actionId === 'view-details' || actionId === 'view') {
      // Simular visualización de detalles
      alert(`Detalles de alerta ${id} visualizados`);
    }
  };

  // Manejar cambios en filtros
  const handleFilterChange = (filters: AlertFilters) => {
    setShowAcknowledged(filters.showAcknowledged);
    setSelectedSeverity(filters.severity || null);
    setSelectedType(filters.type || null);
  };

  // Regenerar alertas para la demo
  const handleRegenerateAlerts = () => {
    loadAlerts();
  };

  // Filtrar alertas según selecciones
  const filteredAlerts = alerts.filter(alert => {
    // Filtro por estado de reconocimiento
    if (!showAcknowledged && alert.acknowledged) {
      return false;
    }

    // Filtro por severidad
    if (selectedSeverity && alert.severity !== selectedSeverity) {
      return false;
    }

    // Filtro por tipo
    if (selectedType && alert.type !== selectedType) {
      return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sistema Avanzado de Alertas Clínicas
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Panel avanzado con capacidades mejoradas de filtrado y gestión de alertas clínicas
          para optimizar el flujo de trabajo médico.
        </p>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={handleRegenerateAlerts}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Regenerar Alertas
          </button>

          <div className="flex gap-4">
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
              value={selectedSeverity || ''}
              onChange={(e) => handleFilterChange({
                ...{ showAcknowledged, severity: selectedSeverity || undefined, type: selectedType || undefined },
                severity: e.target.value || undefined
              })}
              aria-label="Filtrar por severidad"
            >
              <option value="">Todas las severidades</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="moderate">Moderada</option>
              <option value="low">Baja</option>
              <option value="info">Informativa</option>
            </select>

            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
              value={selectedType || ''}
              onChange={(e) => handleFilterChange({
                ...{ showAcknowledged, severity: selectedSeverity || undefined, type: selectedType || undefined },
                type: e.target.value || undefined
              })}
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos los tipos</option>
              <option value="contraindication">Contraindicación</option>
              <option value="monitoring">Monitoreo</option>
              <option value="clinical-decision">Decisión clínica</option>
              <option value="interaction">Interacción</option>
              <option value="advisory">Aviso</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AlertsPanel
            alerts={filteredAlerts}
            title="Alertas Clínicas"
            onDismiss={handleDismissAlert}
            onAction={handleAlertAction}
            loading={loading}
            emptyMessage="No se encontraron alertas con los filtros seleccionados"
          />

          {filteredAlerts.length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron alertas con los filtros seleccionados
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Información del Paciente</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Paciente</h3>
                <p className="text-gray-900 dark:text-white">{MOCK_PATIENT_ID}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Condiciones</h3>
                <ul className="list-disc pl-5 text-gray-900 dark:text-white">
                  <li>Insuficiencia renal crónica estadio 2</li>
                  <li>Hipertensión arterial</li>
                  <li>Diabetes mellitus tipo 2</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Medicamentos</h3>
                <ul className="list-disc pl-5 text-gray-900 dark:text-white">
                  <li>Metformina 850mg</li>
                  <li>Enalapril 10mg</li>
                  <li>Aspirina 100mg</li>
                  <li>Ibuprofeno 400mg</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estadísticas de Alertas</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Críticas/Altas</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Moderadas</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {alerts.filter(a => a.severity === 'moderate').length}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bajas/Info</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {alerts.filter(a => a.severity === 'low' || a.severity === 'info').length}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reconocidas</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {alerts.filter(a => a.acknowledged).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Filtros Aplicados</h2>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h3>
                <p className="text-gray-900 dark:text-white">
                  {showAcknowledged ? 'Todas las alertas' : 'Solo no reconocidas'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Severidad</h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedSeverity ? selectedSeverity.charAt(0).toUpperCase() + selectedSeverity.slice(1) : 'Todas'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedType ? selectedType.replace('-', ' ').charAt(0).toUpperCase() + selectedType.replace('-', ' ').slice(1) : 'Todos'}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando {filteredAlerts.length} de {alerts.length} alertas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsAdvancedPage;
