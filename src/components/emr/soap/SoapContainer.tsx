import React, { useState, useMemo } from 'react';
import { Tab } from '@headlessui/react';
import { SpecialtyType } from '../../../types/clinical';

// Componentes SOAP - Se cargarán dinámicamente según la especialidad y con memoización
const SubjectiveComponent = React.memo(React.lazy(() => import('./subjective/SubjectiveContainer')));
const ObjectiveComponent = React.memo(React.lazy(() => import('./objective/ObjectiveContainer')));
const AssessmentComponent = React.memo(React.lazy(() => import('./assessment/AssessmentContainer')));
const PlanComponent = React.memo(React.lazy(() => import('./plan/PlanContainer')));

// Memoizamos la función classNames para evitar recreaciones innecesarias
const classNames = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface SoapContainerProps {
  patientId: string;
  specialty: SpecialtyType;
  visitId?: string;
  readOnly?: boolean;
}

/**
 * Contenedor principal para la estructura SOAP.
 * Diseñado con arquitectura adaptable para soportar diferentes especialidades médicas.
 */
export default function SoapContainer({ 
  patientId, 
  specialty = 'physiotherapy', // Valor predeterminado para MVP
  visitId,
  readOnly = false 
}: SoapContainerProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Memoizamos la configuración para evitar cálculos innecesarios en re-renders
  const config = useMemo(() => {
    // Esta función permite cargar configuraciones específicas según la especialidad
    // En futuras implementaciones, aquí se cargarán configuraciones específicas
    // para diferentes especialidades (medicina general, cardiología, etc.)
    
    // Por ahora, solo tenemos fisioterapia como parte del MVP
    return {
      tabs: ['Subjetivo', 'Objetivo', 'Evaluación', 'Plan'],
      icons: ['chat', 'eye', 'clipboard-check', 'clipboard-list'],
    };
  }, [specialty]);

  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex p-1 space-x-1 bg-blue-50 rounded-xl">
          {config.tabs.map((tab, idx) => (
            <Tab
              key={idx}
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm leading-5 font-medium rounded-lg',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                  selected
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-primary-600'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {/* Solo renderizamos el panel activo para mejorar el rendimiento */}
          <Tab.Panel
            key={0}
            className={classNames(
              'bg-white rounded-xl p-3',
              'focus:outline-none'
            )}
          >
            {activeTab === 0 && (
              <React.Suspense fallback={<div>Cargando...</div>}>
                <SubjectiveComponent 
                  patientId={patientId} 
                  specialty={specialty} 
                  visitId={visitId}
                  readOnly={readOnly}
                />
              </React.Suspense>
            )}
          </Tab.Panel>
          
          <Tab.Panel
            key={1}
            className={classNames(
              'bg-white rounded-xl p-3',
              'focus:outline-none'
            )}
          >
            {activeTab === 1 && (
              <React.Suspense fallback={<div>Cargando...</div>}>
                <ObjectiveComponent 
                  patientId={patientId} 
                  specialty={specialty} 
                  visitId={visitId}
                  readOnly={readOnly}
                />
              </React.Suspense>
            )}
          </Tab.Panel>
          
          <Tab.Panel
            key={2}
            className={classNames(
              'bg-white rounded-xl p-3',
              'focus:outline-none'
            )}
          >
            {activeTab === 2 && (
              <React.Suspense fallback={<div>Cargando...</div>}>
                <AssessmentComponent 
                  patientId={patientId} 
                  specialty={specialty} 
                  visitId={visitId}
                  readOnly={readOnly}
                />
              </React.Suspense>
            )}
          </Tab.Panel>
          
          <Tab.Panel
            key={3}
            className={classNames(
              'bg-white rounded-xl p-3',
              'focus:outline-none'
            )}
          >
            {activeTab === 3 && (
              <React.Suspense fallback={<div>Cargando...</div>}>
                <PlanComponent
                  patientId={patientId}
                  specialty={specialty} 
                  visitId={visitId}
                  readOnly={readOnly}
                />
              </React.Suspense>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 