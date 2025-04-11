/**
 * Formateador de respuestas de IA para mejorar la presentación
 * según el tipo de intención médica detectada
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIResponse, EMRData } from './types';

/**
 * Formatea la respuesta de IA según la intención detectada
 * @param response Respuesta original de la IA
 * @param intent Intención médica detectada
 * @param patientData Datos del paciente (opcional)
 * @returns Respuesta formateada
 */
export function formatResponse(
  response: AIResponse,
  intent: string | undefined,
  patientData?: EMRData
): AIResponse {
  let formattedResponse = { ...response };

  // Personalización según la intención
  switch (intent) {
    case 'medication':
      formattedResponse = formatMedicationResponse(response, patientData);
      break;
    case 'diagnostic':
      formattedResponse = formatDiagnosticResponse(response, patientData);
      break;
    case 'procedure':
      formattedResponse = formatProcedureResponse(response, patientData);
      break;
    case 'follow-up':
      formattedResponse = formatFollowUpResponse(response, patientData);
      break;
    case 'prevention':
      formattedResponse = formatPreventionResponse(response, patientData);
      break;
    default:
      formattedResponse = formatGeneralResponse(response, patientData);
      break;
  }

  return formattedResponse;
}

/**
 * Destaca advertencias e instrucciones importantes en la respuesta
 * @param response Respuesta a procesar
 * @returns Respuesta con advertencias destacadas
 */
export function highlightWarningsAndInstructions(response: AIResponse): AIResponse {
  // Clonar respuesta para no modificar la original
  const enhancedResponse = { ...response };

  // Procesamiento del resumen para resaltar advertencias
  let summary = response.summary;

  // Patrones para identificar advertencias e instrucciones importantes
  const warningPatterns = [
    /ADVERTENCIA:.*?(?=\.|$)/gi,
    /PRECAUCIÓN:.*?(?=\.|$)/gi,
    /ATENCIÓN:.*?(?=\.|$)/gi,
    /contraindicado.*?(?=\.|$)/gi,
    /no (?:debe|debería|se recomienda).*?(?=\.|$)/gi,
    /evitar.*?(?=\.|$)/gi
  ];

  const instructionPatterns = [
    /INSTRUCCIONES:.*?(?=\.|$)/gi,
    /debe (?:tomar|aplicar|usar).*?(?=\.|$)/gi,
    /es importante (?:que|recordar).*?(?=\.|$)/gi,
    /se recomienda.*?(?=\.|$)/gi
  ];

  // Aplicar resaltado a advertencias
  warningPatterns.forEach(pattern => {
    summary = summary.replace(pattern, match => `⚠️ **${match}**`);
  });

  // Aplicar resaltado a instrucciones
  instructionPatterns.forEach(pattern => {
    summary = summary.replace(pattern, match => `📋 **${match}**`);
  });

  enhancedResponse.summary = summary;

  return enhancedResponse;
}

// Funciones auxiliares para formatear según el tipo de intención

/**
 * Formatea respuesta para consultas sobre medicamentos
 */
function formatMedicationResponse(response: AIResponse, patientData?: EMRData): AIResponse {
  const formattedResponse = { ...response };

  // Añadir título para medicamentos
  formattedResponse.summary = `💊 **INFORMACIÓN DE MEDICAMENTOS**\n\n${response.summary}`;

  // Si hay datos del paciente, verificar alergias e interacciones
  if (patientData && patientData.medicalHistory.allergies.length > 0) {
    formattedResponse.summary += `\n\n⚠️ **ALERGIAS DEL PACIENTE**: ${patientData.medicalHistory.allergies.join(', ')}. Verificar contraindicaciones.`;
  }

  // Organizar recomendaciones específicas para medicamentos
  if (formattedResponse.recommendations) {
    formattedResponse.recommendations = formattedResponse.recommendations.map(rec => {
      if (rec.type === 'medication') {
        return {
          ...rec,
          title: `💊 ${rec.title}`,
          description: `**Medicamento**: ${rec.description}`
        };
      }
      return rec;
    });
  }

  return formattedResponse;
}

