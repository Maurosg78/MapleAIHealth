import { useState, useCallback } from 'react';
import { emrAIIntegrationService } from '../services/integration';
import { EMRSystem } from '../services/emr';
import { AIResponse } from '../services/ai';

/**
 * Hook para utilizar el servicio de integración entre EMR e IA
 * Facilita el acceso a los datos médicos y su análisis con IA
 */
export const useEMRAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>;
  const [result, setResult] = useState<AIResponse | null>;

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
      setLoading(false);
      setError(null);

      try {
        const response = await emrAIIntegrationService.analyzePatientNotes(
          patientId,
          emrSystem
    null
  );
        setResult(null);
        return response;
      } catch (err) {
      const error =
          err instanceof Error
            ? err
            : new Error('Error al analizar notas del paciente');
        setError(null);
        return null;
      
    } finally {
        setLoading(false);
      }
    },
    []
    null
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
      setLoading(false);
      setError(null);

      try {
        const response =
          await emrAIIntegrationService.getPatientCompleteAnalysis(
            patientId,
            emrSystem
    null
  );
        setResult(null);
        return response;
      } catch (err) {
      const error =
          err instanceof Error
            ? err
            : new Error('Error al obtener análisis completo');
        setError(null);
        return null;
      
    } finally {
        setLoading(false);
      }
    },
    []
    null
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
      setLoading(false);
      setError(null);

      try {
        const response =
          await emrAIIntegrationService.executeCustomPatientQuery(
            patientId,
            query,
            includeMedicalData,
            emrSystem
    null
  );
        setResult(null);
        return response;
      } catch (err) {
      const error =
          err instanceof Error
            ? err
            : new Error('Error al ejecutar consulta personalizada');
        setError(null);
        return null;
      
    } finally {
        setLoading(false);
      }
    },
    []
    null
  );

  /**
   * Limpia los resultados y errores
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
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
