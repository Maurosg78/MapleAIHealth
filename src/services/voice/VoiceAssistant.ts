import { EventEmitter } from 'events';
import { Transcript } from '../../types/voice';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
  }
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionError extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface VoiceConfig {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

interface VoiceAssistantEvents {
  transcript: (transcript: Transcript) => void;
  error: (error: Error) => void;
  start: () => void;
  stop: () => void;
  end: () => void;
}

export class VoiceAssistant extends EventEmitter {
  private recognition: SpeechRecognition | null;
  private isListening: boolean;
  private config: VoiceConfig;

  constructor(config: VoiceConfig = {}) {
    super();
    this.config = {
      continuous: true,
      interimResults: true,
      lang: 'es-ES',
      ...config
    };
    this.isListening = false;
    this.recognition = null;
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (typeof window !== 'undefined' && SpeechRecognition) {
      this.recognition = new SpeechRecognition();
    } else {
      this.emit('error', new Error('Speech Recognition no está soportado en este navegador'));
      return;
    }

    if (this.recognition) {
      this.recognition.continuous = this.config.continuous ?? true;
      this.recognition.interimResults = this.config.interimResults ?? true;
      this.recognition.lang = this.config.lang ?? 'es-ES';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.emit('start');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.emit('end');
        if (this.config.continuous) {
          this.start();
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionError) => {
        this.isListening = false;
        this.emit('error', new Error(event.error));
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => ({
            text: result.transcript,
            isFinal: result.isFinal,
            confidence: result.confidence,
            speaker: null,
            timestamp: new Date()
          }))
          .reduce((acc, curr) => ({
            text: acc.text + ' ' + curr.text,
            isFinal: curr.isFinal,
            confidence: curr.confidence,
            speaker: null,
            timestamp: new Date()
          }));

        this.emit('transcript', transcript as Transcript);
      };
    }
  }

  public start(): void {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        this.emit('error', error instanceof Error ? error : new Error('Error al iniciar el reconocimiento de voz'));
      }
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        this.emit('stop');
      } catch (error) {
        this.emit('error', error instanceof Error ? error : new Error('Error al detener el reconocimiento de voz'));
      }
    }
  }

  public isActive(): boolean {
    return this.isListening;
  }

  public setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
      this.config.lang = lang;
    }
  }

  public getLanguage(): string {
    return this.config.lang ?? 'es-ES';
  }

  public override on<K extends keyof VoiceAssistantEvents>(
    event: K,
    listener: VoiceAssistantEvents[K]
  ): this {
    return super.on(event, listener);
  }

  public override emit<K extends keyof VoiceAssistantEvents>(
    event: K,
    ...args: Parameters<VoiceAssistantEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
} 