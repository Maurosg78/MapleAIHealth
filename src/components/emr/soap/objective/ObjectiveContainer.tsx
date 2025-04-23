import { useState, useEffect, useCallback } from 'react';;;;;
import { ObjectiveData, SpecialtyType } from '../../../../types/clinical';;;;;
import { useForm, Controller } from 'react-hook-form';;;;;
import { ValidationContainer } from '../validation';;;;;
import { debounce } from '../../../../utils/debounce';;;;;

interface ObjectiveContainerProps {
  readonly patientId: string;
  readonly specialty: SpecialtyType;
  readonly visitId?: string;
  readonly readOnly?: boolean;
  onDataChange?: (data: ObjectiveData) => void;
}

/**
 * Componente Objetivo para la estructura SOAP
 * Diseñado para ser adaptable a diferentes especialidades médicas
 * Enfocado en mediciones físicas objetivas para Fisioterapia
 */
export default function ObjectiveContainer({
  specialty,
  visitId,
  readOnly = false,
  onDataChange
}: ObjectiveContainerProps) {
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'rom' | 'strength' | 'tests'>('general');
  const [showValidation, setShowValidation] = useState(false);
  const [formData, setFormData] = useState<ObjectiveData | null>(null);
  const [autoValidateAfterEdit, setAutoValidateAfterEdit] = useState(false);
  
  // Configuración dinámica según especialidad
  const getSpecialtyConfig = (): void => {
    switch(specialty) {
      case 'physiotherapy':
        return {
          // Articulaciones principales para rango de movimiento
          romJoints: [
            { id: 'cervical_flexion', label: 'Flexión Cervical', normal: 45 },
            { id: 'cervical_extension', label: 'Extensión Cervical', normal: 45 },
            { id: 'cervical_rotation_r', label: 'Rotación Cervical Derecha', normal: 60 },
            { id: 'cervical_rotation_l', label: 'Rotación Cervical Izquierda', normal: 60 },
            { id: 'shoulder_flexion_r', label: 'Flexión Hombro Derecho', normal: 180 },
            { id: 'shoulder_flexion_l', label: 'Flexión Hombro Izquierdo', normal: 180 },
            { id: 'shoulder_abduction_r', label: 'Abducción Hombro Derecho', normal: 180 },
            { id: 'shoulder_abduction_l', label: 'Abducción Hombro Izquierdo', normal: 180 },
            { id: 'elbow_flexion_r', label: 'Flexión Codo Derecho', normal: 145 },
            { id: 'elbow_flexion_l', label: 'Flexión Codo Izquierdo', normal: 145 },
            { id: 'wrist_flexion_r', label: 'Flexión Muñeca Derecha', normal: 80 },
            { id: 'wrist_flexion_l', label: 'Flexión Muñeca Izquierda', normal: 80 },
            { id: 'wrist_extension_r', label: 'Extensión Muñeca Derecha', normal: 70 },
            { id: 'wrist_extension_l', label: 'Extensión Muñeca Izquierda', normal: 70 },
            { id: 'hip_flexion_r', label: 'Flexión Cadera Derecha', normal: 120 },
            { id: 'hip_flexion_l', label: 'Flexión Cadera Izquierda', normal: 120 },
            { id: 'knee_flexion_r', label: 'Flexión Rodilla Derecha', normal: 135 },
            { id: 'knee_flexion_l', label: 'Flexión Rodilla Izquierda', normal: 135 },
            { id: 'ankle_dorsiflexion_r', label: 'Dorsiflexión Tobillo Derecho', normal: 20 },
            { id: 'ankle_dorsiflexion_l', label: 'Dorsiflexión Tobillo Izquierdo', normal: 20 },
            { id: 'ankle_plantarflexion_r', label: 'Flexión Plantar Tobillo Derecho', normal: 50 },
            { id: 'ankle_plantarflexion_l', label: 'Flexión Plantar Tobillo Izquierdo', normal: 50 },
            { id: 'lumbar_flexion', label: 'Flexión Lumbar', normal: 60 },
            { id: 'lumbar_extension', label: 'Extensión Lumbar', normal: 25 },
          ],
          // Grupos musculares principales para evaluación de fuerza
          muscleGroups: [
            { id: 'neck_flexors', label: 'Flexores del Cuello' },
            { id: 'neck_extensors', label: 'Extensores del Cuello' },
            { id: 'shoulder_flexors_r', label: 'Flexores del Hombro Derecho' },
            { id: 'shoulder_flexors_l', label: 'Flexores del Hombro Izquierdo' },
            { id: 'shoulder_abductors_r', label: 'Abductores del Hombro Derecho' },
            { id: 'shoulder_abductors_l', label: 'Abductores del Hombro Izquierdo' },
            { id: 'elbow_flexors_r', label: 'Flexores del Codo Derecho' },
            { id: 'elbow_flexors_l', label: 'Flexores del Codo Izquierdo' },
            { id: 'elbow_extensors_r', label: 'Extensores del Codo Derecho' },
            { id: 'elbow_extensors_l', label: 'Extensores del Codo Izquierdo' },
            { id: 'wrist_flexors_r', label: 'Flexores de la Muñeca Derecha' },
            { id: 'wrist_flexors_l', label: 'Flexores de la Muñeca Izquierda' },
            { id: 'wrist_extensors_r', label: 'Extensores de la Muñeca Derecha' },
            { id: 'wrist_extensors_l', label: 'Extensores de la Muñeca Izquierda' },
            { id: 'hip_flexors_r', label: 'Flexores de la Cadera Derecha' },
            { id: 'hip_flexors_l', label: 'Flexores de la Cadera Izquierda' },
            { id: 'hip_extensors_r', label: 'Extensores de la Cadera Derecha' },
            { id: 'hip_extensors_l', label: 'Extensores de la Cadera Izquierda' },
            { id: 'knee_flexors_r', label: 'Flexores de la Rodilla Derecha' },
            { id: 'knee_flexors_l', label: 'Flexores de la Rodilla Izquierda' },
            { id: 'knee_extensors_r', label: 'Extensores de la Rodilla Derecha' },
            { id: 'knee_extensors_l', label: 'Extensores de la Rodilla Izquierda' },
            { id: 'ankle_dorsiflexors_r', label: 'Dorsiflexores del Tobillo Derecho' },
            { id: 'ankle_dorsiflexors_l', label: 'Dorsiflexores del Tobillo Izquierdo' },
            { id: 'ankle_plantarflexors_r', label: 'Flexores Plantares del Tobillo Derecho' },
            { id: 'ankle_plantarflexors_l', label: 'Flexores Plantares del Tobillo Izquierdo' },
            { id: 'trunk_flexors', label: 'Flexores del Tronco' },
            { id: 'trunk_extensors', label: 'Extensores del Tronco' },
          ],
          // Tests especiales para fisioterapia
          specialTests: [
            { id: 'slr', label: 'Straight Leg Raise', description: 'Evalúa la tensión neural y ciática' },
            { id: 'thomas', label: 'Test de Thomas', description: 'Evalúa contractura de flexores de cadera' },
            { id: 'fabere', label: 'FABERE', description: 'Evalúa cadera y articulación sacroilíaca' },
            { id: 'ober', label: 'Test de Ober', description: 'Evalúa tensión de la banda iliotibial' },
            { id: 'empty_can', label: 'Empty Can', description: 'Evalúa el supraespinoso' },
            { id: 'hawkins_kennedy', label: 'Hawkins-Kennedy', description: 'Evalúa el síndrome de pinzamiento subacromial' },
            { id: 'apprehension', label: 'Test de Aprehensión', description: 'Evalúa inestabilidad anterior del hombro' },
            { id: 'mcmurray', label: 'Test de McMurray', description: 'Evalúa lesiones meniscales' },
            { id: 'lachman', label: 'Test de Lachman', description: 'Evalúa integridad del ligamento cruzado anterior' },
            { id: 'anterior_drawer', label: 'Cajón Anterior', description: 'Evalúa inestabilidad anterior de rodilla' },
            { id: 'valgus_stress', label: 'Estrés en Valgo', description: 'Evalúa ligamento colateral medial de rodilla' },
            { id: 'varus_stress', label: 'Estrés en Varo', description: 'Evalúa ligamento colateral lateral de rodilla' },
            { id: 'tinel', label: 'Signo de Tinel', description: 'Evalúa compresión del nervio mediano' },
            { id: 'phalen', label: 'Test de Phalen', description: 'Evalúa síndrome del túnel carpiano' },
            { id: 'finkelstein', label: 'Test de Finkelstein', description: 'Evalúa tenosinovitis de De Quervain' },
          ]
        };
      // Aquí se agregarían más casos para otras especialidades
      default:
        return {
          romJoints: [],
          muscleGroups: [],
          specialTests: []
        };
    }
  };
  
  const specialtyConfig = getSpecialtyConfig();
  
  // Valores iniciales del formulario
  const {
    control,
    handleSubmit,
    setValue,
    watch
  } = useForm<ObjectiveData>({
    defaultValues: {
      observation: '',
      palpation: '',
      rangeOfMotion: {},
      muscleStrength: {},
      specialTests: {}
    }
  });
  
  // Cargar datos existentes si hay un visitId
  useEffect(() => {
    if (visitId) {
      setLoading(true);
      // Aquí iría la lógica para cargar datos existentes desde la API
      // Por ahora solo simulamos un delay
      setTimeout(() => {
        const mockData: ObjectiveData = {
          observation: 'Paciente presenta marcha antiálgica.',
          palpation: 'Dolor a la palpación en zona lumbar derecha L4-L5.',
          rangeOfMotion: {
            lumbar_flexion: 30,
            lumbar_extension: 15,
            hip_flexion_r: 100,
            hip_flexion_l: 120,
          },
          muscleStrength: {
            trunk_flexors: { right: 4, left: 4 },
            trunk_extensors: { right: 3, left: 3 },
            hip_flexors_r: { right: 4, left: 5 },
            hip_flexors_l: { right: 5, left: 5 },
            knee_extensors_r: { right: 4, left: 5 },
            knee_extensors_l: { right: 5, left: 5 },
          },
          specialTests: {
            slr: 'Positivo a 45° en pierna derecha',
            fabere: 'Positivo derecho',
            thomas: 'Negativo bilateral',
          }
        };
        
        // Establecer los valores en el formulario
        Object.entries(mockData).forEach(([key, value]) => {
          setValue(key as keyof ObjectiveData, value);
        });
        
        setLoading(false);
      }, 500);
    }
  }, [visitId, setValue]);
  
  // Función debounce para actualizar los datos después de que el usuario deje de escribir
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFormData = useCallback(
    debounce((data: ObjectiveData) => {
      setFormData(data);
      
      if (onDataChange) {
        onDataChange(data);
      }
      
      // Si autoValidateAfterEdit está activado, mostrar validación
      if (autoValidateAfterEdit) {
        setShowValidation(true);
      }
    }, 500),
    [onDataChange, autoValidateAfterEdit]
  );
  
  // Observar los cambios en el formulario para validación en tiempo real
  useEffect(() => {
    const subscription = watch((data) => {
      updateFormData(data as ObjectiveData);
    });
    
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);
  
  const onSubmit = (data: ObjectiveData): void => {
    // Aquí iría la lógica para guardar los datos
    
    setFormData(data);
    setShowValidation(true);
    
    if (onDataChange) {
      onDataChange(data);
    }
  };
  
  if (loading) return <div className="flex justify-center p-4">Cargando datos del paciente...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Mostrar errores de validación */}
      {formData && (
        <ValidationContainer 
          data={formData}
          specialty={specialty}
          section="objective"
          showValidation={showValidation}
        />
      )}
      
      {/* Pestañas para organizar la información */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            className={`${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            type="button"
            className={`${
              activeTab === 'rom'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('rom')}
          >
            Rango de Movimiento
          </button>
          <button
            type="button"
            className={`${
              activeTab === 'strength'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('strength')}
          >
            Fuerza Muscular
          </button>
          <button
            type="button"
            className={`${
              activeTab === 'tests'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('tests')}
          >
            Tests Especiales
          </button>
        </nav>
      </div>
      
      {/* Sección general */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Observación */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900">Observación</h3>
            <div className="mt-2">
              <Controller
                name="observation"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Describa la observación general del paciente (postura, marcha, etc.)"
                    disabled={readOnly}
                  />
                )}
              />
            </div>
          </div>
          
          {/* Inspección */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900">Inspección</h3>
            <div className="mt-2">
              <Controller
                name="inspection" 
                control={control}
                render={({ field }) => (
                  <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Describa la inspección visual (asimetrías, coloración, inflamación, etc.)"
                    disabled={readOnly}
                    {...field}
                  />
                )}
              />
            </div>
          </div>
          
          {/* Palpación */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900">Palpación</h3>
            <div className="mt-2">
              <Controller
                name="palpation"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Describa los hallazgos a la palpación (dolor, temperatura, tensión muscular, etc.)"
                    disabled={readOnly}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Rango de Movimiento */}
      {activeTab === 'rom' && (
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rango de Movimiento (en grados)</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movimiento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pasivo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Normal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {specialtyConfig.romJoints.map((joint) => (
                  <tr key={joint.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {joint.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Controller
                        name={`rangeOfMotion.${joint.id}.active`}
                        control={control}
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === '' ? undefined : Number(val));
                            }}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            disabled={readOnly}
                            aria-label={`Valor activo para ${joint.label}`}
                          />
                        )}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Controller
                        name={`rangeOfMotion.${joint.id}.passive`}
                        control={control}
                        render={({ field }) => (
                          <input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === '' ? undefined : Number(val));
                            }}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            disabled={readOnly}
                            aria-label={`Valor pasivo para ${joint.label}`}
                          />
                        )}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {joint.normal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Fuerza Muscular */}
      {activeTab === 'strength' && (
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fuerza Muscular (Escala 0-5)</h3>
          
          <div className="space-y-4">
            {specialtyConfig.muscleGroups.map((muscle) => (
              <div key={muscle.id} className="flex flex-col space-y-2 mb-4">
                <div className="font-medium text-sm text-gray-700">{muscle.label}</div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor={`${muscle.id}_right`} className="block text-xs font-medium text-gray-500 mb-1">
                      Derecho:
                    </label>
                    <Controller
                      name={`muscleStrength.${muscle.id}.right`}
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${muscle.id}_right`}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? undefined : Number(val));
                          }}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          disabled={readOnly}
                          aria-label={`Fuerza muscular derecha para ${muscle.label}`}
                        >
                          <option value="">Seleccionar</option>
                          <option value="0">0 - Ausente</option>
                          <option value="1">1 - Vestigios</option>
                          <option value="2">2 - Pobre</option>
                          <option value="3">3 - Regular</option>
                          <option value="4">4 - Buena</option>
                          <option value="5">5 - Normal</option>
                        </select>
                      )}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${muscle.id}_left`} className="block text-xs font-medium text-gray-500 mb-1">
                      Izquierdo:
                    </label>
                    <Controller
                      name={`muscleStrength.${muscle.id}.left`}
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${muscle.id}_left`}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? undefined : Number(val));
                          }}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          disabled={readOnly}
                          aria-label={`Fuerza muscular izquierda para ${muscle.label}`}
                        >
                          <option value="">Seleccionar</option>
                          <option value="0">0 - Ausente</option>
                          <option value="1">1 - Vestigios</option>
                          <option value="2">2 - Pobre</option>
                          <option value="3">3 - Regular</option>
                          <option value="4">4 - Buena</option>
                          <option value="5">5 - Normal</option>
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tests Especiales */}
      {activeTab === 'tests' && (
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tests Especiales</h3>
          
          <div className="space-y-4">
            {specialtyConfig.specialTests.map((test) => (
              <div key={test.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{test.label}</h4>
                    <p className="text-xs text-gray-500">{test.description}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Controller
                      name={`specialTests.${test.id}`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Resultado (ej: Positivo, Negativo, etc.)"
                          disabled={readOnly}
                          aria-label={`Resultado del test ${test.label}`}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!readOnly && (
        <div className="flex justify-between mt-6">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => {
                setShowValidation(true);
                // Forzar validación con los datos actuales
                const currentData = watch();
                setFormData(currentData);
                if (onDataChange) {
                  onDataChange(currentData);
                }
              }}
            >
              Validar
            </button>
            
            <div className="flex items-center space-x-2 ml-4">
              <input
                type="checkbox"
                id="autoValidate"
                checked={autoValidateAfterEdit}
                onChange={(e) => setAutoValidateAfterEdit(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="autoValidate" className="text-sm text-gray-700">
                Validar automáticamente
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Guardar
          </button>
        </div>
      )}
    </form>
  );
} 