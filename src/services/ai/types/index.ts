/**
 * Tipos y interfaces para el framework de agente
 */

import { BaseMessage } from "@langchain/core/messages";;;;;

/**
 * Tipos de especialidades médicas soportadas
 */
export type MedicalSpecialty = 
  | 'physiotherapy'
  | 'general_medicine'
  | 'traumatology'
  | 'neurology'
  | 'cardiology'
  | 'default';

/**
 * Nivel de experiencia del agente
 */
export enum AgentExpertiseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert'
}

/**
 * Información de contexto del paciente
 */
export interface PatientContext {
  patientId: string;
  age?: number;
  gender?: string;
  diagnosis?: string[];
  medications?: string[];
  allergies?: string[];
  recentSymptoms?: string[];
  knownConditions?: string[];
}

/**
 * Contexto clínico para enviar al agente
 */
export interface ClinicalContext {
  specialty: MedicalSpecialty;
  patientContext?: PatientContext;
  currentSection?: string;
  activeView?: string;
  lastUserActions?: string[];
  systemPromptOverride?: string;
  expertiseLevel?: AgentExpertiseLevel;
}

/**
 * Configuración del agente
 */
export interface AgentConfig {
  modelName: string;
  temperature: number;
  maxTokens?: number;
  systemPrompt?: string;
  promptTemplates?: Record<string, string>;
  specialty?: MedicalSpecialty;
  expertiseLevel?: AgentExpertiseLevel;
  persistMemory?: boolean;
  memoryType?: 'buffer' | 'summary' | 'vector';
  memorySize?: number;
}

/**
 * Información de tokens utilizados en una solicitud
 */
export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

/**
 * Metadata adicional para respuestas del agente
 */
export interface AgentResponseMetadata {
  tokens?: TokenUsage;
  sources?: string[];
  confidence?: number;
  reasoning?: string[];
  clinicallyRelevant?: boolean;
  processingTimeMs?: number;
}

/**
 * Respuesta del agente
 */
export interface AgentResponse {
  content: string;
  messageId: string;
  timestamp: Date;
  metadata?: AgentResponseMetadata;
  rawMessages?: BaseMessage[];
}

/**
 * Tipos de modelos LLM soportados
 */
export enum LLMProviderType {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  LOCAL = 'local',
  CUSTOM = 'custom'
}

/**
 * Configuración para proveedores LLM
 */
export interface LLMProviderConfig {
  type: LLMProviderType;
  apiKey?: string;
  modelName: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  customHeaders?: Record<string, string>;
}

/**
 * Estado de la conversación
 */
export interface ConversationState {
  messages: BaseMessage[];
  patientContext?: PatientContext;
  clinicalContext?: ClinicalContext;
  metadata?: Record<string, unknown>;
}

/**
 * Formato simplificado para los mensajes
 */
export interface SimpleMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
} 