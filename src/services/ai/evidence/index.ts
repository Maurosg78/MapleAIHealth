import { evidenceEvaluationService, IEvidenceEvaluationService, EvidenceEvaluationService } from './EvidenceEvaluationService';
import { medicalSourceVerifier, IMedicalSourceVerifier, MedicalSourceVerifier } from './MedicalSourceVerifier';

// Exportar servicios singleton
export {
  evidenceEvaluationService,
  EvidenceEvaluationService,
  medicalSourceVerifier,
  MedicalSourceVerifier
};

// Exportar tipos
export type { IEvidenceEvaluationService, IMedicalSourceVerifier };