/**
 * Formatea respuesta para consultas sobre diagnósticos
 */
function formatDiagnosticResponse(response: AIResponse, _patientData?: EMRData): AIResponse {
  const formattedResponse = { ...response };

  // Añadir título para diagnósticos
  formattedResponse.summary = `🔍 **EVALUACIÓN DIAGNÓSTICA**\n\n${response.summary}`;

  // Organizar insights específicos para diagnósticos
  if (formattedResponse.insights) {
    formattedResponse.insights = formattedResponse.insights.map(insight => {
      if (insight.type === 'clinical-pattern' || insight.type === 'missing-information') {
        return {
          ...insight,
          title: `🔍 ${insight.title}`,
          description: `**Hallazgo**: ${insight.description}`
        };
      }
      return insight;
    });
  }

  return formattedResponse;
}

/**
 * Formatea respuesta para consultas sobre procedimientos
 */
function formatProcedureResponse(response: AIResponse, _patientData?: EMRData): AIResponse {
  const formattedResponse = { ...response };

  // Añadir título para procedimientos
  formattedResponse.summary = `🔬 **INFORMACIÓN DE PROCEDIMIENTO**\n\n${response.summary}`;

  // Añadir estructura temporal si existe
  if (formattedResponse.timeline && formattedResponse.timeline.length > 0) {
    formattedResponse.summary += '\n\n**CRONOLOGÍA DEL PROCEDIMIENTO**:\n';
    formattedResponse.timeline.forEach(event => {
      formattedResponse.summary += `\n• ${event.date}: ${event.title} - ${event.description}`;
    });
  }

  return formattedResponse;
}

/**
 * Formatea respuesta para consultas sobre seguimiento
 */
function formatFollowUpResponse(response: AIResponse, _patientData?: EMRData): AIResponse {
  const formattedResponse = { ...response };

  // Añadir título para seguimiento
  formattedResponse.summary = `📅 **PLAN DE SEGUIMIENTO**\n\n${response.summary}`;

  // Destacar recomendaciones de seguimiento
  if (formattedResponse.recommendations) {
    formattedResponse.recommendations = formattedResponse.recommendations.map(rec => {
      if (rec.type === 'follow-up') {
        return {
          ...rec,
          title: `📅 ${rec.title}`,
          description: `**Seguimiento**: ${rec.description}${rec.timeframe ? ` (${rec.timeframe})` : ''}`
        };
      }
      return rec;
    });
  }

  return formattedResponse;
}

/**
 * Formatea respuesta para consultas sobre prevención
 */
function formatPreventionResponse(response: AIResponse, _patientData?: EMRData): AIResponse {
  const formattedResponse = { ...response };

  // Añadir título para prevención
  formattedResponse.summary = `🛡️ **MEDIDAS PREVENTIVAS**\n\n${response.summary}`;

  // Destacar factores de riesgo si existen
  if (formattedResponse.insights) {
    const riskFactors = formattedResponse.insights.filter(i => i.type === 'risk-factor');
    if (riskFactors.length > 0) {
      formattedResponse.summary += '\n\n**FACTORES DE RIESGO IDENTIFICADOS**:\n';
      riskFactors.forEach(risk => {
        formattedResponse.summary += `\n• ⚠️ ${risk.title}: ${risk.description}`;
      });
    }
  }

  return formattedResponse;
}

/**
 * Formatea respuesta general cuando no se detecta una intención específica
 */
function formatGeneralResponse(response: AIResponse, _patientData?: EMRData): AIResponse {
  const formattedResponse = { ...response };

  // Añadir título general
  formattedResponse.summary = `📋 **INFORMACIÓN MÉDICA**\n\n${response.summary}`;

  return formattedResponse;
}
