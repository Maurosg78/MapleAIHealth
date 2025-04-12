/**
 * Servicio de Detección de Puntos Ciegos Clínicos
 * 
 * ADVERTENCIA DE SEGURIDAD MÉDICA - PRIORIDAD ALTA
 * Este servicio NO REEMPLAZA el juicio clínico del profesional médico
 * Solo identifica posibles puntos ciegos y documenta recomendaciones
 * basadas en guías clínicas y estándares de práctica médica.
 */

// Tipo para representar un punto ciego clínico
export interface ClinicalBlindSpot {
  id: string;
  category: 'anamnesis' | 'examen_fisico' | 'diagnostico' | 'tratamiento' | 'seguimiento';
  description: string;
  importance: 'alta' | 'media' | 'baja';
  clinicalEvidence?: {
    guidelineSource: string;
    evidenceLevel: string;
    recommendation: string;
  };
  legalImplication: string;
}

// Tipo para la solicitud de verificación
export interface VerificationRequest {
  patientInfo?: {
    age?: number;
    gender?: string;
    id?: string;
  };
  primaryComplaint?: string;
  clinicalHistory?: {
    currentIllness?: string;
    medicalHistory?: string[];
    medicationHistory?: string[];
    allergies?: string[];
    functionalStatus?: string;
  };
  physicalExamination?: {
    generalAppearance?: string;
    vitalSigns?: Record<string, string>;
    musculoskeletal?: Record<string, string>;
    neurological?: string;
  };
  diagnosticStudies?: {
    performed?: string[];
    pending?: string[];
  };
  medicalPlan?: {
    referral?: string;
    pendingDiagnosis?: string[];
    requestedTreatment?: string;
  };
}

// Tipo para la respuesta de verificación
export interface VerificationResponse {
  blindSpots: ClinicalBlindSpot[];
  requiredFields: string[];
  recommendedFields: string[];
  legalProtectionScore: number; // 0-100, indica el nivel de protección legal
  legalProtectionSummary: string;
  verificationTimestamp: string;
  verificationId: string;
}

