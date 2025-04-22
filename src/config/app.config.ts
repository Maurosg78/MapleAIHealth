export interface AppConfig {
  PORT: number;
  NODE_ENV: string;
  ERROR_MESSAGES: {
    NOT_FOUND: string;
    INTERNAL_SERVER_ERROR: string;
  };
}

export const APP_CONFIG: AppConfig = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ERROR_MESSAGES: {
    NOT_FOUND: 'Recurso no encontrado',
    INTERNAL_SERVER_ERROR: 'Error interno del servidor'
  }
}; 