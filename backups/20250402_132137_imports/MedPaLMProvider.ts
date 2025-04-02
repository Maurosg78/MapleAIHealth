/**
import { HttpService } from "../../../lib/api"; * Interfaz para la respuesta de la API de Google MedPaLM
 */
interface MedPaLMResponse {
  predictions: Array<{
    content: string;
    safetyAttributes: {
      categories: string[];
      blocked: boolean;
      scores: Record<string, number>;
    };
  }>;
  metadata: {
    tokenMetadata: {
      inputTokenCount: number;
      outputTokenCount: number;
    };
  };
}

/**
 * Cliente para el proveedor Google MedPaLM 2
 */
export class MedPaLMProvider implements AIProviderClient {
  readonly id = 'med-palm-2';
  readonly name = 'Med-PaLM 2';
  readonly costPerQuery = 0.05;
  readonly capabilities = [
    'emr-analysis',
    'clinical-evidence',
    'treatment-patterns',
  ];

  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly location: string;
  private readonly modelId: string;
  private readonly logger = new Logger('MedPaLMProvider');

  constructor(config: {
    apiKey: string;
    projectId: string;
    location?: string;
    modelId?: string;
  }) {
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.location = config.location ?? 'us-central1';
    this.modelId = config.modelId ?? 'medpalm2';

    if (!this.apiKey || !this.projectId) {
      this.logger.error('Google API key or project ID not provided');
    }
  }

  isReady(): boolean {
    return !!this.apiKey && !!this.projectId;
  }

  estimateQueryCost(query: AIQuery): number {
    // Estimación básica basada en la longitud de la consulta

    const notesLength =
      query.unstructuredNotes?.reduce(
        (acc, note) => acc + note.content.length,
        0
      ) ?? 0;
    const contextLength = query.context?.data
      ? JSON.stringify(query.context.data).length
      : 0;

    // Aproximación: 4 caracteres = 1 token

    // Precios aproximados: $0.01 por 1K tokens de entrada, $0.04 por 1K tokens de salida

    // Asumiendo que la salida es 1/3 de la entrada

    return inputCost + outputCost;
  }

  async processQuery(query: AIQuery): Promise<AIResponse> {
    if (!this.isReady()) {
      throw new Error('MedPaLM provider is not configured correctly');
    }

    try {
      this.logger.debug('Processing query with MedPaLM', {
        queryType: query.context?.type,
      });

      // Preparar el prompt

      // Realizar la llamada a la API de Google

      // Procesar la respuesta
      return this.processResponse(response);
    } catch (error) {
      this.logger.error('Error processing query with MedPaLM', { error });
      throw new Error(
        `Error al procesar consulta con MedPaLM: ${(error as Error).message}`
      );
    }
  }

  private buildPrompt(query: AIQuery): string {
    let prompt = `Como asistente médico especializado, analiza la siguiente información y proporciona:
- Una respuesta detallada a la consulta
- Un nivel de confianza numérico entre 0.0 y 1.0
- Una organización temporal de eventos médicos relevantes
- Insights clínicos destacables
- Recomendaciones basadas en los datos

Formatea tu respuesta como un objeto JSON con las siguientes claves:
- "answer": string con tu respuesta principal
- "confidence": número entre 0 y 1
- "timeline": array de objetos con "date" y "events" (cada evento con "type", "description", "source" y "confidence")
- "insights": array de objetos con "type", "description", "severity", "evidence" y opcionalmente "recommendation"
- "recommendations": array de objetos con "type", "description", "priority" y "evidence"

Consulta del usuario: ${query.query}
`;

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

  private async callMedPaLM(prompt: string): Promise<MedPaLMResponse> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          candidateCount: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as {
        error?: { message?: string };
      };
      throw new Error(
        `Google API error: ${errorData.error?.message ?? 'Unknown error'}`
      );
    }

    return (await response.json()) as MedPaLMResponse;
  }

  private processResponse(medpalmResponse: MedPaLMResponse): AIResponse {
    try {
      // Extraer el contenido de la respuesta

      if (!content) {
        throw new Error('No content in MedPaLM response');
      }

      // Encontrar y parsear el JSON dentro del texto

      if (!jsonMatch) {
        throw new Error('No JSON found in MedPaLM response');
      }

      // Parsear el JSON
      const parsedResponse = JSON.parse(jsonMatch[0]) as {
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
      this.logger.error('Error processing MedPaLM response', { error });
      // Devolver una respuesta mínima en caso de error
      return {
        answer: 'Error al procesar la respuesta de la IA',
        confidence: 0.1,
      };
    }
  }
}
