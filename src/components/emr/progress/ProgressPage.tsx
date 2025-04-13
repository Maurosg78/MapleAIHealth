import { useState, useEffect } from 'react';
import { PatientProgressContainer } from './PatientProgressContainer';
import { RangeOfMotionData } from '../../../types/clinical';

// Definir la interfaz para los datos de progreso
interface ProgressDataItem {
  date: string;
  rom: Record<string, RangeOfMotionData>;
  strength: Record<string, { value: number }>;
}

// Datos de muestra para la demostración
const SAMPLE_JOINT_CONFIG = [
  { id: 'shoulder_flexion_r', label: 'Flexión Hombro Derecho', normal: 180 },
  { id: 'shoulder_flexion_l', label: 'Flexión Hombro Izquierdo', normal: 180 },
  { id: 'shoulder_abduction_r', label: 'Abducción Hombro Derecho', normal: 180 },
  { id: 'shoulder_abduction_l', label: 'Abducción Hombro Izquierdo', normal: 180 },
  { id: 'elbow_flexion_r', label: 'Flexión Codo Derecho', normal: 145 },
  { id: 'elbow_flexion_l', label: 'Flexión Codo Izquierdo', normal: 145 },
  { id: 'knee_flexion_r', label: 'Flexión Rodilla Derecha', normal: 135 },
  { id: 'knee_flexion_l', label: 'Flexión Rodilla Izquierda', normal: 135 },
  { id: 'ankle_dorsiflexion_r', label: 'Dorsiflexión Tobillo Derecho', normal: 20 },
  { id: 'ankle_dorsiflexion_l', label: 'Dorsiflexión Tobillo Izquierdo', normal: 20 },
];

// Configuración de muestra para grupos musculares
const SAMPLE_MUSCLE_CONFIG = [
  { id: 'shoulder_flexors_r', label: 'Flexores Hombro D' },
  { id: 'shoulder_flexors_l', label: 'Flexores Hombro I' },
  { id: 'shoulder_abductors_r', label: 'Abductores Hombro D' },
  { id: 'shoulder_abductors_l', label: 'Abductores Hombro I' },
  { id: 'elbow_flexors_r', label: 'Flexores Codo D' },
  { id: 'elbow_flexors_l', label: 'Flexores Codo I' },
  { id: 'knee_extensors_r', label: 'Extensores Rodilla D' },
  { id: 'knee_extensors_l', label: 'Extensores Rodilla I' },
  { id: 'trunk_flexors', label: 'Flexores Tronco' },
  { id: 'trunk_extensors', label: 'Extensores Tronco' },
];

// Función para generar datos de progreso de ejemplo
const generateSampleProgressData = (): ProgressDataItem[] => {
  const dates = [
    '2023-10-15',
    '2023-10-29',
    '2023-11-12',
    '2023-11-26',
    '2023-12-10'
  ];

  // Función para generar valor de progreso simulando una mejora gradual
  const generateProgressiveValue = (initialValue: number, maxValue: number, index: number) => {
    // Calculamos un incremento que tienda a acercarse al valor normal
    const maxIncrement = (maxValue - initialValue) / (dates.length - 1);
    // Añadimos algo de aleatoriedad al incremento
    const increment = maxIncrement * (0.7 + Math.random() * 0.6);
    return Math.min(initialValue + (increment * index), maxValue);
  };

  // Función para generar datos de fuerza muscular (valores 0-5)
  const generateStrengthValue = (initialValue: number, maxValue: number, index: number) => {
    // Similar a la función anterior pero adaptada para escala 0-5
    const maxIncrement = (maxValue - initialValue) / (dates.length - 1);
    const increment = maxIncrement * (0.7 + Math.random() * 0.6);
    return Math.min(Math.round(initialValue + (increment * index)), maxValue);
  };

  return dates.map((date, index) => {
    // Crear un objeto con los datos de ROM para cada articulación
    const romData: Record<string, RangeOfMotionData> = {};
    
    // Datos para hombro derecho (caso de mejora gradual)
    romData.shoulder_flexion_r = {
      active: Math.round(generateProgressiveValue(80, 170, index)),
      passive: Math.round(generateProgressiveValue(95, 175, index)),
      normal: 180
    };
    
    // Datos para hombro izquierdo (caso de mejora leve)
    romData.shoulder_flexion_l = {
      active: Math.round(generateProgressiveValue(165, 175, index)),
      passive: Math.round(generateProgressiveValue(170, 178, index)),
      normal: 180
    };
    
    // Datos para codo derecho (caso de mejora gradual con diferencia notable activo/pasivo)
    romData.elbow_flexion_r = {
      active: Math.round(generateProgressiveValue(95, 135, index)),
      passive: Math.round(generateProgressiveValue(110, 140, index)),
      normal: 145
    };
    
    // Datos para rodilla derecha (caso de mejora significativa)
    romData.knee_flexion_r = {
      active: Math.round(generateProgressiveValue(60, 125, index)),
      passive: Math.round(generateProgressiveValue(80, 130, index)),
      normal: 135
    };
    
    // Datos para tobillo derecho (caso de poca mejora)
    romData.ankle_dorsiflexion_r = {
      active: Math.round(generateProgressiveValue(5, 10, index)),
      passive: Math.round(generateProgressiveValue(8, 15, index)),
      normal: 20
    };
    
    // Crear datos de fuerza muscular
    const strengthData: Record<string, { value: number }> = {};
    
    // Fuerza para hombros
    strengthData.shoulder_flexors_r = { value: generateStrengthValue(2, 5, index) };
    strengthData.shoulder_flexors_l = { value: generateStrengthValue(3, 5, index) };
    strengthData.shoulder_abductors_r = { value: generateStrengthValue(2, 4, index) };
    strengthData.shoulder_abductors_l = { value: generateStrengthValue(3, 5, index) };
    
    // Fuerza para codos
    strengthData.elbow_flexors_r = { value: generateStrengthValue(3, 5, index) };
    strengthData.elbow_flexors_l = { value: generateStrengthValue(3, 5, index) };
    
    // Fuerza para rodillas
    strengthData.knee_extensors_r = { value: generateStrengthValue(2, 5, index) };
    strengthData.knee_extensors_l = { value: generateStrengthValue(3, 5, index) };
    
    // Fuerza para tronco
    strengthData.trunk_flexors = { value: generateStrengthValue(2, 4, index) };
    strengthData.trunk_extensors = { value: generateStrengthValue(2, 4, index) };
    
    return {
      date,
      rom: romData,
      strength: strengthData
    };
  });
};

export const ProgressPage = () => {
  const [progressData, setProgressData] = useState<ProgressDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos una llamada a API con un delay
    setLoading(true);
    setTimeout(() => {
      setProgressData(generateSampleProgressData());
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center">
          <div className="animate-pulse text-gray-500">Cargando datos de progreso...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Seguimiento de Progreso: Juan Pérez</h1>
      
      <PatientProgressContainer 
        patientId="123"
        progressData={progressData}
        jointConfig={SAMPLE_JOINT_CONFIG}
        muscleConfig={SAMPLE_MUSCLE_CONFIG}
      />

      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="mb-2"><strong>Nota:</strong> Estos son datos de muestra para demostración.</p>
        <p>En un entorno real, estos datos se cargarían desde el historial de evaluaciones del paciente.</p>
      </div>
    </div>
  );
}; 