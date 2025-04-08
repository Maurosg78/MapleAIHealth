/**
 * Formateador de respuestas de IA para mejorar la presentación
 * según el tipo de intención médica detectada
 */

import { AIResponse, EMRData } from './types';
import { MedicalIntent } from './intentDetector';

/**
 * Formatea la respuesta de IA según la intención detectada
 * @param response Respuesta original de la IA
 * @param intent Intención médica detectada
 * @param patientData Datos del paciente (opcional)
 * @returns Respuesta formateada
 */
export function formatResponse(
  response: AIResponse,
  intent: MedicalIntent,
  patientData?: EMRData
): AIResponse {
  // Crear una copia para no modificar el original
  const formattedResponse = { ...response };

  // Modificar el formato según la intención
  switch (intent) {
    case 'medication':
      formattedResponse.summary = formatMedicationResponse(response.summary, patientData);
      break;
    case 'diagnosis':
      formattedResponse.summary = formatDiagnosisResponse(response.summary, patientData);
      break;
    case 'followup':
      formattedResponse.summary = formatFollowupResponse(response.summary);
      break;
    case 'lab':
      formattedResponse.summary = formatLabResponse(response.summary);
      break;
    case 'referral':
      formattedResponse.summary = formatReferralResponse(response.summary);
      break;
    default:
      // Mantener el formato original para consultas generales
      break;
  }

  return formattedResponse;
}

/**
 * Formatea respuestas sobre medicamentos
 */
function formatMedicationResponse(summary: string, patientData?: EMRData): string {
  // Extraer alergias del paciente si están disponibles
  const allergies = patientData?.medicalHistory.allergies || [];
  const allergiesWarning = allergies.length > 0
    ? `\n\n⚠️ **PRECAUCIÓN DE ALERGIAS**: El paciente tiene registradas las siguientes alergias: ${allergies.join(', ')}.`
    : '';

  // Extraer medicamentos actuales si están disponibles
  const currentMedications = patientData?.medicalHistory.medications
    .filter(m => m.active)
    .map(m => m.name) || [];
  const medicationsWarning = currentMedications.length > 0
    ? `\n\n⚠️ **MEDICAMENTOS ACTUALES**: El paciente está tomando: ${currentMedications.join(', ')}.`
    : '';

  return `## 💊 INFORMACIÓN DE MEDICAMENTO\n\n${summary}${allergiesWarning}${medicationsWarning}`;
}

/**
 * Formatea respuestas sobre diagnósticos
 */
function formatDiagnosisResponse(summary: string, patientData?: EMRData): string {
  // Extraer condiciones existentes si están disponibles
  const conditions = patientData?.medicalHistory.conditions || [];
  const conditionsContext = conditions.length > 0
    ? `\n\n📋 **HISTORIAL MÉDICO RELEVANTE**: ${conditions.join(', ')}.`
    : '';

  return `## 🩺 SUGERENCIA DIAGNÓSTICA\n\n${summary}${conditionsContext}`;
}

/**
 * Formatea respuestas sobre seguimiento
 */
function formatFollowupResponse(summary: string): string {
  return `## 📅 PLAN DE SEGUIMIENTO\n\n${summary}`;
}

/**
 * Formatea respuestas sobre resultados de laboratorio
 */
function formatLabResponse(summary: string): string {
  return `## 🧪 INTERPRETACIÓN DE RESULTADOS\n\n${summary}`;
}

/**
 * Formatea respuestas sobre derivaciones
 */
function formatReferralResponse(summary: string): string {
  return `## 👩‍⚕️ DERIVACIÓN A ESPECIALISTA\n\n${summary}`;
}

/**
 * Detecta si la respuesta contiene instrucciones o advertencias importantes
 * y las resalta
 * @param response Respuesta de IA
 * @returns Respuesta con advertencias destacadas
 */
export function highlightWarningsAndInstructions(response: AIResponse): AIResponse {
  const updatedResponse = { ...response };

  // Patrones para detectar advertencias e instrucciones
  const warningPatterns = [
    /precaución/i,
    /advertencia/i,
    /cuidado/i,
    /peligro/i,
    /contraindicación/i,
    /no (debe|debería|puede|recomendado)/i
  ];

  const instructionPatterns = [
    /debe[n]? (tomar|aplicar|usar)/i,
    /es importante/i,
    /es necesario/i,
    /es recomendable/i,
    /tiene[n]? que/i
  ];

  let summary = response.summary;

  // Resaltar advertencias
  warningPatterns.forEach(pattern => {
    summary = summary.replace(pattern, match => `⚠️ **${match.toUpperCase()}**`);
  });

  // Resaltar instrucciones
  instructionPatterns.forEach(pattern => {
    summary = summary.replace(pattern, match => `✅ **${match}**`);
  });

  updatedResponse.summary = summary;
  return updatedResponse;
}
