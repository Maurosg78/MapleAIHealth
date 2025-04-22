import { User } from '../../models/User';
import { Patient } from '../../models/Patient';

export type InteractionType = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'search'
  | 'filter'
  | 'sort'
  | 'export'
  | 'print'
  | 'ai_assist';

export interface Interaction {
  id: string;
  userId: string;
  timestamp: Date;
  type: InteractionType;
  module: string;
  action: string;
  details: {
    patientId?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  };
  duration?: number;
  success: boolean;
  errorDetails?: string;
}

class InteractionService {
  private static instance: InteractionService;
  private interactions: Interaction[] = [];

  private constructor() {}

  static getInstance(): InteractionService {
    if (!InteractionService.instance) {
      InteractionService.instance = new InteractionService();
    }
    return InteractionService.instance;
  }

  async logInteraction(
    user: User,
    type: InteractionType,
    module: string,
    action: string,
    details: Interaction['details'],
    success: boolean = true,
    errorDetails?: string
  ): Promise<void> {
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      timestamp: new Date(),
      type,
      module,
      action,
      details,
      success,
      errorDetails
    };

    this.interactions.push(interaction);

    try {
      // Aquí iría la lógica para guardar en base de datos
      await this.saveInteraction(interaction);
      
      // Análisis en tiempo real si es necesario
      await this.analyzeInteraction(interaction);
    } catch (error) {
      console.error('Error al registrar interacción:', error);
    }
  }

  private async saveInteraction(interaction: Interaction): Promise<void> {
    // Implementar guardado en base de datos
    console.log('Guardando interacción:', interaction);
  }

  private async analyzeInteraction(interaction: Interaction): Promise<void> {
    // Implementar análisis en tiempo real
    if (interaction.type === 'ai_assist') {
      await this.analyzeAIAssistance(interaction);
    }
  }

  private async analyzeAIAssistance(interaction: Interaction): Promise<void> {
    // Analizar uso del asistente de IA
    console.log('Analizando interacción con IA:', interaction);
  }

  async getUserInteractions(userId: string): Promise<Interaction[]> {
    return this.interactions.filter(i => i.userId === userId);
  }

  async getPatientInteractions(patientId: string): Promise<Interaction[]> {
    return this.interactions.filter(i => i.details.patientId === patientId);
  }

  async getModuleInteractions(module: string): Promise<Interaction[]> {
    return this.interactions.filter(i => i.module === module);
  }

  async getInteractionStats(
    timeframe: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    totalInteractions: number;
    successRate: number;
    moduleBreakdown: Record<string, number>;
    typeBreakdown: Record<InteractionType, number>;
  }> {
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const relevantInteractions = this.interactions.filter(
      i => i.timestamp >= startDate && i.timestamp <= now
    );

    const moduleBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<InteractionType, number> = {} as Record<InteractionType, number>;
    let successfulInteractions = 0;

    relevantInteractions.forEach(interaction => {
      // Módulos
      moduleBreakdown[interaction.module] = (moduleBreakdown[interaction.module] || 0) + 1;
      
      // Tipos
      typeBreakdown[interaction.type] = (typeBreakdown[interaction.type] || 0) + 1;
      
      // Éxitos
      if (interaction.success) {
        successfulInteractions++;
      }
    });

    return {
      totalInteractions: relevantInteractions.length,
      successRate: relevantInteractions.length > 0 
        ? (successfulInteractions / relevantInteractions.length) * 100 
        : 0,
      moduleBreakdown,
      typeBreakdown
    };
  }

  async getPatientEngagementMetrics(patientId: string): Promise<{
    totalInteractions: number;
    lastInteraction: Date | null;
    averageSessionDuration: number;
    commonActions: string[];
  }> {
    const patientInteractions = await this.getPatientInteractions(patientId);

    if (patientInteractions.length === 0) {
      return {
        totalInteractions: 0,
        lastInteraction: null,
        averageSessionDuration: 0,
        commonActions: []
      };
    }

    // Calcular duración promedio de sesión
    const sessionsWithDuration = patientInteractions.filter(i => i.duration);
    const averageSessionDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((acc, curr) => acc + (curr.duration || 0), 0) / sessionsWithDuration.length
      : 0;

    // Encontrar acciones más comunes
    const actionCounts: Record<string, number> = {};
    patientInteractions.forEach(i => {
      actionCounts[i.action] = (actionCounts[i.action] || 0) + 1;
    });

    const commonActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action]) => action);

    return {
      totalInteractions: patientInteractions.length,
      lastInteraction: patientInteractions[patientInteractions.length - 1].timestamp,
      averageSessionDuration,
      commonActions
    };
  }
}

export const interactionService = InteractionService.getInstance(); 