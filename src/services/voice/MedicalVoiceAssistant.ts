import { VoiceAssistant } from './VoiceAssistant';;;;;
import { Transcript } from '../../types/voice';;;;;

interface MedicalRestrictions {
  allowMedicationSuggestions: boolean;
  allowTestSuggestions: boolean;
  allowDiagnosisSuggestions: boolean;
  requireSpecialistRequest: boolean;
}

interface SensitiveArea {
  id: string;
  type: 'diagnosis' | 'test' | 'medication' | 'interpretation';
  content: string;
  requiresConfirmation: boolean;
}

interface MedicalConfig {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

interface RestrictedContent {
  term: string;
  reason: string;
}

interface ContextWarning {
  reason: string;
}

export class MedicalVoiceAssistant extends VoiceAssistant {
  private medicalRestrictions: MedicalRestrictions;
  private specialistId: string | null;
  private medicalContext: string;
  private restrictedTerms: Set<string>;
  private allowedMedicalTerms: Set<string>;
  private pendingConfirmations: Map<string, SensitiveArea>;

  constructor(config: MedicalConfig = {}) {
    super(config);
    this.medicalRestrictions = {
      allowMedicationSuggestions: false,
      allowTestSuggestions: false,
      allowDiagnosisSuggestions: false,
      requireSpecialistRequest: true
    };
    this.specialistId = null;
    this.medicalContext = 'general';
    this.pendingConfirmations = new Map();
    this.restrictedTerms = new Set([
      // Términos inapropiados
      'mierda', 'puta', 'coño', 'joder', 'cabrón', 'gilipollas',
      'fuck', 'shit', 'bitch', 'asshole', 'damn',
      // Términos médicos inapropiados
      'matar', 'suicidio', 'muerte', 'asesinato',
      'kill', 'suicide', 'death', 'murder'
    ]);
    this.allowedMedicalTerms = new Set([
      // Términos médicos aprobados
      'dolor', 'movimiento', 'ejercicio', 'terapia', 'rehabilitación',
      'pain', 'movement', 'exercise', 'therapy', 'rehabilitation',
      'fuerza', 'flexibilidad', 'rango', 'movilidad',
      'strength', 'flexibility', 'range', 'mobility'
    ]);

    this.setupMedicalEventListeners();
  }

  private setupMedicalEventListeners(): void {
    this.on('transcript', (transcript: Transcript) => {
      const filteredTranscript = this.filterMedicalContent(transcript);
      if (filteredTranscript) {
        this.emit('medicalTranscript', filteredTranscript);
        this.checkSensitiveAreas(filteredTranscript);
      }
    });
  }

  private checkSensitiveAreas(transcript: Transcript): void {
    const text = transcript.text.toLowerCase();
    
    // Patrones para detectar áreas sensibles
    const sensitivePatterns = {
      diagnosis: /(diagnóstico|diagnosticar|posible diagnóstico|sospecha de)/i,
      test: /(examen|prueba|test|laboratorio|imagenología|radiografía|resonancia|tomografía)/i,
      medication: /(medicamento|fármaco|droga|receta|prescripción|dosis)/i,
      interpretation: /(interpretar|resultado|hallazgo|análisis|conclusión)/i
    };

    for (const [type, pattern] of Object.entries(sensitivePatterns)) {
      if (pattern.test(text)) {
        const confirmationId = Math.random().toString(36).substr(2, 9);
        const sensitiveArea: SensitiveArea = {
          id: confirmationId,
          type: type as SensitiveArea['type'],
          content: text,
          requiresConfirmation: true
        };

        this.pendingConfirmations.set(confirmationId, sensitiveArea);
        this.emit('sensitiveAreaDetected', sensitiveArea);
      }
    }
  }

  public confirmSensitiveArea(confirmationId: string): void {
    const sensitiveArea = this.pendingConfirmations.get(confirmationId);
    if (sensitiveArea) {
      this.pendingConfirmations.delete(confirmationId);
      this.emit('sensitiveAreaConfirmed', sensitiveArea);
    }
  }

  public rejectSensitiveArea(confirmationId: string): void {
    const sensitiveArea = this.pendingConfirmations.get(confirmationId);
    if (sensitiveArea) {
      this.pendingConfirmations.delete(confirmationId);
      this.emit('sensitiveAreaRejected', sensitiveArea);
    }
  }

  private filterMedicalContent(transcript: Transcript): Transcript | null {
    const text = transcript.text.toLowerCase();
    
    // Verificar términos restringidos
    for (const term of this.restrictedTerms) {
      if (text.includes(term)) {
        this.emit('restrictedContent', {
          term,
          reason: 'Término inapropiado detectado'
        } as RestrictedContent);
        return null;
      }
    }

    // Verificar contexto médico
    if (this.medicalContext !== 'general') {
      let hasMedicalTerm = false;
      for (const term of this.allowedMedicalTerms) {
        if (text.includes(term)) {
          hasMedicalTerm = true;
          break;
        }
      }

      if (!hasMedicalTerm) {
        this.emit('contextWarning', {
          reason: 'El contenido no está relacionado con el contexto médico actual'
        } as ContextWarning);
      }
    }

    return transcript;
  }

  public setMedicalContext(context: string): void {
    this.medicalContext = context;
    this.emit('contextChanged', { context });
  }

  public setSpecialist(specialistId: string): void {
    this.specialistId = specialistId;
    this.emit('specialistChanged', { specialistId });
  }

  public updateRestrictions(restrictions: Partial<MedicalRestrictions>): void {
    if (this.specialistId) {
      this.medicalRestrictions = {
        ...this.medicalRestrictions,
        ...restrictions
      };
      this.emit('restrictionsUpdated', this.medicalRestrictions);
    } else {
      this.emit('error', new Error('Se requiere identificación de especialista para modificar restricciones'));
    }
  }

  public suggestMedicalAction(
    actionType: 'medication' | 'test' | 'diagnosis',
    suggestion: string
  ): void {
    if (!this.specialistId) {
      this.emit('error', new Error('Se requiere identificación de especialista para sugerir acciones médicas'));
      return;
    }

    const restrictionKey = `allow${actionType.charAt(0).toUpperCase() + actionType.slice(1)}Suggestions` as keyof MedicalRestrictions;
    if (!this.medicalRestrictions[restrictionKey]) {
      this.emit('error', new Error(`Las sugerencias de ${actionType} no están permitidas en la configuración actual`));
      return;
    }

    this.emit('medicalSuggestion', {
      type: actionType,
      suggestion,
      specialistId: this.specialistId,
      timestamp: new Date()
    });
  }

  public addRestrictedTerm(term: string): void {
    if (this.specialistId) {
      this.restrictedTerms.add(term.toLowerCase());
      this.emit('restrictedTermAdded', { term });
    }
  }

  public addAllowedMedicalTerm(term: string): void {
    if (this.specialistId) {
      this.allowedMedicalTerms.add(term.toLowerCase());
      this.emit('allowedTermAdded', { term });
    }
  }

  public getCurrentRestrictions(): MedicalRestrictions {
    return { ...this.medicalRestrictions };
  }

  public getMedicalContext(): string {
    return this.medicalContext;
  }
} 