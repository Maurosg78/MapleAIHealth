import { useState, useEffect, useCallback } from 'react';
import { SubjectiveData, SpecialtyType } from '../../../../types/clinical';
import { useForm, Controller } from 'react-hook-form';
import { PainScaleInput } from '../../common/PainScaleInput';
import { AnatomicalSelector } from '../../common/AnatomicalSelector';
import { ValidationContainer } from '../validation';
import { debounce } from '../../../../utils/debounce';

// Generador de IDs únicos para elementos de lista
const generateId = (): string => {
  return `id_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
};

interface SubjectiveContainerProps {
  readonly patientId: string;
  readonly specialty: SpecialtyType;
  readonly visitId?: string;
  readonly readOnly?: boolean;
  readonly onDataChange?: (data: SubjectiveData) => void;
}

/**
 * Componente Subjetivo para la estructura SOAP
 * Diseñado para ser adaptable a diferentes especialidades médicas
 */
export default function SubjectiveContainer({
  // patientId no se usa actualmente en este componente, pero se mantiene
  // para coherencia con la interfaz de otros componentes SOAP
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patientId,
  specialty,
  visitId,
  readOnly = false,
  onDataChange
}: SubjectiveContainerProps) {
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [formData, setFormData] = useState<SubjectiveData | null>(null);
  const [autoValidateAfterEdit, setAutoValidateAfterEdit] = useState(false);
  
  // Configuración dinámica según especialidad
  const getSpecialtyFields = () => {
    if (specialty === 'physiotherapy') {
      return {
        painQualityOptions: [
          { value: 'sharp', label: 'Agudo/Punzante' },
          { value: 'dull', label: 'Sordo' },
          { value: 'burning', label: 'Ardiente' },
          { value: 'throbbing', label: 'Pulsátil' },
          { value: 'shooting', label: 'Irradiado' },
          { value: 'stiffness', label: 'Rigidez' },
          { value: 'tingling', label: 'Hormigueo' },
          { value: 'numbness', label: 'Entumecimiento' },
        ],
        factorOptions: [
          { value: 'sitting', label: 'Sentado' },
          { value: 'standing', label: 'De pie' },
          { value: 'walking', label: 'Caminando' },
          { value: 'laying', label: 'Acostado' },
          { value: 'mornings', label: 'Mañanas' },
          { value: 'evenings', label: 'Tardes/Noches' },
          { value: 'activity', label: 'Actividad física' },
          { value: 'rest', label: 'Reposo' },
          { value: 'cold', label: 'Frío' },
          { value: 'heat', label: 'Calor' },
        ],
        treatmentOptions: [
          { value: 'physiotherapy', label: 'Fisioterapia previa' },
          { value: 'medication', label: 'Medicación' },
          { value: 'surgery', label: 'Cirugía' },
          { value: 'rest', label: 'Reposo' },
          { value: 'exercise', label: 'Ejercicio' },
          { value: 'massage', label: 'Masaje' },
          { value: 'heat', label: 'Aplicación de calor' },
          { value: 'cold', label: 'Aplicación de frío' },
        ]
      };
    }
    
    // Valor por defecto para otras especialidades
    return {
      painQualityOptions: [],
      factorOptions: [],
      treatmentOptions: []
    };
  };
  
  const specialtyConfig = getSpecialtyFields();
  
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<SubjectiveData>({
    defaultValues: {
      chiefComplaint: '',
      painDescription: '',
      painIntensity: 0,
      painQuality: [],
      aggravatingFactors: [],
      relievingFactors: [],
      previousTreatments: [],
      patientGoals: [],
      medicalHistory: ''
    }
  });
  
  // Función debounce para actualizar los datos después de que el usuario deje de escribir
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFormData = useCallback(
    debounce((data: SubjectiveData) => {
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
      updateFormData(data as SubjectiveData);
    });
    
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);
  
  // Cargar datos existentes si hay un visitId
  useEffect(() => {
    if (visitId) {
      setLoading(true);
      // Aquí iría la lógica para cargar datos existentes desde la API
      // Por ahora solo simulamos un delay
      setTimeout(() => {
        const mockData: SubjectiveData = {
          chiefComplaint: 'Dolor lumbar al inclinarse',
          painDescription: 'Dolor que aparece al flexionar el tronco',
          painIntensity: 6,
          painQuality: ['sharp', 'shooting'],
          aggravatingFactors: ['sitting', 'standing', 'activity'],
          relievingFactors: ['rest', 'heat'],
          previousTreatments: ['medication', 'rest'],
          patientGoals: ['Volver a jugar tenis', 'Trabajar sin dolor'],
          medicalHistory: 'Sin patologías previas de columna'
        };
        
        // Establecer los valores en el formulario
        Object.entries(mockData).forEach(([key, value]) => {
          setValue(key as keyof SubjectiveData, value);
        });
        
        setLoading(false);
      }, 500);
    }
  }, [visitId, setValue]);
  
  const onSubmit = (data: SubjectiveData) => {
    // Aquí iría la lógica para guardar los datos
    console.log('Formulario Subjetivo:', data);
    setFormData(data);
    setShowValidation(true);
    
    if (onDataChange) {
      onDataChange(data);
    }
  };
  
  // Función auxiliar para manejar checkboxes de manera simplificada
  const handleCheckboxChange = (
    field: { value: string[] | undefined; onChange: (value: string[]) => void },
    optionValue: string,
    checked: boolean
  ) => {
    const currentValues = field.value ?? [];
    
    if (checked) {
      field.onChange([...currentValues, optionValue]);
    } else {
      field.onChange(currentValues.filter(value => value !== optionValue));
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
          section="subjective"
          showValidation={showValidation}
        />
      )}
      
      <div className="bg-white shadow-sm rounded-lg divide-y">
        {/* Motivo de consulta */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Motivo de Consulta</h3>
          <div className="mt-2">
            <Controller
              name="chiefComplaint"
              control={control}
              rules={{ required: 'El motivo de consulta es obligatorio' }}
              render={({ field }) => (
                <div>
                  <label htmlFor="chiefComplaint" className="sr-only">Motivo de consulta</label>
                  <textarea
                    {...field}
                    id="chiefComplaint"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Describa el motivo principal de la consulta"
                    disabled={readOnly}
                  />
                  {errors.chiefComplaint && (
                    <p className="mt-1 text-sm text-red-600">{errors.chiefComplaint.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Características del dolor */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Características del Dolor</h3>
          
          {/* Descripción del dolor */}
          <div className="mt-2">
            <label htmlFor="painDescription" className="block text-sm font-medium text-gray-700">Descripción</label>
            <Controller
              name="painDescription"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="painDescription"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Describa el dolor en detalle"
                  disabled={readOnly}
                />
              )}
            />
          </div>
          
          {/* Localización del dolor */}
          <div className="mt-4">
            <label htmlFor="painLocation" className="block text-sm font-medium text-gray-700">Localización</label>
            <div className="mt-1">
              <AnatomicalSelector 
                id="painLocation"
                readOnly={readOnly}
                onChange={(locations) => setValue('painLocation', locations)}
                value={watch('painLocation') ?? []}
              />
            </div>
          </div>
          
          {/* Intensidad del dolor */}
          <div className="mt-4">
            <label htmlFor="painIntensity" className="block text-sm font-medium text-gray-700">Intensidad (0-10)</label>
            <div className="mt-1">
              <PainScaleInput 
                id="painIntensity"
                value={watch('painIntensity') ?? 0} 
                onChange={(value) => setValue('painIntensity', value)}
                readOnly={readOnly}
              />
            </div>
          </div>
          
          {/* Cualidad del dolor */}
          <div className="mt-4">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700">Cualidad del dolor</legend>
              <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Controller
                  name="painQuality"
                  control={control}
                  render={({ field }) => (
                    <>
                      {specialtyConfig.painQualityOptions.map((option) => {
                        const id = `painQuality-${option.value}`;
                        return (
                          <div key={option.value} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              id={id}
                              value={option.value}
                              checked={field.value?.includes(option.value)}
                              onChange={(e) => {
                                handleCheckboxChange(field, option.value, e.target.checked);
                              }}
                              disabled={readOnly}
                              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                            />
                            <label htmlFor={id} className="ml-2 text-sm text-gray-700">{option.label}</label>
                          </div>
                        );
                      })}
                    </>
                  )}
                />
              </div>
            </fieldset>
          </div>
        </div>
        
        {/* Factores */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Factores agravantes */}
          <div>
            <fieldset>
              <legend className="text-md font-medium text-gray-900">Factores Agravantes</legend>
              <div className="mt-1">
                <Controller
                  name="aggravatingFactors"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {specialtyConfig.factorOptions.map((option) => {
                        const id = `aggFactor-${option.value}`;
                        return (
                          <div key={option.value} className="inline-flex items-center mr-4">
                            <input
                              type="checkbox"
                              id={id}
                              value={option.value}
                              checked={field.value?.includes(option.value)}
                              onChange={(e) => {
                                handleCheckboxChange(field, option.value, e.target.checked);
                              }}
                              disabled={readOnly}
                              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                            />
                            <label htmlFor={id} className="ml-2 text-sm text-gray-700">{option.label}</label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </fieldset>
          </div>
          
          {/* Factores aliviantes */}
          <div>
            <fieldset>
              <legend className="text-md font-medium text-gray-900">Factores Aliviantes</legend>
              <div className="mt-1">
                <Controller
                  name="relievingFactors"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {specialtyConfig.factorOptions.map((option) => {
                        const id = `relieveFactor-${option.value}`;
                        return (
                          <div key={option.value} className="inline-flex items-center mr-4">
                            <input
                              type="checkbox"
                              id={id}
                              value={option.value}
                              checked={field.value?.includes(option.value)}
                              onChange={(e) => {
                                handleCheckboxChange(field, option.value, e.target.checked);
                              }}
                              disabled={readOnly}
                              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                            />
                            <label htmlFor={id} className="ml-2 text-sm text-gray-700">{option.label}</label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </fieldset>
          </div>
        </div>
        
        {/* Tratamientos previos */}
        <div className="p-4">
          <fieldset>
            <legend className="text-lg font-medium text-gray-900">Tratamientos Previos</legend>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Controller
                name="previousTreatments"
                control={control}
                render={({ field }) => (
                  <>
                    {specialtyConfig.treatmentOptions.map((option) => {
                      const id = `treatment-${option.value}`;
                      return (
                        <div key={option.value} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            id={id}
                            value={option.value}
                            checked={field.value?.includes(option.value)}
                            onChange={(e) => {
                              handleCheckboxChange(field, option.value, e.target.checked);
                            }}
                            disabled={readOnly}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          />
                          <label htmlFor={id} className="ml-2 text-sm text-gray-700">{option.label}</label>
                        </div>
                      );
                    })}
                  </>
                )}
              />
            </div>
          </fieldset>
        </div>
        
        {/* Objetivos del paciente */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Objetivos del Paciente</h3>
          <div className="mt-2">
            <Controller
              name="patientGoals"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {(field.value ?? []).map((goal, index) => {
                    const goalId = `goal-${index}-${generateId()}`;
                    return (
                      <div key={goalId} className="flex items-center">
                        <label htmlFor={goalId} className="sr-only">Objetivo {index + 1}</label>
                        <input
                          type="text"
                          id={goalId}
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...(field.value ?? [])];
                            newGoals[index] = e.target.value;
                            field.onChange(newGoals);
                          }}
                          disabled={readOnly}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Objetivo del paciente"
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => {
                              const newGoals = [...(field.value ?? [])];
                              newGoals.splice(index, 1);
                              field.onChange(newGoals);
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                            aria-label={`Eliminar objetivo ${index + 1}`}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange([...(field.value ?? []), '']);
                      }}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Añadir Objetivo
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Historia clínica relevante */}
        <div className="p-4">
          <label htmlFor="medicalHistory" className="text-lg font-medium text-gray-900">Historia Clínica Relevante</label>
          <div className="mt-2">
            <Controller
              name="medicalHistory"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="medicalHistory"
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Información relevante de la historia clínica"
                  disabled={readOnly}
                />
              )}
            />
          </div>
        </div>
      </div>
      
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