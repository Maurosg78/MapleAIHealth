import { EventEmitter } from 'events';;;;;
import { Transcript } from '../../types/voice';;;;;

// Definir interfaces para la Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
  isFinal?: boolean;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

// Definición completa del interfaz SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

// Declaración global para el navegador
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    // @ts-expect-error - Los tipos son idénticos pero TypeScript muestra un falso positivo
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
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
    if (typeof window === 'undefined') {
      this.emit('error', new Error('Speech Recognition requiere un entorno de navegador'));
      return;
    }
    
    // Usar la implementación nativa o la prefijada con webkit
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      try {
        this.recognition = new SpeechRecognitionAPI();
      } catch {
        this.emit('error', new Error('Error al inicializar Speech Recognition'));
        return;
      }
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

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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

  // Métodos tipados
  public on<K extends keyof VoiceAssistantEvents>(
    event: K, 
    listener: VoiceAssistantEvents[K]
  ): this {
    return super.on(event, listener);
  }

  public emit<K extends keyof VoiceAssistantEvents>(
    event: K, 
    ...args: Parameters<VoiceAssistantEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
} 