/**
 * Configuración global para el servicio de IA de salud
 */

// Modos de operación del servicio
export type AIServiceMode = 'local' | 'remote' | 'hybrid';

// Configuración base
export interface AIHealthServiceConfig {
  // Modo de operación del servicio
  mode: AIServiceMode;
  
  // Configuración de caché
  cache: {
    enabled: boolean;
    ttlMs: number; // Tiempo de vida en milisegundos
    maxEntries: number; // Máximo número de entradas en caché
  };
  
  // Configuración para la API remota
  remoteApi?: {
    baseUrl: string;
    apiKey?: string;
    timeout: number; // Timeout en milisegundos
    retries: number; // Número de reintentos en caso de fallo
    useSSL: boolean;
  };
  
  // Configuración para el motor de reglas local
  localRules: {
    enabled: boolean;
    minConfidence: number; // Confianza mínima para mostrar sugerencias
    maxSuggestionsPerSection: number; // Máximo número de sugerencias por sección
  };
  
  // Configuración de la interfaz de usuario
  ui: {
    refreshIntervalMs: number; // Intervalo para verificar nuevas sugerencias
    highlightNewSuggestions: boolean;
    showSourceInfo: boolean; // Mostrar si la sugerencia viene de reglas locales o API
    enableFeedback: boolean; // Permitir feedback del usuario
  };
  
  // Configuración para logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    logRequests: boolean;
    logResponses: boolean;
  };
}

// Configuración por defecto para entorno de desarrollo
export const developmentConfig: AIHealthServiceConfig = {
  mode: 'local', // Solo usar reglas locales en desarrollo
  cache: {
    enabled: true,
    ttlMs: 60000, // 1 minuto
    maxEntries: 50,
  },
  localRules: {
    enabled: true,
    minConfidence: 0.6, // Umbral menor para desarrollo
    maxSuggestionsPerSection: 10, // Más sugerencias para pruebas
  },
  ui: {
    refreshIntervalMs: 5000, // Actualizar cada 5 segundos
    highlightNewSuggestions: true,
    showSourceInfo: true, // Mostrar fuente en desarrollo
    enableFeedback: true,
  },
  logging: {
    level: 'debug',
    logRequests: true,
    logResponses: true,
  },
};

// Configuración por defecto para entorno de producción
export const productionConfig: AIHealthServiceConfig = {
  mode: 'hybrid', // Usar combinación de reglas locales y API en producción
  cache: {
    enabled: true,
    ttlMs: 300000, // 5 minutos
    maxEntries: 200,
  },
  remoteApi: {
    baseUrl: 'https://api.example.com/ai-health', // URL de ejemplo, debe reemplazarse
    timeout: 8000, // 8 segundos
    retries: 2,
    useSSL: true,
  },
  localRules: {
    enabled: true,
    minConfidence: 0.75, // Umbral más alto para producción
    maxSuggestionsPerSection: 5, // Limitar sugerencias en producción
  },
  ui: {
    refreshIntervalMs: 10000, // Actualizar cada 10 segundos
    highlightNewSuggestions: true,
    showSourceInfo: false, // No mostrar fuente en producción
    enableFeedback: true,
  },
  logging: {
    level: 'warn',
    logRequests: false,
    logResponses: false,
  },
};

// Exportar la configuración según el entorno
const isProduction = process.env.NODE_ENV === 'production';
export const aiHealthConfig: AIHealthServiceConfig = isProduction
  ? productionConfig
  : developmentConfig;

// Función para extender/sobreescribir la configuración
export function extendConfig(customConfig: Partial<AIHealthServiceConfig>): AIHealthServiceConfig {
  // Base de la configuración extendida
  const extended: AIHealthServiceConfig = {
    ...aiHealthConfig,
    ...customConfig,
    cache: {
      ...aiHealthConfig.cache,
      ...(customConfig.cache || {}),
    },
    localRules: {
      ...aiHealthConfig.localRules,
      ...(customConfig.localRules || {}),
    },
    ui: {
      ...aiHealthConfig.ui,
      ...(customConfig.ui || {}),
    },
    logging: {
      ...aiHealthConfig.logging,
      ...(customConfig.logging || {}),
    },
  };

  // Manejar el caso especial de remoteApi que puede ser undefined
  if (aiHealthConfig.remoteApi || customConfig.remoteApi) {
    extended.remoteApi = {
      ...(aiHealthConfig.remoteApi || {
        baseUrl: '',
        timeout: 5000,
        retries: 1,
        useSSL: true
      }),
      ...(customConfig.remoteApi || {})
    };
  }

  return extended;
} 