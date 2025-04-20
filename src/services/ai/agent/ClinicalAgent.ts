import { v4 as uuidv4 } from 'uuid';
import { 
  AgentConfig, 
  AgentResponse,
  ClinicalContext,
  LLMProviderType,
  ConversationState,
  MedicalSpecialty,
  SimpleMessage
} from '../types';
import { DEFAULT_AGENT_CONFIG, createAgentConfigForSpecialty, LLM_PROVIDER_CONFIGS } from '../config';
import { processWithAnthropic, estimateTokenUsage } from '../llm/anthropic';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';

/**
 * Agente clínico basado en modelos de lenguaje avanzados
 * 
 * Esta clase implementa el framework base para el agente 
 * con capacidad de integración con múltiples LLMs y 
 * especialización en diferentes áreas médicas.
 */
export class ClinicalAgent {
  private config: AgentConfig;
  private conversationState: ConversationState;
  private static instance: ClinicalAgent;

  /**
   * Constructor privado para el patrón Singleton
   */
  private constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      ...DEFAULT_AGENT_CONFIG,
      ...config
    };
    
    this.conversationState = {
      messages: []
    };

    // Agregar mensaje de sistema inicial
    if (this.config.systemPrompt) {
      this.conversationState.messages.push(
        new SystemMessage(this.config.systemPrompt)
      );
    }
  }

  /**
   * Obtiene la instancia única del agente (Singleton)
   */
  public static getInstance(config?: Partial<AgentConfig>): ClinicalAgent {
    if (!ClinicalAgent.instance) {
      ClinicalAgent.instance = new ClinicalAgent(config);
    } else if (config) {
      // Actualizar configuración si se proporciona
      ClinicalAgent.instance.updateConfig(config);
    }
    
    return ClinicalAgent.instance;
  }

  /**
   * Actualiza la configuración del agente
   */
  public updateConfig(config: Partial<AgentConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };

    // Actualizar sistema prompt si cambia la especialidad
    if (config.specialty && config.specialty !== this.config.specialty) {
      this.setSpecialty(config.specialty);
    }
  }

  /**
   * Cambia la especialidad del agente
   */
  public setSpecialty(specialty: MedicalSpecialty): void {
    const updatedConfig = createAgentConfigForSpecialty(specialty);
    this.config = {
      ...this.config,
      specialty,
      systemPrompt: updatedConfig.systemPrompt
    };

    // Actualizar el mensaje del sistema
    if (this.conversationState.messages.length > 0 && 
        this.conversationState.messages[0] instanceof SystemMessage) {
      this.conversationState.messages[0] = new SystemMessage(updatedConfig.systemPrompt || '');
    } else {
      this.conversationState.messages.unshift(
        new SystemMessage(updatedConfig.systemPrompt || '')
      );
    }
  }

  /**
   * Establece el contexto clínico actual
   */
  public setContext(context: ClinicalContext): void {
    this.conversationState.clinicalContext = context;
    this.conversationState.patientContext = context.patientContext;

    // Si hay un override de sistema, actualizarlo
    if (context.systemPromptOverride) {
      this.updateSystemPrompt(context.systemPromptOverride);
    }

    // Si hay una especialidad, actualizarla
    if (context.specialty && context.specialty !== this.config.specialty) {
      this.setSpecialty(context.specialty);
    }
  }

  /**
   * Actualiza el prompt del sistema
   */
  private updateSystemPrompt(prompt: string): void {
    if (this.conversationState.messages.length > 0 && 
        this.conversationState.messages[0] instanceof SystemMessage) {
      this.conversationState.messages[0] = new SystemMessage(prompt);
    } else {
      this.conversationState.messages.unshift(new SystemMessage(prompt));
    }
  }

  /**
   * Convierte un mensaje a formato simple para el proveedor LLM
   */
  private convertToSimpleMessages(): SimpleMessage[] {
    return this.conversationState.messages.map(msg => ({
      role: msg._getType() === 'human' ? 'user' : 'assistant',
      content: String(msg.content)
    }));
  }
  
  /**
   * Envía un mensaje al agente y recibe una respuesta
   */
  public async sendMessage(content: string): Promise<AgentResponse> {
    // Preparar contexto para el mensaje
    const contextInfo = this.prepareContextInfo();
    const fullContent = contextInfo ? `${contextInfo}\n\n${content}` : content;
    
    // Agregar mensaje del usuario
    const userMessage = new HumanMessage(fullContent);
    this.conversationState.messages.push(userMessage);
    
    // Convertir mensajes al formato esperado por los proveedores
    const messages = this.convertToSimpleMessages();
    
    // Elegir el proveedor y procesar
    let response;
    const startTime = Date.now();
    
    try {
      if (this.config.modelName.includes('claude')) {
        const providerConfig = {
          ...LLM_PROVIDER_CONFIGS[LLMProviderType.ANTHROPIC],
          modelName: this.config.modelName,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens
        };
        
        response = await processWithAnthropic(messages, providerConfig);
      } else {
        throw new Error(`Modelo no soportado: ${this.config.modelName}`);
      }
      
      const processingTime = Date.now() - startTime;
      
      // Crear respuesta del agente
      const messagesText = messages.map(m => m.content).join(' ');
      const tokens = estimateTokenUsage(messagesText, String(response.content));
      
      const aiMessage = new AIMessage(String(response.content));
      this.conversationState.messages.push(aiMessage);
      
      return {
        content: String(response.content),
        messageId: uuidv4(),
        timestamp: new Date(),
        metadata: {
          tokens,
          reasoning: [],
          clinicallyRelevant: true,
          processingTimeMs: processingTime
        },
        rawMessages: this.conversationState.messages
      };
    } catch (error) {
      console.error("Error al procesar mensaje:", error);
      throw new Error(`Error al procesar mensaje: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Prepara información contextual para enviar junto con la consulta
   */
  private prepareContextInfo(): string | null {
    const { patientContext, clinicalContext } = this.conversationState;
    
    if (!patientContext && !clinicalContext) {
      return null;
    }
    
    const contextParts: string[] = [];
    
    if (patientContext) {
      const patientInfo = [
        `ID Paciente: ${patientContext.patientId}`,
        patientContext.age ? `Edad: ${patientContext.age} años` : '',
        patientContext.gender ? `Género: ${patientContext.gender}` : '',
        patientContext.diagnosis?.length ? `Diagnóstico: ${patientContext.diagnosis.join(', ')}` : '',
        patientContext.knownConditions?.length ? `Condiciones: ${patientContext.knownConditions.join(', ')}` : '',
        patientContext.medications?.length ? `Medicación: ${patientContext.medications.join(', ')}` : '',
        patientContext.allergies?.length ? `Alergias: ${patientContext.allergies.join(', ')}` : ''
      ].filter(Boolean);
      
      if (patientInfo.length > 0) {
        contextParts.push(`INFORMACIÓN DEL PACIENTE:\n${patientInfo.join('\n')}`);
      }
    }
    
    if (clinicalContext) {
      if (clinicalContext.currentSection) {
        contextParts.push(`SECCIÓN ACTUAL: ${clinicalContext.currentSection}`);
      }
      
      if (clinicalContext.activeView) {
        contextParts.push(`VISTA ACTIVA: ${clinicalContext.activeView}`);
      }
    }
    
    return contextParts.length > 0 ? `### CONTEXTO ###\n${contextParts.join('\n\n')}\n### FIN DEL CONTEXTO ###` : null;
  }

  /**
   * Obtiene el historial de conversación actual
   */
  public getConversationHistory(): BaseMessage[] {
    return [...this.conversationState.messages];
  }

  /**
   * Limpia el historial de conversación
   */
  public clearConversation(): void {
    // Preservar el mensaje del sistema si existe
    const systemMessage = this.conversationState.messages.find(
      msg => msg instanceof SystemMessage
    );
    
    this.conversationState.messages = systemMessage ? [systemMessage] : [];
  }
}

// Exportar una instancia por defecto
export const clinicalAgent = ClinicalAgent.getInstance(); 