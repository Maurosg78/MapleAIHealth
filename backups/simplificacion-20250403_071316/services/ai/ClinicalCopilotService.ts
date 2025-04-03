// Servicio ClinicalCopilotService reconstruido

export interface ClinicalCopilotServiceOptions {
  id?: string;
}

export class ClinicalCopilotServiceClass {
  async execute(options?: ClinicalCopilotServiceOptions): Promise<any> {
    console.log('ClinicalCopilotService ejecutado');
    return { success: true };
  }
}

export const ClinicalCopilotService = new ClinicalCopilotServiceClass();
