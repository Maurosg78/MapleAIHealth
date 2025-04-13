import React, { useState, useEffect } from 'react';
import { SubjectiveData, SpecialtyType } from '../../../../types/clinical';
import { useForm, Controller } from 'react-hook-form';
import { PainScaleInput } from '../../common/PainScaleInput';
import { AnatomicalSelector } from '../../common/AnatomicalSelector';

interface SubjectiveContainerProps {
  patientId: string;
  specialty: SpecialtyType;
  visitId?: string;
  readOnly?: boolean;
}

/**
 * Componente Subjetivo para la estructura SOAP
 * Diseñado para ser adaptable a diferentes especialidades médicas
 */
export default function SubjectiveContainer({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patientId, // Incluido para coherencia con otros componentes SOAP
  specialty,
  visitId,
  readOnly = false
}: SubjectiveContainerProps) {
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  
  // Configuración dinámica según especialidad
  const getSpecialtyFields = () => {
    switch(specialty) {
      case 'physiotherapy':
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
      // Aquí se agregarían más casos para otras especialidades
      default:
        return {
          painQualityOptions: [],
          factorOptions: [],
          treatmentOptions: []
        };
    }
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
  };
  
  if (loading) return <div className="flex justify-center p-4">Cargando datos del paciente...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <textarea
                    {...field}
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
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <Controller
              name="painDescription"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
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
            <label className="block text-sm font-medium text-gray-700">Localización</label>
            <div className="mt-1">
              <AnatomicalSelector 
                readOnly={readOnly}
                onChange={(locations) => setValue('painLocation', locations)}
                value={watch('painLocation') || []}
              />
            </div>
          </div>
          
          {/* Intensidad del dolor */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Intensidad (0-10)</label>
            <div className="mt-1">
              <PainScaleInput 
                value={watch('painIntensity') || 0} 
                onChange={(value) => setValue('painIntensity', value)}
                readOnly={readOnly}
              />
            </div>
          </div>
          
          {/* Cualidad del dolor */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Cualidad del dolor</label>
            <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Controller
                name="painQuality"
                control={control}
                render={({ field }) => (
                  <>
                    {specialtyConfig.painQualityOptions.map((option) => (
                      <label key={option.value} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentValues = field.value || [];
                            field.onChange(
                              checked
                                ? [...currentValues, option.value]
                                : currentValues.filter((value) => value !== option.value)
                            );
                          }}
                          disabled={readOnly}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </>
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Factores */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Factores agravantes */}
          <div>
            <h4 className="text-md font-medium text-gray-900">Factores Agravantes</h4>
            <div className="mt-1">
              <Controller
                name="aggravatingFactors"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {specialtyConfig.factorOptions.map((option) => (
                      <label key={option.value} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentValues = field.value || [];
                            field.onChange(
                              checked
                                ? [...currentValues, option.value]
                                : currentValues.filter((value) => value !== option.value)
                            );
                          }}
                          disabled={readOnly}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Factores aliviantes */}
          <div>
            <h4 className="text-md font-medium text-gray-900">Factores Aliviantes</h4>
            <div className="mt-1">
              <Controller
                name="relievingFactors"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {specialtyConfig.factorOptions.map((option) => (
                      <label key={option.value} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={field.value?.includes(option.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentValues = field.value || [];
                            field.onChange(
                              checked
                                ? [...currentValues, option.value]
                                : currentValues.filter((value) => value !== option.value)
                            );
                          }}
                          disabled={readOnly}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Tratamientos previos */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Tratamientos Previos</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Controller
              name="previousTreatments"
              control={control}
              render={({ field }) => (
                <>
                  {specialtyConfig.treatmentOptions.map((option) => (
                    <label key={option.value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={field.value?.includes(option.value)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const currentValues = field.value || [];
                          field.onChange(
                            checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((value) => value !== option.value)
                          );
                        }}
                        disabled={readOnly}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </>
              )}
            />
          </div>
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
                  {(field.value || []).map((goal, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => {
                          const newGoals = [...(field.value || [])];
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
                            const newGoals = [...(field.value || [])];
                            newGoals.splice(index, 1);
                            field.onChange(newGoals);
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange([...(field.value || []), '']);
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
          <h3 className="text-lg font-medium text-gray-900">Historia Clínica Relevante</h3>
          <div className="mt-2">
            <Controller
              name="medicalHistory"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
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
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Guardar
          </button>
        </div>
      )}
    </form>
  );
} 