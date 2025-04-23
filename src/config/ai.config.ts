import { MedicalSpecialty } from '../services/ai/types';;;;;

interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  specialtyPrompts: Record<MedicalSpecialty, string>;
  sectionPrompts: Record<string, string>;
  evidenceThreshold: number;
  confidenceThreshold: number;
  maxResponseTime: number;
}

const aiConfig: AIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
  specialtyPrompts: {
    physiotherapy: `Eres un asistente especializado en fisioterapia. 
                   Tu objetivo es ayudar en la evaluación, diagnóstico y tratamiento de condiciones musculoesqueléticas.
                   Debes basar tus recomendaciones en evidencia científica actualizada.`,
    occupationalTherapy: `Eres un asistente especializado en terapia ocupacional.
                         Tu objetivo es ayudar en la evaluación y tratamiento de limitaciones funcionales.
                         Enfócate en mejorar la independencia y calidad de vida del paciente.`,
    speechTherapy: `Eres un asistente especializado en terapia del habla.
                    Tu objetivo es ayudar en la evaluación y tratamiento de trastornos de la comunicación.
                    Considera aspectos del desarrollo y neurológicos en tus recomendaciones.`
  },
  sectionPrompts: {
    'SOAP - Subjective': 'Ayuda a documentar la historia y síntomas del paciente de manera estructurada.',
    'SOAP - Objective': 'Guía la evaluación objetiva y sugiere pruebas relevantes basadas en los síntomas.',
    'SOAP - Assessment': 'Ayuda a analizar los hallazgos y formular diagnósticos diferenciales.',
    'SOAP - Plan': 'Sugiere intervenciones basadas en evidencia y objetivos de tratamiento.',
    'Exercises': 'Recomienda ejercicios específicos y progresiones basadas en la condición.',
    'Diagnostics': 'Ayuda a interpretar resultados y sugerir pruebas adicionales si es necesario.'
  },
  evidenceThreshold: 0.8,
  confidenceThreshold: 0.7,
  maxResponseTime: 5000
};

export default aiConfig; 