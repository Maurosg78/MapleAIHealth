// Exportar interfaces, tipos y adaptadores
export * from './types';
export * from './EMRAdapter';
export * from './EMRAdapterFactory';
export * from './EMRConfigService';

// Exportar implementaciones de adaptadores
export { GenericEMRAdapter } from './implementations/GenericEMRAdapter';
export { EPICAdapter } from './implementations/EPICAdapter';
export { OSCARAdapter } from './implementations/OSCARAdapter';
export { ClinicCloudAdapter } from './implementations/ClinicCloudAdapter';
