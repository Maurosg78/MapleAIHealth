import { useState, useCallback } from 'react';
import { aiService } from '../services/ai';
import { AIQuery, AIResponse, UnstructuredNote } from '../services/ai';

/**
 * Hook para realizar consultas al servicio de IA
 * Maneja estados de carga, errores y resultados
 */
export const useAIQuery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);

  /**
   * Ejecuta una consulta al servicio de IA
   * @param query - Consulta a realizar
   */
  const executeQuery = useCallback(async (query: AIQuery): Promise<AIResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.query(query);
      setResult(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido en la consulta de IA');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Analiza notas médicas no estructuradas
   * @param patientId - ID del paciente
   * @param notes - Array de notas médicas
   */
  const analyzeNotes = useCallback(async (patientId: string, notes: UnstructuredNote[]): Promise<AIResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.analyzeUnstructuredNotes(patientId, notes);
      setResult(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al analizar notas médicas');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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
    executeQuery,
    analyzeNotes,
    reset
  };
};
