import * as React from 'react';
import { useState, useCallback, memo } from 'react';

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  mrn: string;
  lastVisit: string;
  conditions?: string[];
}

interface VirtualizedPatientListProps {
  patients: PatientInfo[];
  onPatientSelect: (patient: PatientInfo) => void;
  selectedPatientId?: string;
  className?: string;
}

/**
 * Componente que muestra una lista de pacientes con virtualización simple
 * para mejorar el rendimiento con grandes cantidades de pacientes
 */
const VirtualizedPatientList: React.FC<VirtualizedPatientListProps> = memo(({
  patients,
  onPatientSelect,
  selectedPatientId,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar pacientes basado en el término de búsqueda
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.conditions?.some(condition =>
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
    null
  );

  // Manejar cambios en la búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Obtener fecha formateada
  const getFormattedDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="flex-1 overflow-y-auto">
        {filteredPatients.length > 0 ? (
          <ul className="space-y-2">
            {filteredPatients.map(patient => (
              <li
                key={patient.id}
                className={`p-3 rounded-md cursor-pointer transition
                  ${selectedPatientId === patient.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-white border border-gray-100 hover:bg-gray-50'
                  }`}
                onClick={() => onPatientSelect(patient)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${selectedPatientId === patient.id ? 'text-blue-700' : 'text-gray-800'}`}>
                      {patient.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {patient.age} años • {patient.gender === 'M' ? 'M' : patient.gender === 'F' ? 'F' : 'O'} • MRN: {patient.mrn}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getFormattedDate(patient.lastVisit)}
                  </span>
                </div>

                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {patient.conditions.slice(0, 2).map((condition, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {condition}
                      </span>
                    ))}
                    {patient.conditions.length > 2 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                        +{patient.conditions.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No se encontraron pacientes</p>
            <button
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              onClick={() => setSearchTerm('')}
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
    null
  );
});

VirtualizedPatientList.displayName = 'VirtualizedPatientList';

export default VirtualizedPatientList;
