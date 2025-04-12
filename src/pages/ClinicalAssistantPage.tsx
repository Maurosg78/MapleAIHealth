import React, { useState, useEffect } from 'react';
import { MissingDataAlert } from '../components/MissingDataAlert';
import { DataRequestForm } from '../components/DataRequestForm';
import { LegalProtectionPanel } from '../components/LegalProtectionPanel';
import { ConversationalAssistant } from '../components/ConversationalAssistant';
import clinicalBlindSpotService, { VerificationRequest, VerificationResponse } from '../services/ClinicalBlindSpotService';
import patientStatusService from '../services/PatientStatusService';

/**
 * Página principal del Asistente Clínico AIDUX
 * 
 * ADVERTENCIA DE SEGURIDAD MÉDICA - PRIORIDAD ALTA
 * Este asistente ayuda a identificar información faltante y puntos ciegos
 * en la evaluación clínica pero NUNCA genera información médica no verificada.
 * El juicio clínico del profesional médico siempre tiene prioridad.
 */
const ClinicalAssistantPage: React.FC = () => {
  // Estado para el caso clínico actual
  const [clinicalCase, setClinicalCase] = useState<VerificationRequest>({
    patientInfo: {
      age: 42,
      gender: "Femenino",
      id: "P12345", // ID para simular un paciente existente
    },
    primaryComplaint: "Dolor lumbar",
    clinicalHistory: {
      currentIllness: "",  // Faltante intencionalmente
      medicalHistory: [],  // Faltante intencionalmente
      medicationHistory: [],
      allergies: [],
      functionalStatus: "", // Faltante intencionalmente
    },
    physicalExamination: {
      // Faltante intencionalmente
    },
    diagnosticStudies: {
      performed: [],
      pending: []
    },
    medicalPlan: {
      // Falta información del plan médico
      pendingDiagnosis: ["M54.5"] // Lumbalgia, para simular diagnóstico
    }
  });
  
  // Estados para la interfaz
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [showDataRequestForm, setShowDataRequestForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [isNewCondition, setIsNewCondition] = useState(false);
  const [interfaceMode, setInterfaceMode] = useState<'conversational' | 'form'>('conversational');
  const [patientName] = useState('María García');
  const [historySuggestions, setHistorySuggestions] = useState<string[]>([]);
  
  // Verificar si es un paciente nuevo o recurrente
  useEffect(() => {
    // Sólo verificar si hay un ID de paciente
    if (clinicalCase.patientInfo?.id) {
      const checkPatientStatus = async () => {
        try {
          // Obtener diagnósticos actuales (si existen)
          const currentDiagnoses = clinicalCase.medicalPlan?.pendingDiagnosis || [];
          
          // Verificar estado del paciente
          const statusResult = await patientStatusService.checkPatientStatus(
            clinicalCase.patientInfo!.id!,
            currentDiagnoses
          );
          
          // Actualizar estados
          setIsNewPatient(statusResult.isNew);
          setIsNewCondition(statusResult.isNewForCondition);
          
          // Si no es un paciente nuevo, obtener sugerencias del historial
          if (!statusResult.isNew) {
            const suggestions = await patientStatusService.getSuggestedHistoryItems(
              clinicalCase.patientInfo!.id!,
              currentDiagnoses
            );
            setHistorySuggestions(suggestions);
          }
        } catch (error) {
          console.error("Error al verificar el estado del paciente:", error);
          // Por defecto, asumir que es un paciente nuevo
          setIsNewPatient(true);
          setIsNewCondition(true);
        }
      };
      
      checkPatientStatus();
    }
  }, [clinicalCase.patientInfo?.id, clinicalCase.medicalPlan?.pendingDiagnosis]);
  
  // Ejecutar la verificación al cargar o cuando cambia el caso clínico
  useEffect(() => {
    const verifyCase = async () => {
      setIsVerifying(true);
      try {
        const result = await clinicalBlindSpotService.verifyCase(clinicalCase);
        setVerificationResult(result);
        setMissingFields([...result.requiredFields]);
      } catch (error) {
        console.error('Error al verificar el caso clínico:', error);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyCase();
  }, [clinicalCase]);
  
  // Manejadores de eventos
  const handleRequestData = () => {
    setShowDataRequestForm(true);
    setInterfaceMode('form');
  };
  
  const handleFormCancel = () => {
    setShowDataRequestForm(false);
    setInterfaceMode('conversational');
  };
  
  const handleUpdateCase = (field: string, value: string) => {
    // Actualizar el caso clínico cuando se recibe información del asistente conversacional
    const updatedCase = { ...clinicalCase };
    
    // Mapear el campo al caso clínico (similar a la lógica en handleFormSubmit)
    if (field === "ID del paciente") {
      if (!updatedCase.patientInfo) updatedCase.patientInfo = {};
      updatedCase.patientInfo.id = value;
    }
    else if (field === "edad del paciente") {
      if (!updatedCase.patientInfo) updatedCase.patientInfo = {};
      updatedCase.patientInfo.age = parseInt(value, 10) || undefined;
    }
    else if (field === "género del paciente") {
      if (!updatedCase.patientInfo) updatedCase.patientInfo = {};
      updatedCase.patientInfo.gender = value;
    }
    else if (field === "motivo de consulta") {
      updatedCase.primaryComplaint = value;
    }
    else if (field === "descripción de la enfermedad actual") {
      if (!updatedCase.clinicalHistory) updatedCase.clinicalHistory = {};
      updatedCase.clinicalHistory.currentIllness = value;
    }
    else if (field === "antecedentes médicos") {
      if (!updatedCase.clinicalHistory) updatedCase.clinicalHistory = {};
      updatedCase.clinicalHistory.medicalHistory = [value];
    }
    else if (field === "estado funcional del paciente") {
      if (!updatedCase.clinicalHistory) updatedCase.clinicalHistory = {};
      updatedCase.clinicalHistory.functionalStatus = value;
    }
    // Manejar campos de examen físico
    else if (field === "descripción de apariencia general") {
      if (!updatedCase.physicalExamination) updatedCase.physicalExamination = {};
      updatedCase.physicalExamination.generalAppearance = value;
    }
    else if (field === "presión arterial") {
      if (!updatedCase.physicalExamination) updatedCase.physicalExamination = {};
      if (!updatedCase.physicalExamination.vitalSigns) updatedCase.physicalExamination.vitalSigns = {};
      updatedCase.physicalExamination.vitalSigns.bloodPressure = value;
    }
    else if (field === "frecuencia cardíaca") {
      if (!updatedCase.physicalExamination) updatedCase.physicalExamination = {};
      if (!updatedCase.physicalExamination.vitalSigns) updatedCase.physicalExamination.vitalSigns = {};
      updatedCase.physicalExamination.vitalSigns.heartRate = value;
    }
    else if (field === "examen musculoesquelético") {
      if (!updatedCase.physicalExamination) updatedCase.physicalExamination = {};
      updatedCase.physicalExamination.musculoskeletal = { spine: value };
    }
    else if (field === "examen neurológico") {
      if (!updatedCase.physicalExamination) updatedCase.physicalExamination = {};
      updatedCase.physicalExamination.neurological = value;
    }
    // Manejar campos del plan médico
    else if (field === "diagnósticos diferenciales") {
      if (!updatedCase.medicalPlan) updatedCase.medicalPlan = {};
      // Procesar códigos de diagnóstico separados por comas
      const diagnoses = value.split(',').map(d => d.trim());
      updatedCase.medicalPlan.pendingDiagnosis = diagnoses;
    }
    else if (field === "plan de tratamiento") {
      if (!updatedCase.medicalPlan) updatedCase.medicalPlan = {};
      updatedCase.medicalPlan.requestedTreatment = value;
    }
    
    setClinicalCase(updatedCase);
  };
  
  const handleFormSubmit = (formData: Record<string, string>) => {
    // Actualizar el caso clínico con los datos proporcionados
    const updatedCase = { ...clinicalCase };
    
    // Mapear datos del formulario al caso clínico
    Object.entries(formData).forEach(([field, value]) => {
      handleUpdateCase(field, value);
    });
    
    setClinicalCase(updatedCase);
    setShowDataRequestForm(false);
    setInterfaceMode('conversational');
  };
  
  const handleAddRecommendedFields = (fields: string[]) => {
    setMissingFields(fields);
    setShowDataRequestForm(true);
    setInterfaceMode('form');
  };
  
  const handleGenerateDocumentation = async () => {
    if (!verificationResult) return;
    
    try {
      const documentId = await clinicalBlindSpotService.generateLegalDocumentation(
        clinicalCase,
        verificationResult
      );
      
      // Si es una consulta para una nueva condición, marcarla como nuevo episodio
      if (isNewCondition && clinicalCase.patientInfo?.id && clinicalCase.medicalPlan?.pendingDiagnosis) {
        await patientStatusService.markAsNewEpisode(
          clinicalCase.patientInfo.id,
          clinicalCase.medicalPlan.pendingDiagnosis
        );
      }
      
      alert(`Documentación legal generada con ID: ${documentId}`);
    } catch (error) {
      console.error('Error al generar documentación legal:', error);
      alert('Error al generar documentación legal. Por favor, intente nuevamente.');
    }
  };
  
  // Función para cambiar entre interfaces
  const toggleInterfaceMode = () => {
    if (interfaceMode === 'conversational') {
      setInterfaceMode('form');
      setShowDataRequestForm(true);
    } else {
      setInterfaceMode('conversational');
      setShowDataRequestForm(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNewPatient 
                ? `Nueva consulta - ${patientName}`
                : isNewCondition
                  ? `Nueva patología - ${patientName}`
                  : `Consulta de seguimiento - ${patientName}`}
            </h1>
            {!isNewPatient && !isNewCondition && (
              <p className="text-sm text-gray-600 mt-1">
                Continuando tratamiento para patología existente
              </p>
            )}
            {!isNewPatient && isNewCondition && (
              <p className="text-sm text-gray-600 mt-1">
                Paciente con historial pero nueva patología
              </p>
            )}
          </div>
          
          {/* Botón para cambiar entre modos de interfaz */}
          <button
            type="button"
            onClick={toggleInterfaceMode}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {interfaceMode === 'conversational' 
              ? 'Ver formulario completo' 
              : 'Volver al asistente'}
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
            <strong>ADVERTENCIA DE SEGURIDAD:</strong> El asistente AIDUX está diseñado para identificar posibles 
            puntos ciegos en la evaluación clínica. NUNCA genera información médica no verificada y 
            SIEMPRE prioriza el juicio del profesional médico.
          </p>
        </div>
        
        {/* Mostrar sugerencias del historial si es un paciente existente */}
        {!isNewPatient && historySuggestions.length > 0 && (
          <div className="mb-6 bg-blue-50 p-3 rounded border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Sugerencias basadas en el historial del paciente:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 ml-5 list-disc">
              {historySuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel principal - Asistente o Formulario */}
          <div className="md:col-span-2">
            {interfaceMode === 'conversational' ? (
              <ConversationalAssistant
                clinicalCase={clinicalCase}
                isNewPatient={isNewPatient}
                patientName={patientName}
                missingFields={missingFields}
                onUpdateCase={handleUpdateCase}
                onRequestFullForm={handleRequestData}
              />
            ) : (
              <>
                {/* Alerta para información faltante */}
                {missingFields.length > 0 && !showDataRequestForm && (
                  <div className="mb-6">
                    <MissingDataAlert 
                      missingFields={missingFields}
                      onRequestData={handleRequestData}
                    />
                  </div>
                )}
                
                {/* Formulario de solicitud de datos */}
                {showDataRequestForm && (
                  <div className="mb-6">
                    <DataRequestForm 
                      missingFields={missingFields}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Panel lateral - Protección Legal */}
          <div className="md:col-span-1">
            {verificationResult && (
              <LegalProtectionPanel 
                verificationResult={verificationResult}
                onAddRecommendedFields={handleAddRecommendedFields}
                onGenerateDocumentation={handleGenerateDocumentation}
              />
            )}
          </div>
        </div>
        
        {/* Indicador de carga */}
        {isVerifying && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalAssistantPage; 