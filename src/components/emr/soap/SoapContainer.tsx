import React, { useState, useRef, useCallback } from 'react';
import { Tab } from '@headlessui/react';;;;;
import { SubjectiveData, ObjectiveData, AssessmentData, PlanData, SOAPData, SpecialtyType } from '../../../types/clinical';;;;;
import { validateRequiredFields } from './validation';;;;;
import { ClinicalAssistant } from '../ai/ClinicalAssistant';;;;;

// Componentes SOAP - Se cargarán dinámicamente según la especialidad y con memoización
const SubjectiveComponent = React.memo(React.lazy(() => import('./subjective/SubjectiveContainer')));
const ObjectiveComponent = React.memo(React.lazy(() => import('./objective/ObjectiveContainer')));
const AssessmentComponent = React.memo(React.lazy(() => import('./assessment/AssessmentContainer')));
const PlanComponent = React.memo(React.lazy(() => import('./plan/PlanContainer')));

type SOAPSectionData = SubjectiveData | ObjectiveData | AssessmentData | PlanData;

const TAB_IDS = ['subjective', 'objective', 'assessment', 'plan'] as const;
type TabId = typeof TAB_IDS[number];

interface SoapContainerProps {
  patientId: string;
  specialty: SpecialtyType;
  visitId?: string;
  readOnly?: boolean;
  onSaveComplete?: (valid: boolean) => void;
  showAssistant?: boolean;
}

/**
 * Contenedor principal para la estructura SOAP.
 * Diseñado con arquitectura adaptable para soportar diferentes especialidades médicas.
 */
export default function SoapContainer({ 
  patientId, 
  specialty = 'physiotherapy',
  visitId,
  readOnly = false,
  onSaveComplete,
  showAssistant = true
}: SoapContainerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [soapData, setSoapData] = useState<SOAPData>({
    patientId: patientId || '',
    subjective: null,
    objective: null,
    assessment: null,
    plan: null
  });

  // Referencias a los componentes del formulario
  const formRefs = {
    subjective: useRef<HTMLDivElement>(null),
    objective: useRef<HTMLDivElement>(null),
    assessment: useRef<HTMLDivElement>(null),
    plan: useRef<HTMLDivElement>(null)
  };

  // Función para manejar los cambios de datos en cada sección
  const handleDataChange = useCallback((section: TabId, data: SOAPSectionData) => {
    setSoapData(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  // Función para validar todos los datos
  const validateAllSections = useCallback(() => {
    const sectionsToValidate: Array<keyof SOAPData> = 
      ['subjective', 'objective', 'assessment', 'plan'];
    
    const validationResults = sectionsToValidate.map(section => {
      const sectionData = soapData[section];
      if (!sectionData) return { section, valid: false };
      
      const result = validateRequiredFields(
        sectionData as SOAPSectionData,
        specialty,
        section as TabId
      );
      
      return {
        section,
        valid: result.valid,
        errors: result.errors
      };
    });
    
    const allValid = validationResults.every(result => result.valid);
    
    if (onSaveComplete) {
      onSaveComplete(allValid);
    }
    
    return {
      valid: allValid,
      results: validationResults
    };
  }, [soapData, specialty, onSaveComplete]);

  // Función para enfocar un campo específico según la recomendación del asistente
  const handleFieldFocus = useCallback((section: string, field: string) => {
    const sectionIndex = TAB_IDS.indexOf(section as TabId);
    if (sectionIndex !== -1) {
      setActiveTab(sectionIndex);
      
      setTimeout(() => {
        const sectionRef = formRefs[section as keyof typeof formRefs];
        if (sectionRef.current) {
          sectionRef.current.scrollIntoView({ behavior: 'smooth' });
          
          const fieldElement = sectionRef.current.querySelector(`[name="${field}"]`) || 
                             sectionRef.current.querySelector(`[id="${field}"]`);
          
          if (fieldElement) {
            fieldElement.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
            setTimeout(() => {
              fieldElement.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2');
            }, 3000);
          }
        }
      }, 100);
    }
  }, [formRefs]);

  // Determinar la sección activa para el asistente
  const activeSoapSection = TAB_IDS[activeTab];

  const renderSection = (tabId: TabId): void => {
    const components = {
      subjective: SubjectiveComponent,
      objective: ObjectiveComponent,
      assessment: AssessmentComponent,
      plan: PlanComponent
    };

    const Component = components[tabId];
    if (!Component) return null;

    return (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <Component 
          patientId={patientId} 
          specialty={specialty} 
          visitId={visitId}
          readOnly={readOnly}
          onDataChange={(data: SOAPSectionData) => handleDataChange(tabId, data)}
        />
      </React.Suspense>
    );
  };

  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`${showAssistant ? 'lg:w-3/4' : 'w-full'} flex-grow`}>
          <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              {TAB_IDS.map((tabId) => (
                <Tab
                  key={tabId}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                    ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                    ${selected
                      ? 'bg-white shadow text-blue-700'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    }`
                  }
                >
                  {tabId.charAt(0).toUpperCase() + tabId.slice(1)}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              {TAB_IDS.map((tabId) => (
                <Tab.Panel
                  key={tabId}
                  className="rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                >
                  {renderSection(tabId)}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
          
          {!readOnly && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={validateAllSections}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Guardar SOAP Completo
              </button>
            </div>
          )}
        </div>
        
        {showAssistant && (
          <div className="lg:w-1/4 mt-4 lg:mt-0">
            <div className="sticky top-4">
              <ClinicalAssistant
                soapData={soapData}
                specialty={specialty}
                activeSection={activeSoapSection}
                onFieldFocus={handleFieldFocus}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 