import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoiceSoapContainer from '../components/emr/soap/VoiceSoapContainer';
import { SpecialtyType } from '../types/clinical';

interface VoiceEnabledClinicalPageProps {
  defaultSpecialty?: SpecialtyType;
}

/**
 * Página clínica con asistente de voz integrado.
 * Permite documentación médica mediante dictado y comandos de voz.
 */
const VoiceEnabledClinicalPage: React.FC<VoiceEnabledClinicalPageProps> = ({ 
  defaultSpecialty = 'physiotherapy' 
}) => {
  const { patientId = '123456', visitId } = useParams<{ patientId: string, visitId?: string }>();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [patientData, setPatientData] = useState({
    name: 'Juan Pérez',
    age: 45,
    gender: 'masculino',
    recordNumber: patientId
  });
  
  // En una implementación real, aquí cargaríamos los datos del paciente
  useEffect(() => {
    // Simulación de carga de datos del paciente
    const loadPatientData = async () => {
      try {
        // Aquí se haría una llamada a la API para obtener datos del paciente
        // Por ahora solo usamos datos de ejemplo
        setPatientData({
          name: 'Juan Pérez',
          age: 45,
          gender: 'masculino',
          recordNumber: patientId
        });
      } catch (error) {
        console.error('Error al cargar datos del paciente:', error);
      }
    };
    
    loadPatientData();
  }, [patientId]);
  
  const handleSpecialtyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialty(event.target.value as SpecialtyType);
  };
  
  const handleSaveComplete = (valid: boolean) => {
    if (valid) {
      // Aquí se guardarían los datos y se navegaría a otra página
      alert('Datos guardados correctamente');
      // navigate(`/patients/${patientId}/dashboard`);
    } else {
      alert('Por favor complete todos los campos requeridos antes de guardar');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Consulta Clínica con Asistente de Voz
          </h1>
          <p className="text-sm text-gray-600">
            Complete el formulario SOAP utilizando asistente de voz o de forma tradicional
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Volver
          </button>
          
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
              Especialidad
            </label>
            <select
              id="specialty"
              name="specialty"
              value={specialty}
              onChange={handleSpecialtyChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="physiotherapy">Fisioterapia</option>
              <option value="general">Medicina General</option>
              <option value="pediatrics">Pediatría</option>
              <option value="nutrition">Nutrición</option>
              <option value="psychology">Psicología</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Información del paciente</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Datos personales y detalles del paciente</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
              <dd className="mt-1 text-sm text-gray-900">{patientData.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Edad</dt>
              <dd className="mt-1 text-sm text-gray-900">{patientData.age} años</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Género</dt>
              <dd className="mt-1 text-sm text-gray-900">{patientData.gender}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Número de registro</dt>
              <dd className="mt-1 text-sm text-gray-900">{patientData.recordNumber}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Fecha de consulta</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <VoiceSoapContainer
          patientId={patientId}
          specialty={specialty}
          visitId={visitId}
          specialistId="SPEC001" // En una implementación real, esto vendría del sistema de autenticación
          onSaveComplete={handleSaveComplete}
          showAssistant={true}
        />
      </div>
    </div>
  );
};

export default VoiceEnabledClinicalPage; 