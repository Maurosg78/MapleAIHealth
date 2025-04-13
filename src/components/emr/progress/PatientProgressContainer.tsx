import { useState, useMemo } from 'react';
import { PatientROMProgress } from './PatientROMProgress';
import { StrengthProgressChart } from './StrengthProgressChart';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { RangeOfMotionData, StrengthMeasurementData } from '../../../types/clinical';

interface PatientProgressContainerProps {
  patientId: string;
  progressData: {
    date: string;
    rom: Record<string, {
      active?: number;
      passive?: number;
      normal?: number;
    }>;
    strength: Record<string, {
      value: number;
    }>;
  }[];
  jointConfig: {
    id: string;
    label: string;
    normal?: number;
  }[];
  muscleConfig: {
    id: string;
    label: string;
  }[];
  className?: string;
}

export const PatientProgressContainer = ({
  progressData,
  jointConfig,
  muscleConfig,
  className
}: PatientProgressContainerProps) => {
  const [activeTab, setActiveTab] = useState<'rom' | 'strength' | 'comparison'>('rom');

  // Preparar los datos específicos para el componente de fuerza muscular
  const strengthData = progressData.map(record => ({
    date: record.date,
    strength: record.strength
  }));

  // Preparar datos para la comparación antes/después
  const comparisonData = useMemo(() => {
    if (!progressData || progressData.length < 2) {
      return null;
    }

    // Ordenar los datos por fecha
    const sortedData = [...progressData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const initialRecord = sortedData[0];
    const currentRecord = sortedData[sortedData.length - 1];

    // Preparar datos de ROM
    const romData: Record<string, {
      initial: RangeOfMotionData;
      current: RangeOfMotionData;
      label: string;
    }> = {};

    // Encontrar articulaciones que tienen datos en ambos registros
    jointConfig.forEach(joint => {
      if (initialRecord.rom[joint.id] && currentRecord.rom[joint.id]) {
        romData[joint.id] = {
          initial: initialRecord.rom[joint.id],
          current: currentRecord.rom[joint.id],
          label: joint.label
        };
      }
    });

    // Preparar datos de fuerza
    const strengthData: Record<string, {
      initial: StrengthMeasurementData;
      current: StrengthMeasurementData;
      label: string;
    }> = {};

    // Encontrar grupos musculares que tienen datos en ambos registros
    muscleConfig.forEach(muscle => {
      if (initialRecord.strength[muscle.id] && currentRecord.strength[muscle.id]) {
        strengthData[muscle.id] = {
          initial: initialRecord.strength[muscle.id],
          current: currentRecord.strength[muscle.id],
          label: muscle.label
        };
      }
    });

    return {
      initialDate: initialRecord.date,
      currentDate: currentRecord.date,
      romData,
      strengthData
    };
  }, [progressData, jointConfig, muscleConfig]);

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
          <h2 className="text-lg font-medium text-gray-900">Seguimiento de Progreso</h2>
        </div>
        
        {/* Pestañas para cambiar entre visualizaciones */}
        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('rom')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rom'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rango de Movimiento
              </button>
              <button
                onClick={() => setActiveTab('strength')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'strength'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fuerza Muscular
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comparison'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={progressData.length < 2}
              >
                Comparativa
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'rom' && (
        <PatientROMProgress
          progressData={progressData}
          jointConfig={jointConfig}
        />
      )}
      
      {activeTab === 'strength' && (
        <div className="grid grid-cols-1 gap-6">
          <StrengthProgressChart
            data={strengthData}
            muscleGroups={muscleConfig}
          />
        </div>
      )}
      
      {activeTab === 'comparison' && comparisonData && (
        <BeforeAfterComparison
          initialDate={comparisonData.initialDate}
          currentDate={comparisonData.currentDate}
          romData={comparisonData.romData}
          strengthData={comparisonData.strengthData}
        />
      )}
    </div>
  );
}; 