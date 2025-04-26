import React, { useState } from 'react';
import { ClinicalWorkspace } from '../components/clinical/ClinicalWorkspace';
import { mockClinicalContext, mockSOAPData } from '../mocks/clinicalCase';
import { ClinicalAssistant } from '../services/ClinicalAssistant';
import { useAuth } from '../contexts/AuthContext';

const DemoPage: React.FC = () => {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(true);

  // Inicializar el asistente con datos de prueba
  const clinicalAssistant = ClinicalAssistant.getInstance();
  clinicalAssistant.setContext(mockClinicalContext);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Demostración MapleAI Health
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {showTutorial ? 'Ocultar Tutorial' : 'Mostrar Tutorial'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial */}
      {showTutorial && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-medium text-blue-800 mb-2">
              Instrucciones de Demostración
            </h2>
            <ul className="list-disc list-inside space-y-2 text-blue-700">
              <li>Este es un caso de prueba de un paciente con lumbalgia</li>
              <li>El asistente AI proporcionará sugerencias en tiempo real</li>
              <li>Puedes probar la grabación de audio y la transcripción</li>
              <li>Las sugerencias se pueden aceptar o rechazar</li>
              <li>El sistema aprende de tus interacciones</li>
            </ul>
          </div>
        </div>
      )}

      {/* Área de trabajo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ClinicalWorkspace
          patientId={mockClinicalContext.patientId}
          visitId={mockClinicalContext.visitId}
          specialty={mockClinicalContext.specialty}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            Esta es una demostración de MapleAI Health - Todos los datos son ficticios
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage; 