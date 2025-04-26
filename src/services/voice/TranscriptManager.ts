import { EventEmitter } from 'events';
import { Transcript, PendingTranscript, TranscriptReview } from '../../types/voice';

export class TranscriptManager extends EventEmitter {
  private pendingTranscripts: Map<string, PendingTranscript>;
  private storageKey: string;

  constructor() {
    super();
    this.pendingTranscripts = new Map();
    this.storageKey = 'pending_transcripts';
    this.loadPendingTranscripts();
  }

  private loadPendingTranscripts(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.pendingTranscripts = new Map(
          parsed.map((t: PendingTranscript) => [
            t.id,
            { ...t, createdAt: new Date(t.createdAt) }
          ])
        );
      }
    } catch (error) {
      console.error('Error loading pending transcripts:', error);
    }
  }

  private savePendingTranscripts(): void {
    try {
      const toStore = Array.from(this.pendingTranscripts.values());
      localStorage.setItem(this.storageKey, JSON.stringify(toStore));
    } catch (error) {
      console.error('Error saving pending transcripts:', error);
    }
  }

  addTranscript(
    transcript: Transcript,
    patientId: string,
    visitId: string
  ): PendingTranscript {
    const pendingTranscript: PendingTranscript = {
      id: Math.random().toString(36).substr(2, 9),
      transcript,
      status: 'pending',
      createdAt: new Date(),
      patientId,
      visitId
    };

    this.pendingTranscripts.set(pendingTranscript.id, pendingTranscript);
    this.savePendingTranscripts();
    this.emit('transcriptAdded', pendingTranscript);

    return pendingTranscript;
  }

  reviewTranscript(review: TranscriptReview): PendingTranscript | null {
    const transcript = this.pendingTranscripts.get(review.transcriptId);
    if (!transcript) return null;

    const updatedTranscript: PendingTranscript = {
      ...transcript,
      status: review.status,
      reviewedAt: new Date(),
      reviewedBy: review.reviewedBy,
      comments: review.comments
    };

    if (review.modifications) {
      updatedTranscript.transcript = {
        ...transcript.transcript,
        ...review.modifications
      };
    }

    this.pendingTranscripts.set(transcript.id, updatedTranscript);
    this.savePendingTranscripts();
    this.emit('transcriptReviewed', updatedTranscript);

    return updatedTranscript;
  }

  getPendingTranscripts(patientId?: string): PendingTranscript[] {
    const transcripts = Array.from(this.pendingTranscripts.values());
    return patientId
      ? transcripts.filter(t => t.patientId === patientId && t.status === 'pending')
      : transcripts.filter(t => t.status === 'pending');
  }

  getApprovedTranscripts(patientId?: string): PendingTranscript[] {
    const transcripts = Array.from(this.pendingTranscripts.values());
    return patientId
      ? transcripts.filter(t => t.patientId === patientId && t.status === 'approved')
      : transcripts.filter(t => t.status === 'approved');
  }

  getRejectedTranscripts(patientId?: string): PendingTranscript[] {
    const transcripts = Array.from(this.pendingTranscripts.values());
    return patientId
      ? transcripts.filter(t => t.patientId === patientId && t.status === 'rejected')
      : transcripts.filter(t => t.status === 'rejected');
  }

  deleteTranscript(id: string): boolean {
    const deleted = this.pendingTranscripts.delete(id);
    if (deleted) {
      this.savePendingTranscripts();
      this.emit('transcriptDeleted', id);
    }
    return deleted;
  }
} 