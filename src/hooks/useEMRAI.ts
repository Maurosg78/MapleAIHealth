import { useState, useCallback } from 'react';
import { emrAIIntegrationService } from '../services/integration';
import { EMRSystem, EMRAdapterFactory, emrConfigService } from '../services/emr';
import { CompleteEMRData } from '../services/emr/types';
import { AIResponse } from '../services/ai/types';
import { detectMedicalIntent } from '../services/ai/intentDetector';
import { formatResponse, highlightWarningsAndInstructions } from '../services/ai/responseFormatter';
import { convertCompleteEMRToAIFormat } from '../services/ai/adapters';
import logger from '../services/logger';

/**
 * Hook para utilizar el servicio de integración entre EMR e IA
 * Facilita el acceso a los datos médicos y su análisis con IA
 */
export const useEMRAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [patientData, setPatientData] = useState<CompleteEMRData | null>(null);

  /**
   * Analiza las notas médicas de un paciente
   * @param patientId ID del paciente
   * @param emrSystem Sistema EMR a utilizar
   */
  const analyzePatientNotes = useCallback(
    async (
      patientId: string,
      emrSystem?: EMRSystem
    ): Promise<AIResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // Obtener datos del paciente si es posible para enriquecer el análisis
        try {
          const currentSystem = emrSystem || emrConfigService.getCurrentSystem();
          const adapter = await EMRAdapterFactory.getAdapter(currentSystem, emrConfigService.getConfig(currentSystem));

          const data = await adapter.getPatientData(patientId);
          // Convertir PatientData a CompleteEMRData para nuestro uso
          const emrData: CompleteEMRData = {
            patientId: data.id,
            demographics: {
              name: `${data.firstName} ${data.lastName}`,
              age: new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear(),
              sex: data.gender === 'male' ? 'male' : data.gender === 'female' ? 'female' : 'other',
              dob: data.dateOfBirth
            },
            medicalHistory: {
              conditions: [],
              allergies: [],
              medications: [],
              procedures: []
            },
            lastUpdated: new Date().toISOString()
          };
          setPatientData(emrData);
        } catch (error) {
          logger.warn('No se pudieron obtener datos del paciente para enriquecer el análisis', { error });
        }

        const response = await emrAIIntegrationService.analyzePatientNotes(
          patientId,
          emrSystem
        );

        // Detectar la intención para mejorar el formato de la respuesta
        const intent = detectMedicalIntent("Análisis de notas médicas");

        // Convertir CompleteEMRData a EMRData para formateo
        const emrDataForFormat = patientData ? convertCompleteEMRToAIFormat(patientData) : undefined;

        // Aplicar formato según la intención detectada
        const formattedResponse = formatResponse(response, intent.type, emrDataForFormat);

        // Resaltar advertencias e instrucciones importantes
        const enhancedResponse = highlightWarningsAndInstructions(formattedResponse);

        setResult(enhancedResponse);
        return enhancedResponse;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Error al analizar notas del paciente');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [patientData]
  );

  /**
   * Obtiene y analiza la historia clínica completa de un paciente
   * @param patientId ID del paciente
   * @param emrSystem Sistema EMR a utilizar
   */
  const getCompleteAnalysis = useCallback(
    async (
      patientId: string,
      emrSystem?: EMRSystem
    ): Promise<AIResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // Obtener datos del paciente si es posible
        try {
          const currentSystem = emrSystem || emrConfigService.getCurrentSystem();
          const adapter = await EMRAdapterFactory.getAdapter(currentSystem, emrConfigService.getConfig(currentSystem));

          const data = await adapter.getPatientData(patientId);
          // Convertir PatientData a CompleteEMRData para nuestro uso
          const emrData: CompleteEMRData = {
            patientId: data.id,
            demographics: {
              name: `${data.firstName} ${data.lastName}`,
              age: new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear(),
              sex: data.gender === 'male' ? 'male' : data.gender === 'female' ? 'female' : 'other',
              dob: data.dateOfBirth
            },
            medicalHistory: {
              conditions: [],
              allergies: [],
              medications: [],
              procedures: []
            },
            lastUpdated: new Date().toISOString()
          };
          setPatientData(emrData);
        } catch (error) {
          logger.warn('No se pudieron obtener datos del paciente para enriquecer el análisis', { error });
        }

        const response = await emrAIIntegrationService.getPatientCompleteAnalysis(
          patientId,
          emrSystem
        );

        // Detectar la intención y aplicar formato
        const intent = detectMedicalIntent("Análisis médico completo");

        // Convertir CompleteEMRData a EMRData para formateo
        const emrDataForFormat = patientData ? convertCompleteEMRToAIFormat(patientData) : undefined;

        const formattedResponse = formatResponse(response, intent.type, emrDataForFormat);
        const enhancedResponse = highlightWarningsAndInstructions(formattedResponse);

        setResult(enhancedResponse);
        return enhancedResponse;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Error al obtener análisis completo');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [patientData]
  );

  /**
   * Ejecuta una consulta personalizada sobre datos del paciente
   * @param patientId ID del paciente
   * @param query Consulta a realizar
   * @param includeMedicalData Si debe incluir datos médicos completos
   * @param emrSystem Sistema EMR a utilizar
   */
  const executeCustomPatientQuery = useCallback(
    async (
      patientId: string,
      query: string,
      includeMedicalData = true,
      emrSystem?: EMRSystem
    ): Promise<AIResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // Obtener datos del paciente si es posible
        try {
          const currentSystem = emrSystem || emrConfigService.getCurrentSystem();
          const adapter = await EMRAdapterFactory.getAdapter(currentSystem, emrConfigService.getConfig(currentSystem));

          const data = await adapter.getPatientData(patientId);
          // Convertir PatientData a CompleteEMRData para nuestro uso
          const emrData: CompleteEMRData = {
            patientId: data.id,
            demographics: {
              name: `${data.firstName} ${data.lastName}`,
              age: new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear(),
              sex: data.gender === 'male' ? 'male' : data.gender === 'female' ? 'female' : 'other',
              dob: data.dateOfBirth
            },
            medicalHistory: {
              conditions: [],
              allergies: [],
              medications: [],
              procedures: []
            },
            lastUpdated: new Date().toISOString()
          };
          setPatientData(emrData);
        } catch (error) {
          logger.warn('No se pudieron obtener datos del paciente para enriquecer la consulta', { error });
        }

        // Convertir para uso con enhanceQueryWithContext
        const emrDataForQuery = patientData ? convertCompleteEMRToAIFormat(patientData) : undefined;

        // Modificar la consulta si tenemos datos del paciente
        const enhancedQuery = patientData
          ? `Contexto: Paciente ${patientData.demographics.name}, ${patientData.demographics.age} años. ${query}`
          : query;

        // Detectar la intención de la consulta
        const intent = detectMedicalIntent(query);

        const response = await emrAIIntegrationService.executeCustomPatientQuery(
          patientId,
          enhancedQuery,
          includeMedicalData,
          emrSystem
        );

        // Aplicar formato según la intención
        const formattedResponse = formatResponse(response, intent.type, emrDataForQuery);
        const enhancedResponse = highlightWarningsAndInstructions(formattedResponse);

        setResult(enhancedResponse);
        return enhancedResponse;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Error al ejecutar consulta personalizada');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [patientData]
  );

  /**
   * Limpia los resultados y errores
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setPatientData(null);
  }, []);

  return {
    loading,
    error,
    result,
    analyzePatientNotes,
    getCompleteAnalysis,
    executeCustomPatientQuery,
    reset,
  };
};
