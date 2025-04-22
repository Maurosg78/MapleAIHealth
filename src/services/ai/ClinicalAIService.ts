import { MedicalSpecialty } from './types';
import { Patient } from '../../models/Patient';

interface AIContext {
  specialty: MedicalSpecialty;
  currentSection: string;
  patientContext?: {
    patientId: string;
    patientData?: Patient;
  };
}

interface AIResponse {
  content: string;
  confidence: number;
  references?: {
    title: string;
    url: string;
    year: number;
  }[];
}

class ClinicalAIService {
  private static instance: ClinicalAIService;
  private context: AIContext | null = null;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): ClinicalAIService {
    if (!ClinicalAIService.instance) {
      ClinicalAIService.instance = new ClinicalAIService();
    }
    return ClinicalAIService.instance;
  }

  setContext(context: AIContext) {
    this.context = context;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async processQuery(query: string): Promise<AIResponse> {
    if (!this.context) {
      throw new Error('Contexto no inicializado');
    }

    if (!this.apiKey) {
      throw new Error('API key no configurada');
    }

    try {
      // Aquí iría la llamada real a la API de IA
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Eres un asistente clínico especializado en ${this.context.specialty}. 
                       Estás ayudando con la sección ${this.context.currentSection}.
                       ${this.context.patientContext ? `Contexto del paciente: ${JSON.stringify(this.context.patientContext)}` : ''}`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();

      return {
        content: data.choices[0].message.content,
        confidence: 0.95, // Ejemplo, en realidad vendría de la API
        references: [
          {
            title: 'Clinical Practice Guidelines',
            url: 'https://example.com/guidelines',
            year: 2024
          }
        ]
      };
    } catch (error) {
      console.error('Error al procesar consulta:', error);
      throw new Error('Error al procesar la consulta con la IA');
    }
  }

  async getSuggestions(soapData: any): Promise<string[]> {
    if (!this.context) {
      throw new Error('Contexto no inicializado');
    }

    try {
      // Aquí iría la lógica para obtener sugerencias basadas en los datos SOAP
      return [
        'Considerar evaluación de fuerza muscular',
        'Documentar rango de movimiento',
        'Agregar escala de dolor'
      ];
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      throw new Error('Error al obtener sugerencias de la IA');
    }
  }

  async validateClinicalData(data: any): Promise<{
    isValid: boolean;
    suggestions: string[];
  }> {
    try {
      // Aquí iría la lógica para validar datos clínicos
      return {
        isValid: true,
        suggestions: []
      };
    } catch (error) {
      console.error('Error al validar datos:', error);
      throw new Error('Error al validar datos clínicos');
    }
  }
}

export const clinicalAIService = ClinicalAIService.getInstance(); 