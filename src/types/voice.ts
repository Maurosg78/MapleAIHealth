declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionError) => void) | null;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

export interface Transcript {
  text: string;
  confidence: number;
  speaker: {
    id: string;
    name: string;
    color: string;
  } | null;
  timestamp: Date;
  languageIssues?: string[];
  unclearWords?: {
    word: string;
    alternatives: string[];
    confidence: number;
  }[];
  voiceCharacteristics?: {
    pitch: number;
    timbre: number;
    speakingRate: number;
  };
}

export interface VoiceError {
  error: string;
  message: string;
}

export interface PendingTranscript {
  id: string;
  transcript: Transcript;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  comments?: string;
  patientId: string;
  visitId: string;
}

export interface TranscriptReview {
  transcriptId: string;
  status: 'approved' | 'rejected';
  reviewedBy: string;
  reviewedAt: Date;
  comments?: string;
  modifications?: {
    text: string;
    speaker?: {
      id: string;
      name: string;
      color: string;
    };
    unclearWords?: {
      word: string;
      alternatives: string[];
      confidence: number;
    }[];
  };
} 