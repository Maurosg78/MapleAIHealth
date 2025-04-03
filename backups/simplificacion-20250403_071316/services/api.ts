// Archivo api reconstruido

export interface apiType {
  id: string;
  name?: string;
}

export export function getapi(): apiType {
  return {
    id: crypto.randomUUID(),
  };
}