class ClinicalBlindSpotService {
  /**
   * Verifica un caso clínico y detecta posibles puntos ciegos
   * @param caseData Datos del caso clínico a verificar
   * @returns Respuesta con puntos ciegos identificados y recomendaciones
   */
  async verifyCase(caseData: VerificationRequest): Promise<VerificationResponse> {
    const missingRequiredFields: string[] = [];
    const recommendedFields: string[] = [];
    const blindSpots: ClinicalBlindSpot[] = [];
    
    // Verificar campos requeridos (información básica)
    this.verifyRequiredFields(caseData, missingRequiredFields);
    
    // Verificar campos recomendados según contexto clínico
    this.verifyRecommendedFields(caseData, recommendedFields);
    
    // Identificar puntos ciegos específicos
    this.identifyBlindSpots(caseData, blindSpots);
    
    // Calcular puntuación de protección legal
    const legalProtectionScore = this.calculateLegalProtectionScore(
      missingRequiredFields,
      recommendedFields,
      blindSpots
    );
    
    // Generar resumen de protección legal
    const legalProtectionSummary = this.generateLegalProtectionSummary(
      legalProtectionScore,
      missingRequiredFields,
      blindSpots
    );
    
    return {
      blindSpots,
      requiredFields: missingRequiredFields,
      recommendedFields,
      legalProtectionScore,
      legalProtectionSummary,
      verificationTimestamp: new Date().toISOString(),
      verificationId: `VER-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    };
  }
  
  /**
   * Verifica que todos los campos obligatorios estén presentes
   */
  private verifyRequiredFields(caseData: VerificationRequest, missingFields: string[]): void {
    // Datos del paciente
    if (!caseData.patientInfo?.id) missingFields.push("ID del paciente");
    if (!caseData.patientInfo?.age) missingFields.push("edad del paciente");
    if (!caseData.patientInfo?.gender) missingFields.push("género del paciente");
    if (!caseData.primaryComplaint) missingFields.push("motivo de consulta");
    
    // Historia clínica
    if (!caseData.clinicalHistory?.currentIllness) missingFields.push("descripción de la enfermedad actual");
    if (!caseData.clinicalHistory?.medicalHistory?.length) missingFields.push("antecedentes médicos");
    if (!caseData.clinicalHistory?.functionalStatus) missingFields.push("estado funcional del paciente");
    
    // Examen físico
    if (!caseData.physicalExamination?.generalAppearance) missingFields.push("descripción de apariencia general");
    if (!caseData.physicalExamination?.vitalSigns?.bloodPressure) missingFields.push("presión arterial");
    if (!caseData.physicalExamination?.vitalSigns?.heartRate) missingFields.push("frecuencia cardíaca");
    if (!caseData.physicalExamination?.musculoskeletal) missingFields.push("examen musculoesquelético");
    if (!caseData.physicalExamination?.neurological) missingFields.push("examen neurológico");
    
    // Plan médico
    if (!caseData.medicalPlan?.pendingDiagnosis?.length) missingFields.push("diagnósticos diferenciales");
    if (!caseData.medicalPlan?.requestedTreatment) missingFields.push("plan de tratamiento");
  }
  
  /**
   * Verifica campos recomendados según el contexto clínico específico
   */
  private verifyRecommendedFields(caseData: VerificationRequest, recommendedFields: string[]): void {
    // Verificación contextual basada en el motivo de consulta
    if (caseData.primaryComplaint) {
      const complaint = caseData.primaryComplaint.toLowerCase();
      
      // Ejemplos de verificaciones contextuales
      if (complaint.includes("dolor") && !caseData.clinicalHistory?.currentIllness?.toLowerCase().includes("escala de dolor")) {
        recommendedFields.push("evaluación de intensidad del dolor (escala numérica o EVA)");
      }
      
      if (complaint.includes("caída") && !caseData.clinicalHistory?.currentIllness?.toLowerCase().includes("mecanismo")) {
        recommendedFields.push("mecanismo y circunstancias de la caída");
      }
      
      if ((complaint.includes("dolor") && complaint.includes("lumbar")) || 
          complaint.includes("espalda")) {
        if (!caseData.physicalExamination?.musculoskeletal?.specialTests?.includes("SLR") &&
            !caseData.physicalExamination?.musculoskeletal?.specialTests?.includes("Lasègue")) {
          recommendedFields.push("prueba de Lasègue o SLR para evaluación radicular");
        }
      }
      
      // Recomendaciones basadas en síntomas articulares
      if (complaint.includes("articular") || complaint.includes("artritis")) {
        if (!caseData.diagnosticStudies?.performed?.some(s => s.includes("PCR") || s.includes("proteína C reactiva"))) {
          recommendedFields.push("niveles de PCR (proteína C reactiva)");
        }
        if (!caseData.diagnosticStudies?.performed?.some(s => s.includes("VSG") || s.includes("eritrosedimentación"))) {
          recommendedFields.push("VSG (velocidad de eritrosedimentación)");
        }
      }
    }
  }
  
  /**
   * Identifica puntos ciegos específicos según el caso
   */
  private identifyBlindSpots(caseData: VerificationRequest, blindSpots: ClinicalBlindSpot[]): void {
    // Revisar medicación actual contra alergias
    if (caseData.clinicalHistory?.medicationHistory && 
        caseData.clinicalHistory.allergies) {
      // Esta es una verificación básica. En un sistema real, habría una base de datos
      // de medicamentos y alergias para hacer validaciones más precisas
    }
    
    // Verificar banderas rojas no abordadas
    if (caseData.primaryComplaint?.toLowerCase().includes("dolor")) {
      if (!caseData.clinicalHistory?.currentIllness?.toLowerCase().includes("bandera")) {
        blindSpots.push({
          id: `BS-${Date.now()}-1`,
          category: 'anamnesis',
          description: 'No se documenta evaluación de banderas rojas para el dolor reportado',
          importance: 'alta',
          clinicalEvidence: {
            guidelineSource: 'Guías de Buena Práctica Clínica',
            evidenceLevel: 'A',
            recommendation: 'Todo paciente con dolor debe ser evaluado para banderas rojas (señales de alarma)'
          },
          legalImplication: 'La falta de evaluación de banderas rojas puede considerarse negligencia si se pasa por alto una patología grave'
        });
      }
    }
    
    // Puntos ciegos en seguimiento
    if (caseData.medicalPlan?.requestedTreatment && 
        !caseData.medicalPlan.requestedTreatment.toLowerCase().includes("seguimiento")) {
      blindSpots.push({
        id: `BS-${Date.now()}-2`,
        category: 'seguimiento',
        description: 'No se documenta un plan claro de seguimiento',
        importance: 'media',
        clinicalEvidence: {
          guidelineSource: 'Estándares de Documentación Clínica',
          evidenceLevel: 'B',
          recommendation: 'Todo plan de tratamiento debe incluir criterios y plazos de seguimiento'
        },
        legalImplication: 'Un seguimiento inadecuado puede considerarse abandono del paciente en caso de complicaciones'
      });
    }
    
    // Verificar si hay diagnósticos considerados pero sin plan diagnóstico
    if (caseData.medicalPlan?.pendingDiagnosis && 
        caseData.medicalPlan.pendingDiagnosis.length > 0 && 
        (!caseData.diagnosticStudies?.pending || caseData.diagnosticStudies.pending.length === 0)) {
      blindSpots.push({
        id: `BS-${Date.now()}-3`,
        category: 'diagnostico',
        description: 'Diagnósticos diferenciales sin plan diagnóstico definido',
        importance: 'alta',
        legalImplication: 'La falta de un plan diagnóstico estructurado puede constituir negligencia en caso de complicaciones'
      });
    }
  }
  
  /**
   * Calcula la puntuación de protección legal basada en la completitud de la documentación
   */
  private calculateLegalProtectionScore(
    missingRequiredFields: string[],
    recommendedFields: string[],
    blindSpots: ClinicalBlindSpot[]
  ): number {
    let score = 100; // Puntuación inicial perfecta
    
    // Restar por campos obligatorios faltantes
    score -= missingRequiredFields.length * 8;
    
    // Restar por campos recomendados faltantes (menor impacto)
    score -= recommendedFields.length * 3;
    
    // Restar por puntos ciegos identificados según su importancia
    for (const blindSpot of blindSpots) {
      if (blindSpot.importance === 'alta') score -= 7;
      else if (blindSpot.importance === 'media') score -= 4;
      else score -= 2;
    }
    
    // Asegurar que el puntaje esté en el rango 0-100
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Genera un resumen de la protección legal proporcionada por la documentación
   */
  private generateLegalProtectionSummary(
    score: number, 
    missingFields: string[], 
    blindSpots: ClinicalBlindSpot[]
  ): string {
    // Evaluar el nivel de protección
    let protectionLevel = 'insuficiente';
    if (score >= 90) protectionLevel = 'excelente';
    else if (score >= 80) protectionLevel = 'bueno';
    else if (score >= 65) protectionLevel = 'aceptable';
    else if (score >= 50) protectionLevel = 'marginal';
    
    // Construir mensaje base
    let summary = `La documentación clínica proporciona un nivel de protección legal ${protectionLevel} (${score}/100).`;
    
    // Añadir detalles según el nivel
    if (score < 50) {
      summary += ' La documentación tiene deficiencias críticas que podrían constituir negligencia médica.';
    } else if (score < 65) {
      summary += ' La documentación tiene deficiencias importantes que deberían corregirse.';
    } else if (score < 80) {
      summary += ' La documentación cumple con los estándares mínimos pero tiene áreas de mejora.';
    } else if (score < 90) {
      summary += ' La documentación cumple con los estándares de práctica adecuados.';
    } else {
      summary += ' La documentación cumple con altos estándares de calidad y ofrece protección legal óptima.';
    }
    
    // Añadir recomendaciones específicas si es necesario
    if (missingFields.length > 0 || blindSpots.length > 0) {
      summary += ' Se recomienda abordar las deficiencias identificadas para mejorar la protección legal.';
    }
    
    return summary;
  }
  
  /**
   * Genera un documento PDF o JSON que sirve como registro legal de la verificación
   * Esta función sería implementada con una biblioteca de generación de PDF
   * o integración con un sistema de registros médicos electrónicos
   */
  async generateLegalDocumentation(
    caseData: VerificationRequest,
    verification: VerificationResponse
  ): Promise<string> {
    // En un sistema real, esto generaría un documento PDF o un registro en el EMR
    // Para esta simulación, solo retornamos un identificador del documento
    return `DOC-${verification.verificationId}`;
  }
}

export const clinicalBlindSpotService = new ClinicalBlindSpotService();

export default clinicalBlindSpotService; 