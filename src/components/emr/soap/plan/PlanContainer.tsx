import React, { useState, useEffect, useCallback } from 'react';
import { PlanData, SpecialtyType } from '../../../../types/clinical';
import { useForm, Controller } from 'react-hook-form';

// Generador de IDs únicos para elementos de lista
const generateId = (): string => {
  return `id_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
};

// Interfaz para elementos con ID
interface ItemWithId {
  id: string;
  value: string;
}

// Función para asegurar que los elementos de la lista tengan IDs
const ensureItemsHaveIds = (items: string[] = []): ItemWithId[] => {
  return items.map(value => {
    if (typeof value === 'string') {
      return { id: generateId(), value };
    }
    return value as ItemWithId;
  });
};

interface PlanContainerProps {
  patientId: string; // Ahora es obligatorio para ser coherente con los otros componentes
  specialty: SpecialtyType;
  visitId?: string;
  onDataChange?: (data: PlanData) => void;
  initialData?: PlanData;
  readOnly?: boolean;
}

/**
 * Componente de Plan para la estructura SOAP
 * Diseñado para ser adaptable a diferentes especialidades médicas
 */
export default function PlanContainer({
  patientId, // Ahora ya no es opcional y se elimina el comentario de no uso
  visitId,
  specialty,
  onDataChange,
  initialData,
  readOnly = false,
}: PlanContainerProps) { // Se elimina el Readonly para ser coherente con otros componentes
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  
  // Configuración dinámica según especialidad
  const getSpecialtyConfig = () => {
    if (specialty === 'physiotherapy') {
      return {
        interventionOptions: {
          manual: [
            { value: 'movilizacion', label: 'Movilización articular' },
            { value: 'manipulacion', label: 'Manipulación' },
            { value: 'masaje', label: 'Masaje terapéutico' },
            { value: 'tejido_blando', label: 'Terapia de tejido blando' },
            { value: 'miofascial', label: 'Liberación miofascial' },
            { value: 'puncion_seca', label: 'Punción seca' },
          ],
          exercises: [
            { value: 'estiramiento', label: 'Estiramientos' },
            { value: 'fortalecimiento', label: 'Fortalecimiento' },
            { value: 'estabilizacion', label: 'Estabilización' },
            { value: 'propiocepcion', label: 'Propiocepción' },
            { value: 'funcional', label: 'Ejercicio funcional' },
            { value: 'aerobico', label: 'Ejercicio aeróbico' },
          ],
          modalities: [
            { value: 'tens', label: 'TENS' },
            { value: 'us', label: 'Ultrasonido' },
            { value: 'laser', label: 'Láser' },
            { value: 'calor', label: 'Termoterapia' },
            { value: 'frio', label: 'Crioterapia' },
            { value: 'ondas_choque', label: 'Ondas de choque' },
          ],
          education: [
            { value: 'ergonomia', label: 'Ergonomía' },
            { value: 'postura', label: 'Corrección postural' },
            { value: 'mecanica_corporal', label: 'Mecánica corporal' },
            { value: 'pacing', label: 'Pacing de actividades' },
            { value: 'automasaje', label: 'Auto-masaje' },
            { value: 'higiene_postural', label: 'Higiene postural' },
          ],
        },
        precautionOptions: [
          { value: 'sintomas_neurologicos', label: 'Vigilar síntomas neurológicos' },
          { value: 'dolor_severo', label: 'Suspender si dolor severo' },
          { value: 'mareo', label: 'Vigilar mareos o náuseas' },
          { value: 'inestabilidad', label: 'Precaución por inestabilidad' },
          { value: 'proceso_inflamatorio', label: 'Proceso inflamatorio agudo' },
        ],
        frequencyOptions: [
          { value: '1_semana', label: '1 vez por semana' },
          { value: '2_semana', label: '2 veces por semana' },
          { value: '3_semana', label: '3 veces por semana' },
          { value: 'diaria', label: 'Diaria' },
          { value: 'quincenal', label: 'Quincenal' },
        ]
      };
    }
      
    // Valor por defecto para otras especialidades
    return {
      interventionOptions: {
        manual: [],
        exercises: [],
        modalities: [],
        education: [],
      },
      precautionOptions: [],
      frequencyOptions: []
    };
  };
  
  const specialtyConfig = getSpecialtyConfig();
  
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<PlanData>({
    defaultValues: initialData || {
      goals: [],
      shortTermGoals: [],
      longTermGoals: [],
      treatment: '',
      recommendations: '',
      homeExerciseProgram: '',
      followUpPlan: '',
      expectedOutcomes: '',
      referrals: '',
      treatmentFrequency: '',
      treatmentDuration: '',
      interventions: {
        manual: [],
        exercises: [],
        modalities: [],
        education: [],
      },
      reevaluationPlan: '',
      precautions: [],
      contraindications: []
    }
  });
  
  // Generadores de estado para listas con ID
  const [goalItems, setGoalItems] = useState<ItemWithId[]>([]);
  const [shortTermGoalItems, setShortTermGoalItems] = useState<ItemWithId[]>([]);
  const [longTermGoalItems, setLongTermGoalItems] = useState<ItemWithId[]>([]);
  const [contraindicationItems, setContraindicationItems] = useState<ItemWithId[]>([]);
  
  // Simplificado: inicializar las listas con ID desde los datos iniciales
  useEffect(() => {
    if (initialData) {
      setGoalItems(ensureItemsHaveIds(initialData.goals || []));
      setShortTermGoalItems(ensureItemsHaveIds(initialData.shortTermGoals || []));
      setLongTermGoalItems(ensureItemsHaveIds(initialData.longTermGoals || []));
      setContraindicationItems(ensureItemsHaveIds(initialData.contraindications || []));
    }
  }, [initialData]);
  
  // Efecto para sincronizar las listas cuando cambian los valores del formulario
  useEffect(() => {
    const goals = watch('goals');
    const shortTermGoals = watch('shortTermGoals');
    const longTermGoals = watch('longTermGoals');
    const contraindications = watch('contraindications');
    
    if (goals?.length) {
      setGoalItems(ensureItemsHaveIds(goals));
    }
    if (shortTermGoals?.length) {
      setShortTermGoalItems(ensureItemsHaveIds(shortTermGoals));
    }
    if (longTermGoals?.length) {
      setLongTermGoalItems(ensureItemsHaveIds(longTermGoals));
    }
    if (contraindications?.length) {
      setContraindicationItems(ensureItemsHaveIds(contraindications));
    }
  }, [watch]);
  
  // Cargar datos existentes si hay un visitId (coherente con otros componentes)
  useEffect(() => {
    if (visitId && !initialData) {
      setLoading(true);
      // Aquí iría la lógica para cargar datos existentes desde la API
      // Por ahora solo simulamos un delay
      setTimeout(() => {
        const mockData: PlanData = {
          goals: ['Reducir dolor lumbar', 'Mejorar movilidad'],
          shortTermGoals: ['Aumentar ROM lumbar 10°', 'Disminuir dolor 2/10'],
          longTermGoals: ['Retornar a actividades deportivas', 'Trabajar sin dolor'],
          treatment: 'Terapia manual combinada con ejercicios propioceptivos',
          recommendations: 'Evitar sedestación prolongada',
          homeExerciseProgram: 'Programa de 3 ejercicios diarios de estabilización',
          followUpPlan: 'Reevaluación en 2 semanas',
          expectedOutcomes: 'Reducción del dolor y mejora de la función en 4-6 semanas',
          referrals: '',
          treatmentFrequency: '2_semana',
          treatmentDuration: '6 semanas',
          interventions: {
            manual: ['movilizacion', 'tejido_blando'],
            exercises: ['estabilizacion', 'fortalecimiento'],
            modalities: ['calor'],
            education: ['postura', 'ergonomia'],
          },
          reevaluationPlan: 'Reevaluar cada 6 sesiones',
          precautions: ['sintomas_neurologicos'],
          contraindications: ['Ejercicios de flexión intensa']
        };
        
        // Establecer los valores en el formulario
        Object.entries(mockData).forEach(([key, value]) => {
          setValue(key as keyof PlanData, value);
        });
        
        // Actualizar las listas de elementos con ID
        setGoalItems(ensureItemsHaveIds(mockData.goals));
        setShortTermGoalItems(ensureItemsHaveIds(mockData.shortTermGoals));
        setLongTermGoalItems(ensureItemsHaveIds(mockData.longTermGoals));
        setContraindicationItems(ensureItemsHaveIds(mockData.contraindications || []));
        
        setLoading(false);
      }, 500);
    }
  }, [visitId, initialData, setValue]);
  
  // Efecto simplificado para notificar cambios
  useEffect(() => {
    if (onDataChange) {
      const currentValues = watch();
      onDataChange(currentValues);
    }
  }, [watch, onDataChange]);
  
  const onSubmit = (data: PlanData) => {
    // Aquí iría la lógica para guardar los datos
    console.log('Formulario Plan:', data);
    if (onDataChange) {
      onDataChange(data);
    }
  };
  
  const handleCheckboxChange = (
    field: { value: string[] | undefined; onChange: (value: string[]) => void },
    value: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    const currentValues = field.value || [];
    
    if (checked) {
      field.onChange([...currentValues, value]);
    } else {
      field.onChange(currentValues.filter(v => v !== value));
    }
  };
  
  // Manejador para añadir un nuevo elemento con ID
  const handleAddItemWithId = useCallback((
    field: { value: string[] | undefined; onChange: (value: string[]) => void },
    items: ItemWithId[],
    setItems: React.Dispatch<React.SetStateAction<ItemWithId[]>>
  ) => {
    const newItem = { id: generateId(), value: '' };
    const newItems = [...items, newItem];
    setItems(newItems);
    field.onChange(newItems.map(item => item.value));
  }, []);
  
  // Manejador para actualizar un elemento con ID
  const handleUpdateItemWithId = useCallback((
    field: { value: string[] | undefined; onChange: (value: string[]) => void },
    items: ItemWithId[],
    setItems: React.Dispatch<React.SetStateAction<ItemWithId[]>>,
    id: string,
    newValue: string
  ) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, value: newValue } : item
    );
    setItems(newItems);
    field.onChange(newItems.map(item => item.value));
  }, []);
  
  // Manejador para eliminar un elemento con ID
  const handleRemoveItemWithId = useCallback((
    field: { value: string[] | undefined; onChange: (value: string[]) => void },
    items: ItemWithId[],
    setItems: React.Dispatch<React.SetStateAction<ItemWithId[]>>,
    id: string
  ) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    field.onChange(newItems.map(item => item.value));
  }, []);
  
  if (loading) return <div className="flex justify-center p-4">Cargando datos del paciente...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg divide-y">
        {/* Objetivos */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Objetivos</h3>
          
          {/* Objetivos generales */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Objetivos generales</h4>
            <div className="mt-1">
              <Controller
                name="goals"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {goalItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleUpdateItemWithId(field, goalItems, setGoalItems, item.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Objetivo"
                          disabled={readOnly}
                          aria-labelledby={`objective-label-${item.id}`}
                          id={`objective-${item.id}`}
                        />
                        <span id={`objective-label-${item.id}`} className="sr-only">Objetivo general</span>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemWithId(field, goalItems, setGoalItems, item.id)}
                            className="ml-2 text-red-500"
                            aria-label="Eliminar objetivo"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleAddItemWithId(field, goalItems, setGoalItems)}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Añadir objetivo
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Objetivos a corto plazo */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Objetivos a corto plazo</h4>
            <div className="mt-1">
              <Controller
                name="shortTermGoals"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {shortTermGoalItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleUpdateItemWithId(field, shortTermGoalItems, setShortTermGoalItems, item.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Objetivo a corto plazo"
                          disabled={readOnly}
                          aria-labelledby={`short-term-objective-label-${item.id}`}
                          id={`short-term-objective-${item.id}`}
                        />
                        <span id={`short-term-objective-label-${item.id}`} className="sr-only">Objetivo a corto plazo</span>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemWithId(field, shortTermGoalItems, setShortTermGoalItems, item.id)}
                            className="ml-2 text-red-500"
                            aria-label="Eliminar objetivo a corto plazo"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleAddItemWithId(field, shortTermGoalItems, setShortTermGoalItems)}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Añadir objetivo a corto plazo
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Objetivos a largo plazo */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Objetivos a largo plazo</h4>
            <div className="mt-1">
              <Controller
                name="longTermGoals"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {longTermGoalItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleUpdateItemWithId(field, longTermGoalItems, setLongTermGoalItems, item.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Objetivo a largo plazo"
                          disabled={readOnly}
                          aria-labelledby={`long-term-objective-label-${item.id}`}
                          id={`long-term-objective-${item.id}`}
                        />
                        <span id={`long-term-objective-label-${item.id}`} className="sr-only">Objetivo a largo plazo</span>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemWithId(field, longTermGoalItems, setLongTermGoalItems, item.id)}
                            className="ml-2 text-red-500"
                            aria-label="Eliminar objetivo a largo plazo"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleAddItemWithId(field, longTermGoalItems, setLongTermGoalItems)}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Añadir objetivo a largo plazo
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Plan de tratamiento */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Plan de Tratamiento</h3>
          <div className="mt-2">
            <Controller
              name="treatment"
              control={control}
              rules={{ required: 'El plan de tratamiento es obligatorio' }}
              render={({ field }) => (
                <div>
                  <textarea
                    {...field}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Describa el plan de tratamiento"
                    disabled={readOnly}
                    aria-label="Descripción del plan de tratamiento"
                  />
                  {errors.treatment && (
                    <p className="mt-1 text-sm text-red-600">{errors.treatment.message}</p>
                  )}
                </div>
              )}
            />
          </div>
          
          {/* Frecuencia y duración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Frecuencia de tratamiento</label>
              <Controller
                name="treatmentFrequency"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={readOnly}
                    aria-label="Frecuencia de tratamiento"
                  >
                    <option value="">Seleccionar frecuencia</option>
                    {specialtyConfig.frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duración estimada</label>
              <Controller
                name="treatmentDuration"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ej: 4-6 semanas"
                    disabled={readOnly}
                    aria-label="Duración estimada del tratamiento"
                  />
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Recomendaciones */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Recomendaciones</h3>
          <div className="mt-2">
            <Controller
              name="recommendations"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Recomendaciones generales para el paciente"
                  disabled={readOnly}
                  aria-label="Recomendaciones generales para el paciente"
                />
              )}
            />
          </div>
        </div>
        
        {/* Programa de ejercicios para casa */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Programa de Ejercicios</h3>
          <div className="mt-2">
            <Controller
              name="homeExerciseProgram"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Describa el programa de ejercicios para realizar en casa"
                  disabled={readOnly}
                  aria-label="Programa de ejercicios para casa"
                />
              )}
            />
          </div>
        </div>
        
        {/* Plan de seguimiento */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Plan de Seguimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="followUpPlan" className="block text-sm font-medium text-gray-700">Plan de seguimiento</label>
              <Controller
                name="followUpPlan"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="followUpPlan"
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Plan de reevaluación y seguimiento"
                    disabled={readOnly}
                    aria-label="Plan de seguimiento"
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="reevaluationPlan" className="block text-sm font-medium text-gray-700">Plan de reevaluación</label>
              <Controller
                name="reevaluationPlan"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="reevaluationPlan"
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ej: Reevaluar en 5 sesiones"
                    disabled={readOnly}
                    aria-label="Plan de reevaluación"
                  />
                )}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="expectedOutcomes" className="block text-sm font-medium text-gray-700">Resultados esperados</label>
            <Controller
              name="expectedOutcomes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="expectedOutcomes"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Resultados esperados del tratamiento"
                  disabled={readOnly}
                  aria-label="Resultados esperados del tratamiento"
                />
              )}
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="referrals" className="block text-sm font-medium text-gray-700">Derivaciones</label>
            <Controller
              name="referrals"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="referrals"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Derivaciones a otros profesionales si es necesario"
                  disabled={readOnly}
                  aria-label="Derivaciones a otros profesionales"
                />
              )}
            />
          </div>
        </div>
        
        {/* Intervenciones */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Intervenciones</h3>
          
          {/* Terapia manual */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Terapia manual</h4>
            <div className="mt-1">
              <Controller
                name="interventions.manual"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {specialtyConfig.interventionOptions.manual.map(option => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`manual-${option.value}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newValue = checked
                              ? [...(field.value || []), option.value]
                              : (field.value || []).filter((v: string) => v !== option.value);
                            field.onChange(newValue);
                          }}
                          disabled={readOnly}
                          aria-labelledby={`manual-label-${option.value}`}
                        />
                        <label id={`manual-label-${option.value}`} htmlFor={`manual-${option.value}`} className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Ejercicios */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Ejercicios</h4>
            <div className="mt-1">
              <Controller
                name="interventions.exercises"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {specialtyConfig.interventionOptions.exercises.map(option => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`exercise-${option.value}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => handleCheckboxChange(field, option.value, e)}
                          disabled={readOnly}
                          aria-labelledby={`exercise-label-${option.value}`}
                        />
                        <label id={`exercise-label-${option.value}`} htmlFor={`exercise-${option.value}`} className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Modalidades */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Modalidades</h4>
            <div className="mt-1">
              <Controller
                name="interventions.modalities"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {specialtyConfig.interventionOptions.modalities.map(option => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`modality-${option.value}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => handleCheckboxChange(field, option.value, e)}
                          disabled={readOnly}
                          aria-labelledby={`modality-label-${option.value}`}
                        />
                        <label id={`modality-label-${option.value}`} htmlFor={`modality-${option.value}`} className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Educación */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Educación</h4>
            <div className="mt-1">
              <Controller
                name="interventions.education"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {specialtyConfig.interventionOptions.education.map(option => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`education-${option.value}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => handleCheckboxChange(field, option.value, e)}
                          disabled={readOnly}
                          aria-labelledby={`education-label-${option.value}`}
                        />
                        <label id={`education-label-${option.value}`} htmlFor={`education-${option.value}`} className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Precauciones y contraindicaciones */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Precauciones y contraindicaciones</h3>
          
          {/* Precauciones */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Precauciones</h4>
            <div className="mt-1">
              <Controller
                name="precautions"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {specialtyConfig.precautionOptions.map(option => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`precaution-${option.value}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => handleCheckboxChange(field, option.value, e)}
                          disabled={readOnly}
                          aria-labelledby={`precaution-label-${option.value}`}
                        />
                        <label id={`precaution-label-${option.value}`} htmlFor={`precaution-${option.value}`} className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Contraindicaciones */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Contraindicaciones</h4>
            <div className="mt-1">
              <Controller
                name="contraindications"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {contraindicationItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleUpdateItemWithId(field, contraindicationItems, setContraindicationItems, item.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Contraindicación"
                          disabled={readOnly}
                          aria-labelledby={`contraindication-label-${item.id}`}
                          id={`contraindication-${item.id}`}
                        />
                        <span id={`contraindication-label-${item.id}`} className="sr-only">Contraindicación</span>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemWithId(field, contraindicationItems, setContraindicationItems, item.id)}
                            className="ml-2 text-red-500"
                            aria-label="Eliminar contraindicación"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => field.onChange([...(field.value || []), ''])}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Añadir contraindicación
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        {!readOnly && (
          <div className="p-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Guardar plan
            </button>
          </div>
        )}
      </div>
    </form>
  );
}