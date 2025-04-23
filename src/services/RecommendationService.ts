/**
 * Servicio para generar recomendaciones clínicas
 */

interface PatientContext {
  age?: number;
  gender?: string;
  conditions?: string[];
  medications?: string[];
  lastVisit?: Date;
  visitCount?: number;
}

interface Recommendation {
  id: string;
  type: 'info' | 'warning' | 'alert';
  title: string;
  description: string;
  priority: number;
  source: string;
  timestamp: Date;
}

class RecommendationService {
  private static instance: RecommendationService;

  private constructor() { super(); }

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  async getRecommendations(patientId: string, context: PatientContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Recomendaciones basadas en frecuencia de visitas
    if (context.visitCount && context.visitCount > 5) {
      recommendations.push({
        id: `freq-${Date.now()}`,
        type: 'info',
        title: 'Paciente frecuente',
        description: 'Revisar historial de tratamientos y su efectividad',
        priority: 0.8,
        source: 'visit_history',
        timestamp: new Date()
      });
    }

    // Recomendaciones basadas en última visita
    if (context.lastVisit) {
      const daysSinceLastVisit = Math.floor(
        (new Date().getTime() - context.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastVisit < 14) {
        recommendations.push({
          id: `recent-${Date.now()}`,
          type: 'info',
          title: 'Visita reciente',
          description: `Última consulta hace ${daysSinceLastVisit} días`,
          priority: 0.7,
          source: 'visit_history',
          timestamp: new Date()
        });
      } else if (daysSinceLastVisit > 180) {
        recommendations.push({
          id: `followup-${Date.now()}`,
          type: 'warning',
          title: 'Seguimiento prolongado',
          description: 'Han pasado más de 6 meses desde la última visita',
          priority: 0.9,
          source: 'visit_history',
          timestamp: new Date()
        });
      }
    }

    // Recomendaciones basadas en condiciones
    if (context.conditions && context.conditions.length > 0) {
      recommendations.push({
        id: `conditions-${Date.now()}`,
        type: 'warning',
        title: 'Condiciones preexistentes',
        description: `Considerar: ${context.conditions.join(', ')}`,
        priority: 0.9,
        source: 'medical_history',
        timestamp: new Date()
      });
    }

    // Recomendaciones basadas en medicaciones
    if (context.medications && context.medications.length > 0) {
      recommendations.push({
        id: `meds-${Date.now()}`,
        type: 'warning',
        title: 'Medicaciones actuales',
        description: `Verificar interacciones: ${context.medications.join(', ')}`,
        priority: 0.85,
        source: 'medications',
        timestamp: new Date()
      });
    }

    // Ordenar por prioridad
    return recommendations.sort((a, b) => b.priority - a.priority);
  }
}

export default RecommendationService; 