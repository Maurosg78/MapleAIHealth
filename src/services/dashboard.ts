import logger from '../services/logger';
import { DashboardMetrics, ClinicalDashboardData } from '../types/dashboard';

// Simulación de API para entorno de desarrollo
const api = {
  get: async <T>(url: string): Promise<{ data: T }> => {
    // Simulamos una respuesta de API
    // En un entorno real, esto sería una llamada a una API HTTP
    logger.debug(`Simulando petición GET a ${url}`);

    // Simulamos un retraso de red
    await new Promise( => setTimeout);

    // Para propósitos de prueba, lanzamos un error en la llamada a datos clínicos
    // para mostrar el funcionamiento de los datos de respaldo
    if (url === '/dashboard/clinical') {
      throw new Error('API no disponible para datos clínicos');
    }

    // Para otras URLs, devolvemos un objeto vacío que será manejado en cada método
    return { data: {} as T };
  },
};

export const dashboardService = {
  /**
   * Obtiene las métricas generales del dashboard
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get<DashboardMetrics>('/dashboard/metrics');
      return response.data;
    } catch (err) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    
    }
  },

  /**
   * Obtiene la puntuación de salud del sistema
   */
  async getHealthScore(): Promise<number> {
    try {
      const response = await api.get<{ score: number }>(
        '/dashboard/health-score'
    null
  );
      return response.data.score;
    } catch (err) {
      console.error('Error fetching health score:', error);
      throw error;
    
    }
  },

  /**
   * Obtiene el historial de actividad
   */
  async getActivityHistory(): Promise<Array<{ date: string; value: number }>> {
    try {
      const response = await api.get<Array<{ date: string; value: number }>>(
        '/dashboard/activity-history'
    null
  );
      return response.data;
    } catch (err) {
      console.error('Error fetching activity history:', error);
      throw error;
    
    }
  },

  /**
   * Obtiene los datos para el Dashboard de Información Clínica
   */
  async getClinicalDashboardData(): Promise<ClinicalDashboardData> {
    try {
      // En un entorno real, esto obtendría datos del backend
      // Para esta implementación, usamos datos simulados
      const response = await api.get<ClinicalDashboardData>(
        '/dashboard/clinical'
    null
  );
      return response.data;
    } catch (err) {
      console.error('Error fetching clinical dashboard data:', error);

      // Si la API falla, usamos datos de respaldo simulados
      return this.getSimulatedClinicalData();
    
    }
  },

  /**
   * Genera datos simulados para el Dashboard Clínico
   * Esto es solo para desarrollo, en producción se usarían datos reales de la API
   */
  getSimulatedClinicalData(): ClinicalDashboardData {
    return {
      evidenceSummary: {
        totalEvaluations: 1248,
        byLevel: {
          A: 341,
          B: 527,
          C: 298,
          D: 82,
        },
        averageConfidenceScore: 76,
      },
      recentEvaluations: [
        {
          id: 'ev-001',
          content:
            'Uso de estatinas en pacientes con hipercolesterolemia familiar',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          evidenceLevel: 'A',
          confidenceScore: 92,
          sources: 7,
        },
        {
          id: 'ev-002',
          content:
            'Tratamiento de infecciones urinarias recurrentes con probióticos',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          evidenceLevel: 'B',
          confidenceScore: 78,
          sources: 4,
        },
        {
          id: 'ev-003',
          content: 'Uso de suplementos de vitamina D en adultos mayores',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          evidenceLevel: 'C',
          confidenceScore: 65,
          sources: 3,
        },
        {
          id: 'ev-004',
          content:
            'Eficacia de la acupuntura en el tratamiento del dolor crónico',
          timestamp: new Date(Date.now() - 28800000).toISOString(),
          evidenceLevel: 'D',
          confidenceScore: 42,
          sources: 2,
        },
        {
          id: 'ev-005',
          content:
            'Beneficios del ejercicio aeróbico en pacientes con diabetes tipo 2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          evidenceLevel: 'A',
          confidenceScore: 95,
          sources: 8,
        },
      ],
      topMedicalTopics: [
        { name: 'Hipertensión', count: 142, averageEvidenceLevel: 'A' },
        { name: 'Diabetes', count: 118, averageEvidenceLevel: 'A' },
        { name: 'COVID-19', count: 98, averageEvidenceLevel: 'B' },
        { name: 'Alzheimer', count: 87, averageEvidenceLevel: 'B' },
        { name: 'Cáncer de mama', count: 76, averageEvidenceLevel: 'A' },
      ],
      sourceVerifications: {
        verified: 856,
        unverified: 143,
        pending: 67,
        byDatabase: [
          { name: 'PubMed', count: 423 },
          { name: 'Cochrane', count: 287 },
          { name: 'WHO', count: 112 },
          { name: 'MedlinePlus', count: 76 },
          { name: 'Otros', count: 91 },
        ],
      },
    };
  },
};
