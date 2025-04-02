
/**
import { HttpService } from "../../../lib/api"; * Interfaz para la respuesta de la API de OpenAI
 */
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Cliente para el proveedor OpenAI (GPT-4)
 */
export class OpenAIProvider implements AIProviderClient {
  readonly id = 'gpt-4-medical';
  readonly name = 'GPT-4 Medical';
  readonly costPerQuery = 0.03;
  readonly capabilities = [
    'emr-analysis',
    'timeline-organization',
    'insight-detection',
  ];

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly modelName: string;
  private readonly logger = new Logger('OpenAIProvider');

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    modelName?: string;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    this.modelName = config.modelName ?? 'gpt-4-turbo';

    if (!this.apiKey) {
      this.logger.error('OpenAI API key not provided');
    }
  }

  isReady(): boolean {
    return !!this.apiKey;
  }

  estimateQueryCost(query: AIQuery): number {
    // Estimación básica basada en la longitud de la consulta
    // En una implementación real, se calcularía basado en tokens

    const notesLength =
      query.unstructuredNotes?.reduce(
        (acc, note) => acc + note.content.length,
        0
      ) ?? 0;
    const contextLength = query.context?.data
      ? JSON.stringify(query.context.data).length
      : 0;


     // Aproximación: 4 caracteres = 1 token

    // Precios aproximados: $0.01 por 1K tokens de entrada, $0.03 por 1K tokens de salida

     // Asumiendo que la salida es 1/3 de la entrada

    return inputCost + outputCost;
  }

  async processQuery(query: AIQuery): Promise<AIResponse> {
    if (!this.isReady()) {
      throw new Error('OpenAI provider is not configured correctly');
    }

    try {
      this.logger.debug('Processing query with OpenAI', {
        queryType: query.context?.type,
      });

      // Construir el prompt basado en el tipo de consulta


      // Realizar la llamada a la API de OpenAI


      // Procesar la respuesta
      return this.processResponse(response);
    } catch (error) {
      this.logger.error('Error processing query with OpenAI', { error });
      throw new Error(
        `Error al procesar consulta con OpenAI: ${(error as Error).message}`
      );
    }
  }

  private buildMessages(
    query: AIQuery
  ): Array<{ role: string; content: string }> {


    // Mensaje del sistema con instrucciones
    messages.push({
      role: 'system',
      content: this.getSystemPrompt(query),
    });

    // Mensaje del usuario con la consulta
    messages.push({
      role: 'user',
      content: this.getUserPrompt(query),
    });

    return messages;
  }

  private getSystemPrompt(query: AIQuery): string {
    let prompt = `Eres un asistente médico avanzado especializado en analizar información médica y proporcionar insights clínicamente relevantes.
Debes analizar los datos proporcionados y generar una respuesta estructurada que incluya:
1. Una respuesta detallada a la consulta
2. Nivel de confianza en tu respuesta (0.0-1.0)
3. Organización temporal de eventos médicos relevantes
4. Insights clínicos destacables
5. Recomendaciones basadas en los datos

Usa un formato JSON válido con las siguientes claves: "answer", "confidence", "timeline", "insights", "recommendations".
Para la clave "timeline", cada elemento debe incluir "date" y "events", donde cada evento tiene "type", "description", "source" y "confidence".
Para la clave "insights", cada elemento debe incluir "type", "description", "severity", "evidence" y opcionalmente "recommendation".`;

    // Personalizar según el tipo de consulta
    if (query.context?.type === 'emr') {
      prompt += `\nEstás analizando datos estructurados de un expediente médico electrónico (EMR).`;
    } else if (query.unstructuredNotes && query.unstructuredNotes.length > 0) {
      prompt += `\nEstás analizando notas médicas no estructuradas. Extrae la información relevante y organízala de forma coherente.`;
    }

    return prompt;
  }

  private getUserPrompt(query: AIQuery): string {
    let prompt = query.query;

    // Añadir contexto si existe
    if (query.context?.data) {
      prompt += `\n\nContexto del EMR:\n${JSON.stringify(query.context.data, null, 2)}`;
    }

    // Añadir notas no estructuradas si existen
    if (query.unstructuredNotes && query.unstructuredNotes.length > 0) {
      prompt += `\n\nNotas médicas para analizar:`;
      query.unstructuredNotes.forEach((note, index) => {
        prompt += `\n\nNota ${index + 1} (${note.type}, ${note.timestamp}):\n${note.content}`;
      });
    }

    return prompt;
  }

  private async callOpenAI(
    messages: Array<{ role: string; content: string }>
  ): Promise<OpenAIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: messages,
        temperature: 0.2, // Baja temperatura para respuestas más precisas
        max_tokens: 2000, // Limitar la longitud de la respuesta
        response_format: { type: 'json_object' }, // Forzar formato JSON
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as {
        error?: { message?: string };
      };
      throw new Error(
        `OpenAI API error: ${errorData.error?.message ?? 'Unknown error'}`
      );
    }

    return (await response.json()) as OpenAIResponse;
  }

  private processResponse(openAIResponse: OpenAIResponse): AIResponse {
    try {
      // Extraer el contenido de la respuesta

      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Parsear el JSON
      const parsedResponse = JSON.parse(content) as {
        answer?: string;
        confidence?: number;
        timeline?: Array<{
          date: string;
          events: Array<{
            type: string;
            description: string;
            source: string;
            confidence: number;
          }>;
        }>;
        insights?: Array<{
          type: string;
          description: string;
          severity: string;
          evidence: string | string[];
          recommendation?: string;
        }>;
        recommendations?: Array<{
          type: string;
          description: string;
          priority: string;
          evidence: string[];
        }>;
      };

      // Construir la respuesta estructurada
      const aiResponse: AIResponse = {
        answer: parsedResponse.answer ?? 'No se pudo generar una respuesta',
        confidence: parsedResponse.confidence ?? 0.5,
      };

      // Añadir timeline si existe
      if (parsedResponse.timeline) {
        aiResponse.timeline = parsedResponse.timeline;
      }

      // Añadir insights si existen
      if (parsedResponse.insights) {
        aiResponse.insights = parsedResponse.insights.map((insight) => ({
          type: insight.type as InsightType,
          description: insight.description,
          severity: insight.severity as 'high' | 'medium' | 'low',
          evidence: Array.isArray(insight.evidence)
            ? insight.evidence
            : [insight.evidence],
          recommendation: insight.recommendation,
        }));
      }

      // Añadir recomendaciones si existen
      if (parsedResponse.recommendations) {
        aiResponse.recommendations = parsedResponse.recommendations.map(
          (rec) => ({
            type: rec.type as
              | 'medication'
              | 'test'
              | 'follow-up'
              | 'alert'
              | 'referral',
            description: rec.description,
            priority: rec.priority as 'high' | 'medium' | 'low',
            evidence: rec.evidence,
          })
        );
      }

      return aiResponse;
    } catch (error) {
      this.logger.error('Error processing OpenAI response', { error });
      // Devolver una respuesta mínima en caso de error
      return {
        answer: 'Error al procesar la respuesta de la IA',
        confidence: 0.1,
      };
    }
  }
}
