// Archivo api reconstruido

export interface apiType {
  id: string;
  name?: string;
}

export function getapi(): apiType {
  return {
    id: crypto.randomUUID(),
  };
}
