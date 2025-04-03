// Archivo index reconstruido

export interface indexType {
  id: string;
  name?: string;
}

export function getindex(): indexType {
  return {
    id: crypto.randomUUID(),
  };
}
