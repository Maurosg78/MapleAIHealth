import { clinicalCopilotService, PatientContext } from '../ClinicalCopilotService';
import { aiService } from '../aiService';
import { evidenceEvaluationService } from '../evidence';
import { aiHistoryService } from '../aiHistoryService';
import { UnstructuredNote } from '../types';

// Mocks para los servicios dependientes
jest.mock('../aiService', () => ({
  aiService: {
    analyzeUnstructuredNotes: jest.fn()
  }
}));

jest.mock('../evidence', () => ({
  evidenceEvaluationService: {
    evaluateRecommendation: jest.fn()
  }
}));

jest.mock('../aiHistoryService', () => ({
  aiHistoryService: {
    addToHistory: jest.fn()
  }
}));

describe('ClinicalCopilotService', () => {
  // Restablecer todos los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock de respuesta del servicio de IA
    (aiService.analyzeUnstructuredNotes as jest.Mock).mockResolvedValue({
      summary: "Análisis de notas clínicas",
      insights: [
        {
          type: 'clinical-pattern',
          title: "Patrón de hiperglucemia",
          description: "Las notas indican niveles elevados de glucosa en múltiples ocasiones",
          severity: 'medium',
          confidence: 0.85
        },
        {
          type: 'risk-factor',
          title: "Riesgo cardiovascular",
          description: "El paciente presenta múltiples factores de riesgo cardiovascular",
          severity: 'high',
          confidence: 0.92
        }
      ],
      recommendations: [
        {
          id: "rec1",
          title: "Control de glucemia",
          content: "Se recomienda realizar control diario de glucemia en ayunas",
          type: "test",
          confidence: 0.9,
          evidenceLevel: "B"
        },
        {
          id: "rec2",
          title: "Iniciar metformina",
          content: "Considerar inicio de metformina 850mg cada 12 horas con las comidas",
          type: "medication",
          confidence: 0.87,
          priority: "high"
        }
      ]
    });

    // Mock de respuesta de evaluación de evidencia
    (evidenceEvaluationService.evaluateRecommendation as jest.Mock).mockResolvedValue({
      id: "rec1",
      content: "Se recomienda realizar control diario de glucemia en ayunas",
      title: "Control de glucemia",
      type: "test",
      confidence: 0.9,
      evidenceLevel: "B",
      sources: ["PMID:12345678", "DOI:10.1234/example.5678"],
      confidenceScore: 85
    });
  });

  // Datos de prueba
  const mockNotes: UnstructuredNote[] = [
    {
      id: "note1",
      content: "Paciente masculino de 55 años con diagnóstico reciente de diabetes tipo 2. Niveles de glucosa en ayunas: 180 mg/dL",
      date: "2023-04-05",
      provider: "Dr. García",
      type: "consultation",
      createdAt: "2023-04-05T10:30:00Z",
      specialty: "Endocrinología"
    }
  ];

  const mockPatientContext: PatientContext = {
    patientId: "patient123",
    age: 55,
    gender: "male",
    mainCondition: "Diabetes tipo 2",
    allergies: ["penicilina"],
    currentMedications: ["enalapril 10mg", "aspirina 100mg"]
  };

  test('debería generar sugerencias clínicas basadas en notas', async () => {
    // Acción
    const suggestions = await clinicalCopilotService.generateSuggestions(mockNotes, {
      patientContext: mockPatientContext
    });

    // Verificaciones
    expect(suggestions.length).toBeGreaterThan(0);
    expect(aiService.analyzeUnstructuredNotes).toHaveBeenCalledWith(
      mockPatientContext.patientId,
      mockNotes
    );

    // Verificar que se extrajo correctamente el tipo de sugerencia
    const testSuggestion = suggestions.find(s => s.type === 'test');
    const medicationSuggestion = suggestions.find(s => s.type === 'medication');

    expect(testSuggestion).toBeDefined();
    expect(medicationSuggestion).toBeDefined();

    // Verificar que la urgencia se asignó correctamente
    expect(medicationSuggestion?.urgency).toBe('soon');

    // Verificar que se añadió al historial
    expect(aiHistoryService.addToHistory).toHaveBeenCalled();
  });

  test('debería respetar el límite de sugerencias', async () => {
    // Acción
    const suggestions = await clinicalCopilotService.generateSuggestions(mockNotes, {
      patientContext: mockPatientContext,
      maxSuggestions: 1
    });

    // Verificaciones
    expect(suggestions.length).toBe(1);
    // Debería incluir la sugerencia de mayor prioridad
    expect(suggestions[0].type).toBe('medication');
  });

  test('debería filtrar por nivel de confianza', async () => {
    // Configurar respuesta específica para esta prueba
    (aiService.analyzeUnstructuredNotes as jest.Mock).mockResolvedValueOnce({
      summary: "Análisis de notas clínicas",
      insights: [
        {
          type: 'clinical-pattern',
          title: "Patrón de baja confianza",
          description: "Esta es una sugerencia de baja confianza",
          severity: 'low',
          confidence: 0.5
        },
        {
          type: 'clinical-pattern',
          title: "Patrón de alta confianza",
          description: "Esta es una sugerencia de alta confianza",
          severity: 'medium',
          confidence: 0.9
        }
      ],
      recommendations: []
    });

    // Acción
    const suggestions = await clinicalCopilotService.generateSuggestions(mockNotes, {
      patientContext: mockPatientContext,
      minConfidence: 0.8
    });

    // Verificaciones
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].title).toBe("Patrón de alta confianza");
  });

  test('debería detectar contraindicaciones', async () => {
    // Configurar respuesta específica para medicamentos
    (aiService.analyzeUnstructuredNotes as jest.Mock).mockResolvedValueOnce({
      summary: "Análisis de notas clínicas",
      insights: [],
      recommendations: [
        {
          id: "rec3",
          title: "Iniciar aspirina",
          content: "Considerar agregar aspirina 100mg diaria",
          type: "medication",
          confidence: 0.9
        }
      ]
    });

    // Acción
    const suggestions = await clinicalCopilotService.generateSuggestions(mockNotes, {
      patientContext: {
        ...mockPatientContext,
        // El paciente ya está tomando aspirina
        currentMedications: ["aspirina 100mg"]
      },
      includeContraindications: true
    });

    // Verificaciones
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].title).toBe("Iniciar aspirina");
    // Debería tener una contraindicación por medicamento duplicado
    expect(suggestions[0].contraindications).toBeDefined();
    expect(suggestions[0].contraindications?.length).toBeGreaterThan(0);
  });

  test('debería manejar errores al analizar notas', async () => {
    // Simular error en el servicio de IA
    (aiService.analyzeUnstructuredNotes as jest.Mock).mockRejectedValueOnce(
      new Error("Error al analizar notas")
    );

    // Acción
    const suggestions = await clinicalCopilotService.generateSuggestions(mockNotes);

    // Verificaciones
    expect(suggestions).toEqual([]);
  });

  test('debería evaluar niveles de evidencia', async () => {
    // Acción
    const suggestions = await clinicalCopilotService.generateSuggestions(mockNotes, {
      includeEvidenceDetails: true
    });

    // Verificaciones
    expect(evidenceEvaluationService.evaluateRecommendation).toHaveBeenCalled();

    // Verificar que la evidencia se integró en la sugerencia
    const testSuggestion = suggestions.find(s => s.type === 'test');
    expect(testSuggestion?.evidenceLevel).toBe("B");
    expect(testSuggestion?.sources).toBeDefined();
    expect(testSuggestion?.sources?.length).toBeGreaterThan(0);
  });

  test('debería ordenar sugerencias por prioridad', async () => {
    // Configurar respuestas con diferentes urgencias
    (aiService.analyzeUnstructuredNotes as jest.Mock).mockResolvedValueOnce({
      summary: "Análisis de notas clínicas",
      insights: [
        {
          type: 'risk-factor',
          title: "Riesgo crítico",
          description: "Riesgo que requiere atención inmediata",
          severity: 'critical',
          confidence: 0.95
        },
        {
          type: 'risk-factor',
          title: "Riesgo moderado",
          description: "Riesgo que requiere seguimiento",
          severity: 'medium',
          confidence: 0.9
        }
      ],
      recommendations: []
    });

    // Acción
    const suggestions = await clinicalCopilotService.generateSuggestions(mockNotes);

    // Verificaciones
    expect(suggestions.length).toBe(2);
    // La primera sugerencia debe ser la de mayor urgencia
    expect(suggestions[0].title).toBe("Riesgo crítico");
    expect(suggestions[0].urgency).toBe("emergency");
    expect(suggestions[1].title).toBe("Riesgo moderado");
    expect(suggestions[1].urgency).toBe("soon");
  });
});
