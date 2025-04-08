/**
 * Detector de intenciones para consultas médicas
 * Permite identificar el tipo de consulta para dar formato adecuado a la respuesta
 */

import { EMRData } from './types';

export type MedicalIntent =
  | 'medication'  // Consultas sobre medicamentos
  | 'diagnosis'   // Consultas sobre diagnósticos o síntomas
  | 'followup'    // Consultas sobre seguimiento o controles
  | 'lab'         // Consultas sobre resultados de laboratorio
  | 'referral'    // Consultas sobre derivaciones
  | 'general';    // Consultas generales

/**
 * Detecta la intención médica de una consulta
 * @param query Texto de la consulta del usuario
 * @returns Intención detectada o null si no se puede determinar
 */
export function detectMedicalIntent(query: string): MedicalIntent {
  // Patrones para cada tipo de intención
  const patterns: Record<MedicalIntent, RegExp[]> = {
    medication: [
      /(medicamento|medicina|pastilla|dosis|tratamiento|prescripción)/i,
      /(recetar|prescribir|tomar)/i,
      /(efectos secundarios|interacciones|contraindicaciones)/i
    ],
    diagnosis: [
      /(diagnóstico|síntoma|signo|enfermedad|condición|padecimiento)/i,
      /(dolor|fiebre|malestar|hinchazón|inflamación)/i,
      /(qué tengo|qué puede ser|qué me pasa)/i
    ],
    followup: [
      /(seguimiento|control|revisión|próxima cita|siguiente visita)/i,
      /(seguir|continuar|monitorear|vigilar)/i,
      /(cuándo debo volver|cuando regresar)/i
    ],
    lab: [
      /(laboratorio|análisis|prueba|examen|resultado)/i,
      /(sangre|orina|imagen|radiografía|tomografía|resonancia)/i,
      /(valores normales|rangos|interpretación)/i
    ],
    referral: [
      /(derivación|referencia|especialista|experto)/i,
      /(cardiólogo|neurólogo|dermatólogo|ginecólogo|pediatra)/i,
      /(segunda opinión|consulta especializada)/i
    ],
    general: [
      /(.+)/i // Patrón que captura todo como fallback
    ]
  };

  // Verificar cada patrón
  for (const [intent, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      if (regex.test(query)) {
        return intent as MedicalIntent;
      }
    }
  }

  // Si no se encontró ninguna coincidencia específica
  return 'general';
}

/**
 * Detecta conceptos médicos clave en la consulta
 * @param query Texto de la consulta
 * @returns Lista de conceptos clave identificados
 */
export function extractMedicalConcepts(query: string): string[] {
  const concepts: string[] = [];

  // Patrones para detectar conceptos médicos comunes
  const medicationPattern = /\b(paracetamol|ibuprofeno|aspirina|omeprazol|metformina|enalapril|losartán|simvastatina|amoxicilina|azitromicina)\b/gi;
  const conditionPattern = /\b(diabetes|hipertensión|asma|artritis|depresión|ansiedad|migraña|gastritis|hipotiroidismo|EPOC)\b/gi;
  const symptomPattern = /\b(dolor|fiebre|náuseas|vómitos|diarrea|mareo|fatiga|tos|picazón|sarpullido)\b/gi;

  // Extraer coincidencias
  let match;

  while ((match = medicationPattern.exec(query)) !== null) {
    concepts.push(match[0]);
  }

  while ((match = conditionPattern.exec(query)) !== null) {
    concepts.push(match[0]);
  }

  while ((match = symptomPattern.exec(query)) !== null) {
    concepts.push(match[0]);
  }

  return [...new Set(concepts)]; // Eliminar duplicados
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
