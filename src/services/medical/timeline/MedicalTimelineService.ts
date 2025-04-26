import { MedicalTimeline, MedicalEvent } from '../../../types/clinical';
import { ClinicalEvidenceEvaluator } from '../evaluation/ClinicalEvidenceEvaluator';

export class MedicalTimelineService {
  private static instance: MedicalTimelineService;
  private evidenceEvaluator: ClinicalEvidenceEvaluator;

  private constructor() {
    this.evidenceEvaluator = ClinicalEvidenceEvaluator.getInstance();
  }

  public static getInstance(): MedicalTimelineService {
    if (!MedicalTimelineService.instance) {
      MedicalTimelineService.instance = new MedicalTimelineService();
    }
    return MedicalTimelineService.instance;
  }

  /**
   * Crea una nueva línea de tiempo médica
   */
  public createTimeline(patientId: string): MedicalTimeline {
    return {
      patientId,
      events: [],
      conditions: {},
      medications: {},
      tests: {}
    };
  }

  /**
   * Agrega un evento a la línea de tiempo
   */
  public addEvent(timeline: MedicalTimeline, event: MedicalEvent): MedicalTimeline {
    const updatedTimeline = { ...timeline };
    updatedTimeline.events.push(event);

    // Actualizar referencias según el tipo de evento
    switch (event.type) {
      case 'condition':
        updatedTimeline.conditions[event.id] = {
          onset: event.date,
          severity: event.severity || 0,
          relatedEvents: event.relatedEvents || []
        };
        break;
      case 'medication':
        updatedTimeline.medications[event.id] = {
          startDate: event.date,
          dosage: event.metadata?.dosage || '',
          frequency: event.metadata?.frequency || '',
          relatedEvents: event.relatedEvents || []
        };
        break;
      case 'test':
        updatedTimeline.tests[event.id] = {
          date: event.date,
          type: event.metadata?.type || '',
          results: event.metadata?.results || '',
          relatedEvents: event.relatedEvents || []
        };
        break;
    }

    return updatedTimeline;
  }

  /**
   * Obtiene eventos relacionados con una condición específica
   */
  public getRelatedEvents(timeline: MedicalTimeline, conditionId: string): MedicalEvent[] {
    const condition = timeline.conditions[conditionId];
    if (!condition) return [];

    return timeline.events.filter(event => 
      condition.relatedEvents.includes(event.id)
    );
  }

  /**
   * Genera sugerencias de tests basadas en la línea de tiempo
   */
  public async generateTestSuggestions(
    timeline: MedicalTimeline,
    condition: string,
    patientAge?: number
  ): Promise<EvidenceBasedTest[]> {
    const evidence = await this.evidenceEvaluator.getClinicalEvidence(
      condition,
      'physiotherapy',
      patientAge,
      Object.keys(timeline.conditions)
    );

    return evidence.map(e => ({
      id: e.id,
      name: e.title,
      description: e.summary,
      evidenceLevel: e.reliability,
      relevance: this.evidenceEvaluator.evaluateEvidenceRelevance(
        e,
        patientAge,
        Object.keys(timeline.conditions)
      ),
      urgency: this.determineTestUrgency(e, timeline),
      conditions: [condition],
      contraindications: this.getContraindications(e, timeline),
      references: [{
        source: 'PubMed',
        title: e.title,
        url: `https://pubmed.ncbi.nlm.nih.gov/${e.id}`,
        publicationDate: e.lastUpdated
      }]
    }));
  }

  /**
   * Determina la urgencia de un test basado en la evidencia y la línea de tiempo
   */
  private determineTestUrgency(evidence: ClinicalEvidence, timeline: MedicalTimeline): 'immediate' | 'urgent' | 'routine' {
    // Implementar lógica de urgencia basada en la evidencia y la línea de tiempo
    return 'routine';
  }

  /**
   * Obtiene contraindicaciones basadas en la línea de tiempo
   */
  private getContraindications(evidence: ClinicalEvidence, timeline: MedicalTimeline): string[] {
    // Implementar lógica de contraindicaciones basada en la línea de tiempo
    return [];
  }
} 