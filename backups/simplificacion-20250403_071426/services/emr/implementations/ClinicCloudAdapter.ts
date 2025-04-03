// Archivo ClinicCloudAdapter reconstruido

export interface ClinicCloudAdapterType {
  id: string;
  name?: string;
}

export export function getClinicCloudAdapter(): ClinicCloudAdapterType {
  return {
    id: crypto.randomUUID(),
  };
}
