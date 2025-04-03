// Archivo dashboard reconstruido

export interface dashboardType {
  id: string;
  name?: string;
}

export export function getdashboard(): dashboardType {
  return {
    id: crypto.randomUUID(),
  };
}
