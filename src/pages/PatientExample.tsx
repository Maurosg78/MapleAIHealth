import React, { useState } from 'react';
import SoapContainer from '../components/emr/soap/SoapContainer';

/**
 * Página de ejemplo para mostrar la integración del SoapContainer
 * con el Asistente Clínico Inteligente
 */
export const PatientExample: React.FC = () => {
  // Estado para simular datos de paciente
  const [patientId] = useState('PAT-12345');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  // Función para manejar la finalización del guardado
  const handleSaveComplete = (valid: boolean): void => {
    setSaving(true);
    
    // Simulamos una operación de guardado
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(valid);
      
      // Resetear el mensaje después de unos segundos
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historia Clínica: Juan Pérez</h1>
        <div className="mt-2 flex items-center">
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
            ID: {patientId}
          </div>
          <div className="ml-4 text-sm text-gray-600">
            Edad: 68 años | Diagnóstico: Rehabilitación post PTR
          </div>
        </div>
      </div>
      
      {/* Mensajes de estado */}
      {saving && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
          Guardando información del paciente...
        </div>
      )}
      
      {saveSuccess === true && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
          ¡Datos guardados correctamente ?? undefined
        </div>
      )}
      
      {saveSuccess === false && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          No se pudieron guardar los datos. Por favor, verifique los campos requeridos.
        </div>
      )}
      
      {/* Contenedor SOAP con asistente clínico integrado */}
      <SoapContainer 
        patientId={patientId}
        specialty="physiotherapy"
        visitId="VISIT-56789"
        onSaveComplete={handleSaveComplete}
        showAssistant={true}
      />
    </div>
  );
}; 