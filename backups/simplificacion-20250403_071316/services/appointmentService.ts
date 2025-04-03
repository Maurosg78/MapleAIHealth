// Servicio appointmentService reconstruido

export interface appointmentServiceOptions {
  id?: string;
}

export class appointmentServiceService {
  async execute(options?: appointmentServiceOptions): Promise<any> {
    console.log('appointmentService ejecutado');
    return { success: true };
  }
}

export const appointmentService = new appointmentServiceService();

// Para archivos index, exportar tipos o funciones necesarias
export * from './types';
