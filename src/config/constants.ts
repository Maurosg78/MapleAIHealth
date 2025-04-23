import { LogLevel } from '../services/utils/logger';;;;;

export const APP_CONFIG = {
  // Configuración general de la aplicación
  APP_NAME: 'MapleAIHealth',
  VERSION: '1.0.0',
  
  // Configuración del logger
  LOGGER: {
    DEFAULT_LEVEL: LogLevel.INFO,
    DEFAULT_PREFIX: '[MapleAIHealth]'
  },

  // Configuración de validación
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 50,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    MAX_EMAIL_LENGTH: 100,
    MAX_NAME_LENGTH: 50
  },

  // Configuración de API
  API: {
    BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    TIMEOUT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo
  },

  // Configuración de caché
  CACHE: {
    TTL: 3600, // 1 hora en segundos
    MAX_SIZE: 1000, // Número máximo de elementos en caché
    CHECK_PERIOD: 600 // Período de limpieza en segundos
  },

  // Configuración de seguridad
  SECURITY: {
    JWT_EXPIRATION: '24h',
    SALT_ROUNDS: 10,
    SESSION_TIMEOUT: 3600000 // 1 hora en milisegundos
  },

  // Mensajes de error
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    USER_NOT_FOUND: 'Usuario no encontrado',
    INVALID_TOKEN: 'Token inválido o expirado',
    SERVER_ERROR: 'Error interno del servidor',
    VALIDATION_ERROR: 'Error de validación',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado'
  }
} as const;

// Tipos derivados de la configuración
export type AppConfig = typeof APP_CONFIG;
export type ValidationConfig = typeof APP_CONFIG.VALIDATION;
export type ApiConfig = typeof APP_CONFIG.API;
export type SecurityConfig = typeof APP_CONFIG.SECURITY; 