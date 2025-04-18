import { ChatAnthropic } from "@langchain/anthropic";
import { LLMProviderConfig, LLMProviderType } from "../types";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

/**
 * Crea una instancia de modelo de LangChain para Anthropic/Claude
 */
export function createAnthropicModel(config: LLMProviderConfig) {
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
 */
export function formatMessagesForAnthropic(messages: Array<{ role: string; content: string }>) {
  return messages.map(message => {
    if (message.role === 'system') {
      return new SystemMessage(message.content);
    } else if (message.role === 'user') {
      return new HumanMessage(message.content);
    } else if (message.role === 'assistant') {
      return new AIMessage(message.content);
    } else {
      throw new Error(`Tipo de mensaje no soportado: ${message.role}`);
    }
  });
}

/**
 * Flujo de procesamiento de mensajes para Anthropic
 */
export async function processWithAnthropic(
  messages: Array<{ role: string; content: string }>,
  config: LLMProviderConfig
) {
  const model = createAnthropicModel(config);
  const formattedMessages = formatMessagesForAnthropic(messages);
  
  try {
    const response = await model.invoke(formattedMessages);
    
    return {
      content: response.content,
      metadata: {
        provider: 'anthropic',
        model: config.modelName,
      }
    };
  } catch (error) {
    console.error("Error al procesar con Anthropic:", error);
    throw new Error(`Error al procesar con Anthropic: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Obtiene información de tokens utilizados (aproximada para Claude)
 */
export function estimateTokenUsage(input: string, output: string) {
  // Aproximación simple basada en tokens = palabras / 0.75
  const inputTokens = Math.ceil(input.split(/\s+/).length / 0.75);
  const outputTokens = Math.ceil(output.split(/\s+/).length / 0.75);
  
  return {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens
  };
} 