// Archivo OSCARAdapter reconstruido

export interface OSCARAdapterType {
  id: string;
  name?: string;
}

export export function getOSCARAdapter(): OSCARAdapterType {
  return {
    id: crypto.randomUUID(),
  };
}
