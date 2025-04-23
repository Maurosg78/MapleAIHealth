import { ChatAnthropic } from "@langchain/anthropic";;;;;
import { LLMProviderConfig, LLMProviderType, SimpleMessage } from "../types";;;;;
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";;;;;

/**
 * Crea una instancia de modelo de LangChain para Anthropic/Claude
 */
export function createAnthropicModel(config: LLMProviderConfig): void {
  if (config.type !== LLMProviderType.ANTHROPIC) {
    throw new Error(`Tipo de proveedor incorrecto. Se esperaba ${LLMProviderType.ANTHROPIC}, se recibió ${config.type}`);
  }

  if (!config.apiKey && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("API key no proporcionada para Anthropic");
  }

  const modelConfig: Record<string, string | number | boolean | undefined> = {
    apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    modelName: config.modelName,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };

  // Añadir timeout si está definido
  if (config.timeout) {
    modelConfig.timeout = config.timeout;
  }

  return new ChatAnthropic(modelConfig);
}

/**
 * Helper para formatear mensajes para Anthropic
 * @param messages Array de mensajes en formato SimpleMessage
 * @returns Array de mensajes formateados para Anthropic
 */
export function formatMessagesForAnthropic(messages: SimpleMessage[]): BaseMessage[] {
  return messages.map(message => {
    switch (message.role) {
      case 'system':
        return new SystemMessage(message.content);
      case 'user':
        return new HumanMessage(message.content);
      case 'assistant':
        return new AIMessage(message.content);
      default:
        throw new Error(`Tipo de mensaje no soportado: ${message.role}`);
    }
  });
}

/**
 * Flujo de procesamiento de mensajes para Anthropic
 * @param messages Array de mensajes en formato SimpleMessage
 * @param config Configuración del proveedor LLM
 * @returns Respuesta del modelo con metadata
 */
export async function processWithAnthropic(
  messages: SimpleMessage[],
  config: LLMProviderConfig
) {
  const model = createAnthropicModel(config);
  const formattedMessages = formatMessagesForAnthropic(messages);
  
  try {
    const response = await model.invoke(formattedMessages);
    
    return {
      content: String(response.content),
      metadata: {
        provider: 'anthropic',
        model: config.modelName,
      }
    };
  } catch (error) {
    console.error('Error al procesar mensajes con Anthropic:', error);
    throw error;
  }
}

/**
 * Estima el uso de tokens para una entrada y salida
 * @param input Texto de entrada
 * @param output Texto de salida
 * @returns Objeto con estimación de tokens
 */
export function estimateTokenUsage(input: string, output: string): void {
  // Estimación aproximada: 1 token ~ 4 caracteres en promedio
  const inputTokens = Math.ceil(input.length / 4);
  const outputTokens = Math.ceil(output.length / 4);
  
  return {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens
  };
} 