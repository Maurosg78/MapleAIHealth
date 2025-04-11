/**
 * Detector de intenciones para consultas médicas
 * Permite identificar el tipo de consulta para dar formato adecuado a la respuesta
 */

import { EMRData, MedicalIntent, MedicalConcept, IntentType, ConceptType } from './types';

// Patrones de intenciones médicas comunes
const INTENT_PATTERNS: Record<IntentType, RegExp[]> = {
  MEDICATION_INFO: [
    /información.*medicamento/i,
    /para qué sirve/i,
    /dosis de/i,
    /efectos secundarios/i,
    /interacciones con/i
  ],
  SYMPTOMS_ANALYSIS: [
    /tengo (.*) síntomas/i,
    /estoy sintiendo/i,
    /me duele/i,
    /siento/i,
    /tengo/i,
    /me preocupa/i
  ],
  TREATMENT_RECOMMENDATION: [
    /recomendación/i,
    /tratamiento/i,
    /qué debo hacer/i,
    /cómo tratar/i,
    /cómo manejar/i
  ],
  DIAGNOSIS_QUERY: [
    /diagnóstico/i,
    /qué tengo/i,
    /qué podría ser/i,
    /qué significa/i,
    /causa de/i
  ],
  PREVENTIVE_CARE: [
    /prevención/i,
    /cómo prevenir/i,
    /reducir el riesgo/i,
    /evitar/i
  ],
  LAB_RESULTS: [
    /resultados de laboratorio/i,
    /qué significan mis resultados/i,
    /interpretación de/i,
    /valores normales/i
  ],
  FOLLOW_UP: [
    /seguimiento/i,
    /cuándo debo volver/i,
    /próxima consulta/i,
    /cita de control/i
  ],
  MEDICAL_PROCEDURE: [
    /procedimiento/i,
    /cirugía/i,
    /operación/i,
    /intervención/i,
    /preparación para/i
  ],
  EMERGENCY_ASSESSMENT: [
    /emergencia/i,
    /urgente/i,
    /grave/i,
    /inmediato/i,
    /ambulancia/i,
    /hospital ahora/i
  ],
  GENERAL_QUERY: []
};

// Patrones para conceptos médicos específicos
const CONCEPT_PATTERNS: Record<ConceptType, RegExp[]> = {
  MEDICATION: [
    /aspirina/i, /paracetamol/i, /ibuprofeno/i, /omeprazol/i, /atorvastatina/i,
    /metformina/i, /losartán/i, /amoxicilina/i, /salbutamol/i, /prednisona/i,
    /insulina/i, /warfarina/i, /levotiroxina/i, /alprazolam/i, /enalapril/i,
    /medicamento/i, /pastilla/i, /cápsula/i, /antibiótico/i, /analgésico/i
  ],
  CONDITION: [
    /diabetes/i, /hipertensión/i, /asma/i, /artritis/i, /depresión/i,
    /ansiedad/i, /cáncer/i, /fibromialgia/i, /migraña/i, /epilepsia/i,
    /alergias/i, /enfermedad cardíaca/i, /enfermedad renal/i, /enfermedad hepática/i,
    /trastorno/i, /síndrome/i, /infección/i, /enfermedad/i
  ],
  ANATOMICAL_LOCATION: [
    /cabeza/i, /cuello/i, /hombro/i, /brazo/i, /codo/i, /muñeca/i, /mano/i,
    /pecho/i, /espalda/i, /abdomen/i, /cadera/i, /pierna/i, /rodilla/i, /tobillo/i,
    /pie/i, /ojo/i, /oído/i, /nariz/i, /boca/i, /diente/i, /garganta/i, /corazón/i,
    /pulmón/i, /estómago/i, /intestino/i, /hígado/i, /riñón/i
  ],
  SYMPTOM: [
    /dolor/i, /fatiga/i, /cansancio/i, /debilidad/i, /mareo/i, /fiebre/i,
    /náusea/i, /vómito/i, /diarrea/i, /estreñimiento/i, /tos/i, /congestión/i,
    /estornudo/i, /picazón/i, /sarpullido/i, /hinchazón/i, /entumecimiento/i,
    /hormigueo/i, /dificultad para respirar/i, /palpitaciones/i, /insomnio/i,
    /dolor de cabeza/i, /visión borrosa/i, /pérdida de apetito/i
  ],
  LAB_TEST: [
    /hemograma/i, /glucosa/i, /colesterol/i, /triglicéridos/i, /hemoglobina/i,
    /creatinina/i, /transaminasas/i, /tiroides/i, /TSH/i, /urea/i, /ácido úrico/i,
    /examen de orina/i, /cultivo/i, /biopsia/i, /radiografía/i, /ecografía/i,
    /tomografía/i, /resonancia/i, /electrocardiograma/i, /endoscopia/i
  ]
};

