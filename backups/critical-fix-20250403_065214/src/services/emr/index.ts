// Exportar interfaces y tipos
export * from './interfaces/EMRAdapter';
export * from './types';

// Exportar fábrica y configuración
export * from './EMRAdapterFactory';
export * from './EMRConfigService';

// Exportar implementaciones
export * from './implementations/GenericEMRAdapter';
export * from './implementations/EPICAdapter';
export * from './implementations/OSCARAdapter';
export * from './implementations/ClinicCloudAdapter';
