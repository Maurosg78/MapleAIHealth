import { ClinicalEvidence } from './clinicalDashboard';

export interface EvidenceVisualizerProps {
  evidenceId: string;
  patientId?: string;
  onError?: (error: Error) => void;
}

export interface EvidenceVisualizerState {
  evidence: ClinicalEvidence | null;
  loading: boolean;
  error: Error | null;
}

export interface EvidenceCacheMetadata {
  lastAccess: number;
  accessCount: number;
  size: number;
  patientId?: string;
  section: string;
} 