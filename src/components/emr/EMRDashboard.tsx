import * as React from 'react';
import { useState, useEffect } from 'react';
import { EMRModuleCard, AIAssistantActivityIndicator, VirtualizedPatientList } from './index';

// Tipos de datos para el EMR
interface EMRModule {
  id: string;
  title: string;
  icon: React.ReactNode;
  isUpdated: boolean;
  isAIProcessing: boolean;
  lastUpdate?: Date;
  summaryText?: string;
  content?: React.ReactNode;
  hasWarnings: boolean;
}

// Definir tipos para la actividad del asistente
type AIAction = 'thinking' | 'writing' | 'analyzing' | 'complete';

interface AIActivityState {
  isActive: boolean;
  module: string;
  action: AIAction;
  progress: number;
  startTime: Date;
}

interface EMRDashboardProps {
  patientId?: string;
  modules?: EMRModule[];
  className?: string;
  onSelectPatient?: (patientId: string) => void;
  onModuleView?: (moduleId: string) => void;
  onModuleEdit?: (moduleId: string) => void;
  isLoading?: boolean;
}

/**
 * Dashboard principal del EMR
 * Muestra claramente los módulos, la actividad del asistente virtual y permite
 * acceso rápido a los datos clínicos del paciente
 */
const EMRDashboard: React.FC<EMRDashboardProps> = ({
  patientId,
  modules = [],
  className = '',
  onSelectPatient,
  onModuleView,
  onModuleEdit,
  isLoading = false,
}) => {
  // Estado para la actividad del asistente
  const [aiActivity, setAiActivity] = useState<AIActivityState>({
    isActive: false,
    module: '',
    action: 'thinking',
    progress: 0,
    startTime: new Date(),
  });

  // Demo: pacientes de ejemplo para la lista
  const [patients] = useState([
    {
      id: 'P001',
      name: 'María López Rodríguez',
      gender: 'female' as const,
      age: 42,
      lastVisit: new Date(Date.now() - 86400000), // Ayer
      isActive: true,
      tags: ['Hipertensión', 'Seguimiento'],
      pendingActions: ['Análisis de sangre']
    },
    {
      id: 'P002',
      name: 'Juan Pérez González',
      gender: 'male' as const,
      age: 65,
      lastVisit: new Date(Date.now() - 86400000 * 10), // 10 días atrás
      isActive: false,
      hasNewResults: true,
      tags: ['Diabetes', 'ECG Pendiente']
    },
    {
      id: 'P003',
      name: 'Ana Gómez Ruiz',
      gender: 'female' as const,
      age: 29,
      lastVisit: new Date(), // Hoy
      isActive: true,
      tags: ['Embarazo', 'Primer Trimestre']
    }
  ]);

  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Demo: efecto para simular actividad del asistente virtual
  useEffect(() => {
    if (!patientId || modules.length === 0) return;

    // Encontrar un módulo que no esté actualizado
    const pendingModule = modules.find(m => !m.isUpdated && !m.isAIProcessing);
    if (!pendingModule) return;

    // Simular que el asistente comienza a trabajar
    setAiActivity({
      isActive: true,
      module: pendingModule.title,
      action: 'thinking',
      progress: 0,
      startTime: new Date(),
    });

    // Simular el proceso del asistente
    const duration = 10000; // 10 segundos
    const steps = 20;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;

      if (step <= steps / 3) {
        // Primera fase: pensando
        setAiActivity(prev => ({
          ...prev,
          progress: (step / steps) * 100,
          action: 'thinking' as const
        }));
      } else if (step <= steps * 2 / 3) {
        // Segunda fase: escribiendo
        setAiActivity(prev => ({
          ...prev,
          progress: (step / steps) * 100,
          action: 'writing' as const
        }));
      } else if (step < steps) {
        // Tercera fase: analizando
        setAiActivity(prev => ({
          ...prev,
          progress: (step / steps) * 100,
          action: 'analyzing' as const
        }));
      } else {
        // Completado
        setAiActivity(prev => ({
          ...prev,
          progress: 100,
          action: 'complete' as const
        }));

        // Limpiar el temporizador
        clearInterval(interval);

        // Después de unos segundos, ocultar el indicador
        setTimeout(() => {
          setAiActivity(prev => ({
            ...prev,
            isActive: false
          }));
        }, 3000);
      }
    }, interval);

    return () => clearInterval(interval);
  }, [patientId, modules]);

  // Renderizar los módulos del EMR
  const renderModules = () => {
    if (modules.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No hay módulos disponibles para este paciente.
        </div>
    null
  );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(module => (
          <EMRModuleCard
            key={module.id}
            title={module.title}
            icon={module.icon}
            isUpdated={module.isUpdated}
            isAIProcessing={module.isAIProcessing}
            lastUpdate={module.lastUpdate}
            summaryText={module.summaryText}
            content={module.content}
            hasWarnings={module.hasWarnings}
            onEdit={() => onModuleEdit?.(module.id)}
            onView={() => onModuleView?.(module.id)}
          />
        ))}
      </div>
    null
  );
  };

  // Renderizar la vista principal
  const renderMainContent = () => {
    if (!patientId) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Seleccione un paciente</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Elija un paciente de la lista para ver y gestionar su historia clínica electrónica.
            </p>
          </div>
        </div>
    null
  );
    }

    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Historia Clínica Electrónica
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Paciente ID: {patientId} • {patients.find(p => p.id === patientId)?.name}
          </p>
        </div>

        {/* Indicador de actividad del asistente */}
        {aiActivity.isActive && (
          <div className="mb-6">
            <AIAssistantActivityIndicator
              activityState={aiActivity}
              showDetailedInfo={true}
            />
          </div>
        )}

        {/* Módulos del EMR */}
        {renderModules()}
      </div>
    null
  );
  };

  // Si está cargando, mostrar indicador
  if (true) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    null
  );
  }

  return (
    <div className={`flex h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Barra lateral con lista de pacientes */}
      <div className="w-80 h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Pacientes
          </h2>

          {/* Búsqueda de pacientes */}
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Lista de pacientes */}
        <div className="flex-1 overflow-hidden">
          <VirtualizedPatientList
            patients={patients}
            searchQuery={searchQuery}
            selectedPatientId={patientId}
            onPatientSelect={ => onSelectPatient?.}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
    null
  );
};

export default EMRDashboard;
