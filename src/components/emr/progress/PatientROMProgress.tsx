import { useState, useMemo } from 'react';
import { RangeOfMotionData } from '../../../types/clinical';
import { ROMProgressChart } from './ROMProgressChart';

interface ProgressDataItem {
  date: string;
  rom: Record<string, RangeOfMotionData>;
}

interface PatientROMProgressProps {
  progressData: ProgressDataItem[];
  jointConfig: {
    id: string;
    label: string;
    normal?: number;
  }[];
  className?: string;
}

export const PatientROMProgress = ({
  progressData,
  jointConfig,
  className
}: PatientROMProgressProps) => {
  const [selectedJoints, setSelectedJoints] = useState<string[]>([]);
  const [showNormal, setShowNormal] = useState(true);

  // Obtener lista de articulaciones con datos disponibles
  const availableJoints = useMemo(() => {
    if (!progressData || progressData.length === 0 || !jointConfig) {
      return [];
    }

    // Filtrar por articulaciones que tengan al menos una medición
    return jointConfig.filter(joint => {
      return progressData.some(item => 
        joint.id in item.rom && 
        (item.rom[joint.id].active !== undefined || item.rom[joint.id].passive !== undefined)
      );
    });
  }, [progressData, jointConfig]);

  // Si no hay datos seleccionados, seleccionar automáticamente los primeros 4
  useMemo(() => {
    if (selectedJoints.length === 0 && availableJoints.length > 0) {
      setSelectedJoints(availableJoints.slice(0, 4).map(joint => joint.id));
    }
  }, [availableJoints, selectedJoints]);

  // Preparar los datos para cada articulación seleccionada
  const prepareJointData = (jointId: string) => {
    return progressData
      .filter(item => jointId in item.rom && (
        item.rom[jointId].active !== undefined || 
        item.rom[jointId].passive !== undefined
      ))
      .map(item => ({
        date: item.date,
        rom: item.rom[jointId]
      }));
  };

  // Manejar la selección/deselección de articulaciones
  const toggleJointSelection = (jointId: string) => {
    if (selectedJoints.includes(jointId)) {
      setSelectedJoints(selectedJoints.filter(id => id !== jointId));
    } else {
      setSelectedJoints([...selectedJoints, jointId]);
    }
  };

  if (!progressData || progressData.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">No hay datos de progreso disponibles para este paciente</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Progreso de Rango de Movimiento</h2>
          <div className="flex items-center">
            <label className="flex items-center text-sm text-gray-700 mr-4">
              <input 
                type="checkbox" 
                checked={showNormal} 
                onChange={() => setShowNormal(!showNormal)} 
                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Mostrar valor normal
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Seleccionar articulaciones:</h3>
          <div className="flex flex-wrap gap-2">
            {availableJoints.map(joint => (
              <button
                key={joint.id}
                onClick={() => toggleJointSelection(joint.id)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedJoints.includes(joint.id)
                    ? 'bg-primary-100 text-primary-800 border border-primary-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {joint.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedJoints.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Seleccione al menos una articulación para ver su progreso</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedJoints.map(jointId => {
            const jointData = prepareJointData(jointId);
            const jointInfo = jointConfig.find(j => j.id === jointId);

            if (jointData.length === 0 || !jointInfo) return null;

            return (
              <ROMProgressChart
                key={jointId}
                data={jointData}
                joint={jointInfo.label}
                showNormal={showNormal}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}; 