/**
 * Detecta la intención principal en una consulta médica
 * @param query Consulta del usuario
 * @returns Intención médica detectada
 */
export function detectMedicalIntent(query: string): MedicalIntent {
  // Analizar intenciones por defecto
  let highestMatch: MedicalIntent = {
    type: 'GENERAL_QUERY',
    confidence: 0.5,
    concepts: []
  };

  // Verificar patrones de intenciones
  for (const intentType of Object.keys(INTENT_PATTERNS) as IntentType[]) {
    const patterns = INTENT_PATTERNS[intentType];
    const matches = patterns.filter(pattern => pattern.test(query)).length;
    const confidence = matches > 0 && patterns.length > 0 ? matches / patterns.length : 0;

    if (confidence > 0 && confidence > highestMatch.confidence) {
      highestMatch = {
        type: intentType,
        confidence,
        concepts: []
      };
    }
  }

  // Extraer conceptos médicos
  highestMatch.concepts = extractMedicalConcepts(query);

  return highestMatch;
}

/**
 * Extrae conceptos médicos de una consulta
 * @param query Consulta del usuario
 * @returns Lista de conceptos médicos identificados
 */
function extractMedicalConcepts(query: string): MedicalConcept[] {
  const concepts: MedicalConcept[] = [];

  // Buscar coincidencias para cada tipo de concepto
  for (const conceptType of Object.keys(CONCEPT_PATTERNS) as ConceptType[]) {
    const patterns = CONCEPT_PATTERNS[conceptType];
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[0]) {
        concepts.push({
          type: conceptType,
          value: match[0].trim(),
          position: match.index || 0
        });
      }
    }
  }

  // Ordenar por posición para preservar el contexto
  return concepts.sort((a, b) => a.position - b.position);
}

/**
 * Determina si una consulta parece ser una emergencia médica
 * @param intent Intención médica detectada
 * @returns true si parece una emergencia
 */
export function isPotentialEmergency(intent: MedicalIntent): boolean {
  if (intent.type === 'EMERGENCY_ASSESSMENT') {
    return intent.confidence > 0.6;
  }

  // Palabras clave que podrían indicar una emergencia
  const emergencyKeywords = [
    /dolor intenso en el pecho/i,
    /no puedo respirar/i,
    /ataque/i,
    /convulsión/i,
    /inconsciente/i,
    /hemorragia severa/i,
    /sangrado que no para/i,
    /accidente/i,
    /golpe fuerte en la cabeza/i,
    /envenena/i,
    /suicid/i,
    /trauma/i
  ];

  // Verificar si hay conceptos de emergencia
  const queryText = intent.concepts.map(c => c.value).join(' ');
  return emergencyKeywords.some(keyword => keyword.test(queryText));
}

/**
 * Analiza qué tipo de información está solicitando el usuario
 * @param intent Intención médica detectada
 * @returns Tipo de información requerida
 */
export function determineInformationNeeds(intent: MedicalIntent): string[] {
  const needs: string[] = [];

  switch (intent.type) {
    case 'MEDICATION_INFO':
      needs.push('dosificación', 'efectos secundarios', 'interacciones');
      break;
    case 'SYMPTOMS_ANALYSIS':
      needs.push('posibles causas', 'recomendaciones', 'señales de alarma');
      break;
    case 'TREATMENT_RECOMMENDATION':
      needs.push('opciones de tratamiento', 'efectividad', 'duración');
      break;
    case 'DIAGNOSIS_QUERY':
      needs.push('diagnóstico diferencial', 'pruebas recomendadas');
      break;
    case 'PREVENTIVE_CARE':
      needs.push('medidas preventivas', 'factores de riesgo');
      break;
    case 'LAB_RESULTS':
      needs.push('interpretación', 'valores normales', 'seguimiento');
      break;
    case 'MEDICAL_PROCEDURE':
      needs.push('descripción del procedimiento', 'preparación', 'recuperación');
      break;
    default:
      needs.push('información general');
  }

  return needs;
}

/**
 * Mejora la consulta añadiendo contexto del paciente
 * @param query Consulta original
 * @param patientData Datos del paciente
 * @returns Consulta mejorada con contexto
 */
export function enhanceQueryWithContext(query: string, patientData?: EMRData): string {
  if (!patientData) return query;

  // Extraer datos relevantes del paciente para enriquecer la consulta
  const enhancedQuery = `[Contexto: Paciente de ${patientData.demographics.age} años, ${patientData.demographics.sex}.
Condiciones: ${patientData.medicalHistory.conditions.join(', ')}.
Alergias: ${patientData.medicalHistory.allergies.join(', ')}.
Medicamentos actuales: ${patientData.medicalHistory.medications.filter(m => m.active).map(m => m.name).join(', ')}]
${query}`;

  return enhancedQuery;
}
