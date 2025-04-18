import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { SubjectiveData, ObjectiveData, AssessmentData, PlanData, SOAPData, SpecialtyType } from '../../../types/clinical';
import { validateRequiredFields } from './validation';
import { ClinicalAssistant } from '../ai/ClinicalAssistant';
import { useVoiceCommands } from '../../../hooks/useVoiceCommands';
import { VoiceCommandsPanel } from '../../voice/VoiceCommandsPanel';
import { CommandType } from '../../../services/voice/VoiceCommandService';

// Componentes SOAP - Se cargarán dinámicamente según la especialidad y con memoización
const SubjectiveComponent = React.memo(React.lazy(() => import('./subjective/SubjectiveContainer')));
const ObjectiveComponent = React.memo(React.lazy(() => import('./objective/ObjectiveContainer')));
const AssessmentComponent = React.memo(React.lazy(() => import('./assessment/AssessmentContainer')));
const PlanComponent = React.memo(React.lazy(() => import('./plan/PlanContainer')));

type SOAPSectionData = SubjectiveData | ObjectiveData | AssessmentData | PlanData;

const TAB_IDS = ['subjective', 'objective', 'assessment', 'plan'] as const;
type TabId = typeof TAB_IDS[number];

interface VoiceSoapContainerProps {
  patientId: string;
  specialty: SpecialtyType;
  visitId?: string;
  specialistId: string;
  readOnly?: boolean;
  onSaveComplete?: (valid: boolean) => void;
  showAssistant?: boolean;
}

/**
 * Contenedor SOAP con integración de asistente de voz.
 * Permite documentación médica mediante dictado y comandos de voz.
 */
