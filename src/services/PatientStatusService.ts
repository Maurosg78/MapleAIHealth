/**
 * Servicio para determinar el estado de los pacientes (nuevo o recurrente)
 * 
 * En un entorno real, este servicio se conectaría con una base de datos
 * para verificar el historial previo del paciente. Por ahora, simula esa funcionalidad.
 */

interface PatientHistory {
  id: string;
  lastVisitDate?: Date;
  visitCount: number;
  diagnosisCodes: string[];
}

interface NewPatientCheckResult {
  isNew: boolean;
  isNewForCondition: boolean;
  lastVisitInfo?: {
    date: Date;
    diagnosisCodes: string[];
  };
  suggestedAction: 'new_record' | 'continue_existing' | 'create_new_episode';
}

// Simulación de una base de datos de pacientes
const mockPatientDatabase: Record<string, PatientHistory> = {
  'P12345': {
    id: 'P12345',
    lastVisitDate: new Date('2023-10-15'),
    visitCount: 8,
    diagnosisCodes: ['M54.5', 'I10']  // Lumbalgia, Hipertensión
  },
  'P67890': {
    id: 'P67890',
    lastVisitDate: new Date('2023-11-30'),
    visitCount: 3,
    diagnosisCodes: ['J45.909', 'J30.1']  // Asma, Rinitis alérgica
  },
  'P11111': {
    id: 'P11111',
    lastVisitDate: new Date('2022-05-22'),
    visitCount: 1,
    diagnosisCodes: ['Z00.00']  // Examen general
  }
};

class PatientStatusService {
  /**
   * Verifica si un paciente es nuevo en general o nuevo para una condición específica
   * 
   * @param patientId ID del paciente a verificar
   * @param currentDiagnosisCodes Códigos de diagnóstico actuales (opcionales)
   * @returns Resultado de la verificación
   */
  async checkPatientStatus(
    patientId: string,
    currentDiagnosisCodes?: string[]
  ): Promise<NewPatientCheckResult> {
    // En un entorno real, esto sería una consulta a la base de datos
    // Para esta simulación, verificamos contra la base de datos mock
    const patientRecord = mockPatientDatabase[patientId];
    
    // Si no hay registro, es un paciente nuevo
    if (!patientRecord) {
      return {
        isNew: true,
        isNewForCondition: true,
        suggestedAction: 'new_record'
      };
    }
    
    // Paciente existente: verificar si la condición actual es nueva
    let isNewForCondition = true;
    
    if (currentDiagnosisCodes && currentDiagnosisCodes.length > 0) {
      // Verificar si hay algún diagnóstico en común con el historial
      isNewForCondition = !currentDiagnosisCodes.some(code => 
        patientRecord.diagnosisCodes.includes(code)
      );
    }
    
    return {
      isNew: false,
      isNewForCondition,
      lastVisitInfo: {
        date: patientRecord.lastVisitDate || new Date(),
        diagnosisCodes: patientRecord.diagnosisCodes
      },
      suggestedAction: isNewForCondition ? 'create_new_episode' : 'continue_existing'
    };
  }
  
  /**
   * Obtiene información sugerida del historial previo relevante
   * 
   * @param patientId ID del paciente
   * @param relevantDiagnoses Diagnósticos relevantes a considerar
   * @returns Información del historial que podría ser útil para la consulta actual
   */
  async getSuggestedHistoryItems(
    patientId: string,
    relevantDiagnoses?: string[]
  ): Promise<string[]> {
    const patientRecord = mockPatientDatabase[patientId];
    
    if (!patientRecord) {
      return ["No hay historial previo disponible para este paciente."];
    }
    
    const suggestions: string[] = [];
    
    // Recomendaciones basadas en el historial
    if (patientRecord.visitCount > 5) {
      suggestions.push("Paciente frecuente: Revisar patrón de uso del servicio.");
    }
    
    // Verificar diagnósticos relevantes
    if (relevantDiagnoses && relevantDiagnoses.length > 0) {
      const hasRelevantHistoryDiagnosis = relevantDiagnoses.some(code => 
        patientRecord.diagnosisCodes.includes(code)
      );
      
      if (hasRelevantHistoryDiagnosis) {
        suggestions.push("Hay diagnósticos previos relacionados: Considerar revisar tratamientos anteriores y su efectividad.");
      }
    }
    
    // Verificar tiempo desde la última visita
    const today = new Date();
    const lastVisit = patientRecord.lastVisitDate || today;
    const daysSinceLastVisit = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit < 14) {
      suggestions.push(`Visita reciente: Última consulta hace ${daysSinceLastVisit} días. Verificar evolución desde entonces.`);
    } else if (daysSinceLastVisit > 365) {
      suggestions.push(`Ha pasado más de un año desde la última visita. Considerar una evaluación integral.`);
    }
    
    return suggestions.length > 0 ? suggestions : ["No hay sugerencias específicas para este paciente."];
  }
  
  /**
   * Marca un paciente como nuevo para una condición específica
   * 
   * @param patientId ID del paciente
   * @param diagnosisCodes Códigos de diagnóstico a registrar
   * @returns Confirmación de la operación
   */
  async markAsNewEpisode(
    patientId: string,
    diagnosisCodes: string[]
  ): Promise<{success: boolean, patientId: string, episodeId: string}> {
    // En un entorno real, esto crearía un nuevo episodio en la base de datos
    // Para esta simulación, solo devolvemos un resultado exitoso
    
    return {
      success: true,
      patientId,
      episodeId: `EP-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    };
  }
}

export const patientStatusService = new PatientStatusService();

export default patientStatusService; 