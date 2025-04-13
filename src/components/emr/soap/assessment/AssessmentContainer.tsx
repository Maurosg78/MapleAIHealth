import React, { useState, useEffect } from 'react';
import { AssessmentData, SpecialtyType } from '../../../../types/clinical';
import { useForm, Controller } from 'react-hook-form';

interface AssessmentContainerProps {
  patientId: string;
  specialty: SpecialtyType;
  visitId?: string;
  readOnly?: boolean;
}

/**
 * Componente de Evaluación para la estructura SOAP
 * Diseñado para ser adaptable a diferentes especialidades médicas
 */
export default function AssessmentContainer({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patientId, // Incluido para coherencia con otros componentes SOAP
  specialty,
  visitId,
  readOnly = false
}: AssessmentContainerProps) {
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null); // No utilizado por ahora
  const [error] = useState<string | null>(null);
  
  // Configuración dinámica según especialidad
  // La función está definida para uso futuro
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSpecialtyConfig = () => {
    switch(specialty) {
      case 'physiotherapy':
        return {
          diagnosisOptions: [
            { value: 'lumbalgia', label: 'Lumbalgia' },
            { value: 'cervicalgia', label: 'Cervicalgia' },
            { value: 'hombro_doloroso', label: 'Síndrome de hombro doloroso' },
            { value: 'tendinitis', label: 'Tendinitis' },
            { value: 'cintilla_iliotibial', label: 'Síndrome de cintilla iliotibial' },
            { value: 'fascitis_plantar', label: 'Fascitis plantar' },
            { value: 'esguince_tobillo', label: 'Esguince de tobillo' },
            { value: 'epitrocleitis', label: 'Epitrocleitis' },
            { value: 'epicondilitis', label: 'Epicondilitis' },
          ],
          classificationOptions: [
            { value: 'agudo', label: 'Agudo (<4 semanas)' },
            { value: 'subagudo', label: 'Subagudo (4-12 semanas)' },
            { value: 'cronico', label: 'Crónico (>12 semanas)' },
            { value: 'recurrente', label: 'Recurrente' },
          ],
          riskFactorsOptions: [
            { value: 'sedentarismo', label: 'Sedentarismo' },
            { value: 'trabajo_repetitivo', label: 'Trabajo repetitivo' },
            { value: 'postura_prolongada', label: 'Postura prolongada' },
            { value: 'sobrecarga', label: 'Sobrecarga mecánica' },
            { value: 'trauma_previo', label: 'Trauma previo' },
            { value: 'estres', label: 'Estrés' },
          ]
        };
      // Aquí se agregarían más casos para otras especialidades
      default:
        return {
          diagnosisOptions: [],
          classificationOptions: [],
          riskFactorsOptions: []
        };
    }
  };
  
  const specialtyConfig = getSpecialtyConfig(); // Necesario para las nuevas secciones
  
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<AssessmentData>({
    defaultValues: {
      diagnosis: '',
      clinicalFindings: '',
      impression: '',
      problemList: [],
      differentialDiagnosis: '',
      reasoning: '',
      prognosis: '',
      functionalDiagnosis: '',
      clinicalClassification: [],
      riskFactors: [],
      prognosticFactors: [],
      comorbidities: []
    }
  });
  
  // Cargar datos existentes si hay un visitId
  useEffect(() => {
    if (visitId) {
      setLoading(true);
      // Aquí iría la lógica para cargar datos existentes desde la API
      // Por ahora solo simulamos un delay
      setTimeout(() => {
        const mockData: AssessmentData = {
          diagnosis: 'Lumbalgia mecánica',
          clinicalFindings: 'Limitación en flexión de tronco, dolor a la palpación paravertebral.',
          impression: 'Limitación funcional moderada por dolor lumbar de origen mecánico.',
          problemList: ['Dolor lumbar', 'Limitación en flexión', 'Dificultad para actividades laborales'],
          differentialDiagnosis: 'Hernia discal L4-L5, síndrome facetario',
          reasoning: 'La evaluación muestra un patrón de dolor mecánico sin irradiación, compatible con sobrecarga muscular.',
          prognosis: 'Favorable',
          functionalDiagnosis: 'Alteración de la mecánica lumbar con limitación funcional moderada',
          clinicalClassification: ['subagudo'],
          riskFactors: ['sedentarismo', 'postura_prolongada'],
          prognosticFactors: ['Buena actitud del paciente', 'Sin irradiación'],
          comorbidities: ['Hipertensión controlada']
        };
        
        // Establecer los valores en el formulario
        Object.entries(mockData).forEach(([key, value]) => {
          setValue(key as keyof AssessmentData, value);
        });
        
        setLoading(false);
      }, 500);
    }
  }, [visitId, setValue]);
  
  const onSubmit = (data: AssessmentData) => {
    // Aquí iría la lógica para guardar los datos
    console.log('Formulario Evaluación:', data);
  };
  
  if (loading) return <div className="flex justify-center p-4">Cargando datos del paciente...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg divide-y">
        {/* Diagnóstico */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Diagnóstico</h3>
          <div className="mt-2">
            <Controller
              name="diagnosis"
              control={control}
              rules={{ required: 'El diagnóstico es obligatorio' }}
              render={({ field }) => (
                <div>
                  <textarea
                    {...field}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Diagnóstico principal"
                    disabled={readOnly}
                    aria-label="Diagnóstico principal"
                  />
                  {errors.diagnosis && (
                    <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Hallazgos clínicos */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Hallazgos Clínicos</h3>
          <div className="mt-2">
            <Controller
              name="clinicalFindings"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Hallazgos relevantes de la exploración"
                  disabled={readOnly}
                  aria-label="Hallazgos clínicos relevantes"
                />
              )}
            />
          </div>
        </div>
        
        {/* Impresión diagnóstica */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Impresión Diagnóstica</h3>
          <div className="mt-2">
            <Controller
              name="impression"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Impresión diagnóstica general"
                  disabled={readOnly}
                  aria-label="Impresión diagnóstica general"
                />
              )}
            />
          </div>
        </div>
        
        {/* Lista de problemas */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Lista de Problemas</h3>
          <div className="mt-2">
            <Controller
              name="problemList"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value.map((problem, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={problem}
                        onChange={(e) => {
                          const newValue = [...field.value];
                          newValue[index] = e.target.value;
                          field.onChange(newValue);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Problema"
                        disabled={readOnly}
                        aria-label={`Problema ${index + 1}`}
                      />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = field.value.filter((_, i) => i !== index);
                            field.onChange(newValue);
                          }}
                          className="ml-2 text-red-500"
                          aria-label="Eliminar problema"
                        >
                          <span className="sr-only">Eliminar</span>
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
                      onClick={() => field.onChange([...field.value, ''])}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Añadir problema
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Diagnóstico diferencial */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Diagnóstico Diferencial</h3>
          <div className="mt-2">
            <Controller
              name="differentialDiagnosis"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Diagnósticos diferenciales a considerar"
                  disabled={readOnly}
                  aria-label="Diagnósticos diferenciales a considerar"
                />
              )}
            />
          </div>
        </div>
        
        {/* Razonamiento clínico */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Razonamiento Clínico</h3>
          <div className="mt-2">
            <Controller
              name="reasoning"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Explicación del razonamiento clínico"
                  disabled={readOnly}
                  aria-label="Explicación del razonamiento clínico"
                />
              )}
            />
          </div>
        </div>
        
        {/* Pronóstico */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Pronóstico</h3>
          <div className="mt-2">
            <Controller
              name="prognosis"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Pronóstico esperado"
                  disabled={readOnly}
                  aria-label="Pronóstico esperado"
                />
              )}
            />
          </div>
        </div>
        
        {/* Diagnóstico funcional */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Diagnóstico Funcional</h3>
          <div className="mt-2">
            <Controller
              name="functionalDiagnosis"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Diagnóstico desde perspectiva funcional"
                  disabled={readOnly}
                  aria-label="Diagnóstico funcional del paciente"
                />
              )}
            />
          </div>
        </div>
        
        {/* Clasificación clínica */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Clasificación Clínica</h3>
          <div className="mt-2">
            <Controller
              name="clinicalClassification"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {specialtyConfig.classificationOptions.map(option => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`classification-${option.value}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        value={option.value}
                        checked={field.value?.includes(option.value)}
                        onChange={(e) => {
                          const value = option.value;
                          const newValue = e.target.checked
                            ? [...(field.value || []), value]
                            : (field.value || []).filter((v: string) => v !== value);
                          field.onChange(newValue);
                        }}
                        disabled={readOnly}
                        aria-label={option.label}
                      />
                      <label htmlFor={`classification-${option.value}`} className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Factores de riesgo */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Factores de Riesgo</h3>
          <div className="mt-2">
            <Controller
              name="riskFactors"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {specialtyConfig.riskFactorsOptions.map(option => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`risk-${option.value}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        value={option.value}
                        checked={field.value?.includes(option.value)}
                        onChange={(e) => {
                          const value = option.value;
                          const newValue = e.target.checked
                            ? [...(field.value || []), value]
                            : (field.value || []).filter((v: string) => v !== value);
                          field.onChange(newValue);
                        }}
                        disabled={readOnly}
                        aria-label={option.label}
                      />
                      <label htmlFor={`risk-${option.value}`} className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Factores pronósticos */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Factores Pronósticos</h3>
          <div className="mt-2">
            <Controller
              name="prognosticFactors"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {(field.value || []).map((factor, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={factor}
                        onChange={(e) => {
                          const newValue = [...(field.value || [])];
                          newValue[index] = e.target.value;
                          field.onChange(newValue);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Factor pronóstico"
                        disabled={readOnly}
                        aria-label={`Factor pronóstico ${index + 1}`}
                      />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = (field.value || []).filter((_, i) => i !== index);
                            field.onChange(newValue);
                          }}
                          className="ml-2 text-red-500"
                          aria-label="Eliminar factor pronóstico"
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
                      Añadir factor pronóstico
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Comorbilidades */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Comorbilidades</h3>
          <div className="mt-2">
            <Controller
              name="comorbidities"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {(field.value || []).map((comorbidity, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={comorbidity}
                        onChange={(e) => {
                          const newValue = [...(field.value || [])];
                          newValue[index] = e.target.value;
                          field.onChange(newValue);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Comorbilidad"
                        disabled={readOnly}
                        aria-label={`Comorbilidad ${index + 1}`}
                      />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = (field.value || []).filter((_, i) => i !== index);
                            field.onChange(newValue);
                          }}
                          className="ml-2 text-red-500"
                          aria-label="Eliminar comorbilidad"
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
                      Añadir comorbilidad
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Botones de acción */}
        {!readOnly && (
          <div className="p-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Guardar evaluación
            </button>
          </div>
        )}
      </div>
    </form>
  );
} 