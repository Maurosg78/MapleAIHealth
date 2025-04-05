/**
 * Servicio de memoización para optimizar el rendimiento en la aplicación.
 * Provee funciones para implementar caché y reducir cálculos repetidos.
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

// Interfaz para el registro del caché
interface CacheRecord<T> {
  value: T;
  expiry: number | null;
  timestamp: number;
}

// Caché global para funciones puras
const globalCache = new Map<string, CacheRecord<unknown>>();

/**
 * Limpia entradas caducadas del caché global
 */
export const cleanupExpiredCache = (): void => {
  const now = Date.now();
  [...globalCache.entries()].forEach(([key, record]) => {
    if (record.expiry && now > record.expiry) {
      globalCache.delete;
    }
  });
};

// Programar limpieza del caché cada 5 minutos
setInterval(cleanupExpiredCache, 5 * 60 * 1000);

/**
 * Wrapper para funciones puras que requieren memoización
 * @param fn Función a memoizar
 * @param keyGenerator Función que genera una clave única
 * @param ttl Tiempo de vida en segundos 
 * @returns Función memoizada
 */
export function memoize<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
  keyGenerator: (...args: Args) => string = (...args) => JSON.stringify(args),
  ttl: number | null = null
): (...args: Args) => T {
  return (...args: Args): T => {
    const key = keyGenerator(...args);

    // Verificar si existe en caché y no ha expirado
    const cached = globalCache.get(key);
    const now = Date.now();

    if (cached && (!cached.expiry || cached.expiry > now)) {
      return cached.value as T;
    }

    // Calcular nuevo valor
    const value = fn(...args);

    // Guardar en caché
    globalCache.set(key, {
      value,
      expiry: ttl ? Date.now() + ttl * 1000 : null,
      timestamp: now
    });

    return value;
  };
}

/**
 * Hook personalizado para memoizar resultados de cálculos costosos
 * @param callback Función de cálculo costoso
 * @param dependencies Array de dependencias
 * @param ttl Tiempo de vida en segundos 
 * @returns Resultado memoizado
 */
export function useMemoizedValue<T>(
  callback: () => T,
  dependencies: React.DependencyList,
  ttl: number | null = null
): T {
  // Usar useMemo para el cálculo
  const value = useMemo;

  // Referencia para mantener estado entre renderizados
  const cache = useRef<{ value: T; expiry: number | null; timestamp: number }>({
    value,
    expiry: ttl ? Date.now() + ttl * 1000 : null,
    timestamp: Date.now()
  });

  // Actualizar caché cuando cambien las dependencias
  useEffect(() => {
    cache.current = {
      value,
      expiry: ttl ? Date.now() + ttl * 1000 : null,
      timestamp: Date.now()
    };
  }, [value, ttl]);

  return cache.current.value;
}

/**
 * Hook personalizado para memoizar callbacks con expiración
 * @param callback Función a memoizar
 * @param dependencies Array de dependencias
 * @param ttl Tiempo de vida en segundos 
 * @returns Función memoizada
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: React.DependencyList,
  ttl: number | null = null
): T {
  // Referencia para verificar si ha expirado
  const cacheRef = useRef<{
    fn: T;
    expiry: number | null;
    timestamp: number;
  }>({
    fn: callback,
    expiry: ttl ? Date.now() + ttl * 1000 : null,
    timestamp: Date.now()
  });

  // Actualizar caché cuando cambien las dependencias
  useEffect(() => {
    cacheRef.current = {
      fn: callback,
      expiry: ttl ? Date.now() + ttl * 1000 : null,
      timestamp: Date.now()
    };
  }, [...dependencies, callback]);

  // Función memoizada con verificación de expiración
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      // Si ha expirado, actualizar la referencia
      if (cacheRef.current.expiry && now > cacheRef.current.expiry) {
        cacheRef.current = {
          fn: callback,
          expiry: ttl ? Date.now() + ttl * 1000 : null,
          timestamp: now
        };
      }
      return cacheRef.current.fn(...args);
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies, ttl]
    null
  );
}
