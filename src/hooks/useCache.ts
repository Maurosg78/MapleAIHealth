import { useState, useCallback, useEffect } from 'react';
import { CacheManagerFactory } from '../services/cache';
import { CacheMetadata } from '../services/cache/types';

/**
 * Hook personalizado para interactuar con el sistema de caché
 * @param section Sección de la aplicación para la que se utilizará la caché
 * @param defaultTTL Tiempo de vida predeterminado en milisegundos (opcional)
 */
export function useCache<T>(section: string, patientId?: string) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cacheManager = CacheManagerFactory.getInstance<T>(section);
  
  // Obtener un valor de la caché
  const get = useCallback(
    async (key: string): Promise<T | undefined> => {
      setIsLoading(true);
      try {
        const result = await cacheManager.get(key);
        return result;
      } catch (error) {
        console.error(`Error al obtener de caché (${section}):`, error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [cacheManager, section]
  );

  // Almacenar un valor en la caché
  const set = useCallback(
    async (key: string, value: T, additionalMetadata: Partial<CacheMetadata> = {}): Promise<void> => {
      try {
        const metadata: CacheMetadata = {
          lastAccess: Date.now(),
          accessCount: 1,
          size: JSON.stringify(value).length,
          patientId,
          section,
          ...additionalMetadata
        };
        
        await cacheManager.set(key, value, metadata);
      } catch (error) {
        console.error(`Error al almacenar en caché (${section}):`, error);
      }
    },
    [cacheManager, section, patientId]
  );

  // Invalidar una entrada específica
  const invalidate = useCallback(
    async (key: string): Promise<void> => {
      try {
        await cacheManager.invalidate(key);
      } catch (error) {
        console.error(`Error al invalidar caché (${section}):`, error);
      }
    },
    [cacheManager, section]
  );

  // Invalidar todas las entradas relacionadas con un paciente
  const invalidatePatient = useCallback(
    async (targetPatientId: string): Promise<void> => {
      try {
        await cacheManager.invalidateByPatient(targetPatientId);
      } catch (error) {
        console.error(`Error al invalidar caché por paciente (${section}):`, error);
      }
    },
    [cacheManager, section]
  );

  // Invalidar todas las entradas de la sección
  const invalidateAll = useCallback(
    async (): Promise<void> => {
      try {
        await cacheManager.clear();
      } catch (error) {
        console.error(`Error al invalidar toda la caché (${section}):`, error);
      }
    },
    [cacheManager, section]
  );

  // Obtener estadísticas de la caché
  const getStats = useCallback(
    () => {
      return cacheManager.getStats();
    },
    [cacheManager]
  );

  // Limpiar la caché al desmontar el componente si es necesario
  useEffect(() => {
    return () => {
      // No hacemos limpieza automática al desmontar
      // solo si explícitamente se solicita
    };
  }, []);

  return {
    get,
    set,
    invalidate,
    invalidatePatient,
    invalidateAll,
    getStats,
    isLoading
  };
} 