export default function VoiceSoapContainer({ 
  patientId, 
  specialty = 'physiotherapy',
  visitId,
  specialistId,
  readOnly = false,
  onSaveComplete,
  showAssistant = true
}: VoiceSoapContainerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [soapData, setSoapData] = useState<SOAPData>({
    patientId: patientId || '',
    subjective: null,
    objective: null,
    assessment: null,
    plan: null
  });
  const [currentField, setCurrentField] = useState<string | null>(null);

  // Referencias a los componentes del formulario
  const formRefs = {
    subjective: useRef<HTMLDivElement>(null),
    objective: useRef<HTMLDivElement>(null),
    assessment: useRef<HTMLDivElement>(null),
    plan: useRef<HTMLDivElement>(null)
  };

  // Usar el hook de comandos de voz
  const {
    isListening,
    toggleListening,
    registerCommands,
    availableCommands,
    lastTranscript,
    lastCommand,
    setContext
  } = useVoiceCommands({
    context: 'soap',
    specialistId,
    onCommandExecuted: (commandId) => {
      console.log(`Comando ejecutado: ${commandId}`);
    }
  });

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
      setCurrentField(field);
      
      // Actualizar el contexto de comandos de voz según la sección activa
      setContext(['soap', section]);
      
      setTimeout(() => {
        const sectionRef = formRefs[section as keyof typeof formRefs];
        if (sectionRef.current) {
          sectionRef.current.scrollIntoView({ behavior: 'smooth' });
          
          const fieldElement = sectionRef.current.querySelector(`[name="${field}"]`) || 
                             sectionRef.current.querySelector(`[id="${field}"]`);
          
          if (fieldElement) {
            // Destacar el campo
            fieldElement.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
            setTimeout(() => {
              fieldElement.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2');
            }, 3000);
            
            // Enfocar el campo
            if (isListening) {
              (fieldElement as HTMLElement).focus();
            }
          }
        }
      }, 100);
    }
  }, [formRefs, isListening, setContext]);

  // Registrar comandos de voz para el SOAP
  useEffect(() => {
    // Comandos de navegación entre pestañas
    const navigationCommands = TAB_IDS.map((tabId, index) => ({
      id: `goto_${tabId}`,
      type: 'navigation' as CommandType,
      phrases: [`ir a ${tabId}`, `mostrar ${tabId}`, `abrir ${tabId}`],
      action: () => setActiveTab(index),
      description: `Navegar a la sección ${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`,
      context: ['soap']
    }));

    // Comandos de guardar y validar
    const actionCommands = [
      {
        id: 'save_soap',
        type: 'action' as CommandType,
        phrases: ['guardar', 'guardar formulario', 'guardar soap', 'validar'],
        action: validateAllSections,
        description: 'Guardar y validar el formulario SOAP completo',
        context: ['soap']
      }
    ];

    // Comandos para enfocar campos específicos
    const fieldCommands = [
      {
        id: 'focus_chief_complaint',
        type: 'field' as CommandType,
        phrases: ['campo queja principal', 'ir a queja principal', 'mostrar queja principal'],
        action: () => handleFieldFocus('subjective', 'chiefComplaint'),
        description: 'Enfocar el campo de queja principal',
        context: ['soap', 'subjective']
      },
      {
        id: 'focus_medical_history',
        type: 'field' as CommandType,
        phrases: ['campo antecedentes', 'ir a antecedentes', 'mostrar antecedentes'],
        action: () => handleFieldFocus('subjective', 'medicalHistory'),
        description: 'Enfocar el campo de antecedentes médicos',
        context: ['soap', 'subjective']
      },
      {
        id: 'focus_observation',
        type: 'field' as CommandType,
        phrases: ['campo observación', 'ir a observación', 'mostrar observación'],
        action: () => handleFieldFocus('objective', 'observation'),
        description: 'Enfocar el campo de observación',
        context: ['soap', 'objective']
      },
      {
        id: 'focus_diagnosis',
        type: 'field' as CommandType,
        phrases: ['campo diagnóstico', 'ir a diagnóstico', 'mostrar diagnóstico'],
        action: () => handleFieldFocus('assessment', 'diagnosis'),
        description: 'Enfocar el campo de diagnóstico',
        context: ['soap', 'assessment']
      },
      {
        id: 'focus_goals',
        type: 'field' as CommandType,
        phrases: ['campo objetivos', 'ir a objetivos', 'mostrar objetivos'],
        action: () => handleFieldFocus('plan', 'goals'),
        description: 'Enfocar el campo de objetivos',
        context: ['soap', 'plan']
      }
    ];

    // Registrar todos los comandos
    registerCommands([...navigationCommands, ...actionCommands, ...fieldCommands]);

    // Establecer el contexto inicial basado en la pestaña activa
    setContext(['soap', TAB_IDS[activeTab]]);

  }, [activeTab, handleFieldFocus, registerCommands, setContext, validateAllSections]);

  // Actualizar el contexto cuando cambia la pestaña
  useEffect(() => {
    setContext(['soap', TAB_IDS[activeTab]]);
  }, [activeTab, setContext]);

  // Verificar si hay texto transcrito y procesarlo para inserción en campos
  useEffect(() => {
    // Solo procesar si hay una transcripción, estamos escuchando,
    // hay un campo seleccionado y el último comando no se ejecutó
    if (
      lastTranscript && 
      isListening && 
      currentField && 
      !lastCommand && 
      activeTab >= 0
    ) {
      const text = lastTranscript.text.trim();
      if (!text) return;

      const sectionId = TAB_IDS[activeTab];
      const sectionRef = formRefs[sectionId];
      
      if (sectionRef.current) {
        const fieldElement = sectionRef.current.querySelector(`[name="${currentField}"]`) || 
                            sectionRef.current.querySelector(`[id="${currentField}"]`);
        
        if (fieldElement && (fieldElement instanceof HTMLInputElement || fieldElement instanceof HTMLTextAreaElement)) {
          fieldElement.value = fieldElement.value + ' ' + text;
          
          // Disparar evento de cambio para actualizar el estado
          const event = new Event('input', { bubbles: true });
          fieldElement.dispatchEvent(event);
        }
      }
    }
  }, [lastTranscript, isListening, currentField, lastCommand, activeTab, formRefs]);

  // Determinar la sección activa para el asistente
  const activeSoapSection = TAB_IDS[activeTab];

  const renderSection = (tabId: TabId) => {
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
        <div ref={formRefs[tabId]}>
          <Component 
            patientId={patientId} 
            specialty={specialty} 
            visitId={visitId}
            readOnly={readOnly}
            onDataChange={(data: SOAPSectionData) => handleDataChange(tabId, data)}
          />
        </div>
      </React.Suspense>
    );
  };

  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`${showAssistant ? 'lg:w-3/5' : 'lg:w-3/4'} flex-grow`}>
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
        
        <div className={`${showAssistant ? 'lg:w-1/5' : 'lg:w-1/4'} mt-4 lg:mt-0`}>
          <div className="sticky top-4">
            <ClinicalAssistant
              soapData={soapData}
              specialty={specialty}
              activeSection={activeSoapSection}
              onFieldFocus={handleFieldFocus}
              className="w-full mb-4"
            />
          </div>
        </div>
        
        <div className="lg:w-1/5 mt-4 lg:mt-0">
          <div className="sticky top-4">
            <VoiceCommandsPanel
              commands={availableCommands}
              isListening={isListening}
              onToggleListening={toggleListening}
              lastTranscript={lastTranscript}
              lastCommand={lastCommand}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 