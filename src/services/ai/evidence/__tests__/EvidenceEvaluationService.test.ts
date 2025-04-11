import {
  evidenceEvaluationService
} from '../index';
import {
  EvidenceSource,
  Recommendation
} from '../../types';

// Mock para la clase Logger
jest.mock('../../logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('EvidenceEvaluationService', () => {
  // Datos de prueba
  const mockRecommendation = {
    id: 'rec123',
    type: 'medication',
    title: 'Uso de metformina en diabetes tipo 2',
    description: 'Se recomienda metformina como tratamiento de primera línea para pacientes con diabetes tipo 2.',
    priority: 'high',
    rationale: 'Múltiples estudios clínicos han demostrado la eficacia y seguridad de metformina para el control glucémico.'
  } as unknown as Recommendation;

  const mockSource: EvidenceSource = {
    id: 'source123',
    title: 'Efficacy of metformin in type 2 diabetes: systematic review',
    authors: ['García J', 'Martínez L'],
    publication: 'Journal of Diabetes Research',
    year: 2020,
    doi: '10.1234/jdr.2020.12345',
    citation: 'García J, et al. Efficacy of metformin in type 2 diabetes. J Diabetes Res. 2020;15(4):175-190.',
    verified: false,
    reliability: 'unknown'
  };

  // Acceder a los métodos privados (para pruebas)
  // @ts-expect-error - Acceso a métodos privados para pruebas
  const privateService = evidenceEvaluationService as PrivateEvidenceService;

  // Tipo para métodos privados (solo para pruebas)
  type PrivateEvidenceService = {
    simulateVerification: (source: EvidenceSource) => Promise<{verified: boolean, reliability: 'high' | 'moderate' | 'low' | 'unknown'}>;
    extractSources: (content: string) => Promise<EvidenceSource[]>;
    generateLowEvidenceResult: () => unknown;
    calculateReliabilityScore: (sources: EvidenceSource[]) => number;
    mapScoreToReliability: (score: number) => 'high' | 'moderate' | 'low' | 'very-low';
    determineEvidenceLevel: (score: number) => 'A' | 'B' | 'C' | 'D';
  }

  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('evaluateRecommendation', () => {
    test('debería evaluar correctamente una recomendación con fuentes', async () => {
      // Espiar el método evaluateEvidence
      jest.spyOn(evidenceEvaluationService, 'evaluateEvidence').mockResolvedValueOnce({
        evidenceLevel: 'B',
        details: {
          level: 'B',
          description: 'Evidencia moderada basada en estudios clínicos consistentes',
          criteria: 'Se basa en estudios clínicos controlados',
          reliability: 'moderate',
          sources: [{ ...mockSource, verified: true, reliability: 'high' }]
        },
        confidenceScore: 78,
        limitationsNotes: 'Limitada por la heterogeneidad de poblaciones estudiadas'
      });

      // Ejecutar el método
      const result = await evidenceEvaluationService.evaluateRecommendation(mockRecommendation);

      // Verificaciones
      expect(result).toHaveProperty('evidenceLevel', 'B');
      expect(result).toHaveProperty('evidenceDetails');
      expect(result.evidenceDetails?.reliability).toBe('moderate');
      expect(evidenceEvaluationService.evaluateEvidence).toHaveBeenCalled();
    });

    test('debería manejar errores durante la evaluación', async () => {
      // Simular un error en evaluateEvidence
      jest.spyOn(evidenceEvaluationService, 'evaluateEvidence').mockRejectedValueOnce(
        new Error('Error en la evaluación')
      );

      // Ejecutar el método
      const result = await evidenceEvaluationService.evaluateRecommendation(mockRecommendation);

      // Verificaciones - la recomendación original debe mantenerse sin cambios
      expect(result).toEqual(mockRecommendation);
    });
  });

  describe('verifySources', () => {
    test('debería verificar fuentes en múltiples bases de datos', async () => {
      // Simular verificación exitosa

      // Espiar el método de simulación de verificación
      jest.spyOn(privateService, 'simulateVerification').mockResolvedValue({
        verified: true,
        reliability: 'high'
      });

      // Ejecutar verificación
      const result = await evidenceEvaluationService.verifySources([mockSource]);

      // Verificaciones
      expect(result.length).toBe(1);
      expect(result[0].verified).toBe(true);
      expect(result[0].reliability).toBe('high');
    });

    test('debería manejar fallos en la verificación', async () => {
      // Simular error en verificación
      jest.spyOn(privateService, 'simulateVerification').mockRejectedValue(
        new Error('Error al conectar con base de datos')
      );

      // Ejecutar verificación
      const result = await evidenceEvaluationService.verifySources([mockSource]);

      // Verificaciones - debe retornar la fuente marcada como no verificada
      expect(result.length).toBe(1);
      expect(result[0].verified).toBe(false);
      expect(result[0].reliability).toBe('unknown');
    });
  });

  describe('classifyEvidenceLevel', () => {
    test('debería clasificar evidencia como nivel A con fuentes confiables', () => {
      const details = {
        sources: [
          { ...mockSource, verified: true, reliability: 'high' as const },
          { ...mockSource, verified: true, reliability: 'high' as const, id: 'source456' }
        ],
        reliability: 'high' as const
      };

      const level = evidenceEvaluationService.classifyEvidenceLevel(details);
      expect(level).toBe('A');
    });

    test('debería clasificar evidencia como nivel B con fuentes moderadas', () => {
      const details = {
        sources: [
          { ...mockSource, verified: true, reliability: 'moderate' as const }
        ],
        reliability: 'moderate' as const
      };

      const level = evidenceEvaluationService.classifyEvidenceLevel(details);
      expect(level).toBe('B');
    });

    test('debería clasificar evidencia como nivel C con fuentes limitadas', () => {
      const details = {
        sources: [
          { ...mockSource, verified: true, reliability: 'low' as const }
        ],
        reliability: 'low' as const
      };

      const level = evidenceEvaluationService.classifyEvidenceLevel(details);
      expect(level).toBe('C');
    });

    test('debería clasificar evidencia como nivel D con fuentes no verificadas', () => {
      const details = {
        sources: [
          { ...mockSource, verified: false }
        ],
        reliability: 'very-low' as const
      };

      const level = evidenceEvaluationService.classifyEvidenceLevel(details);
      expect(level).toBe('D');
    });
  });

  describe('evaluateEvidence', () => {
    test('debería evaluar contenido con fuentes', async () => {
      // Configurar mocks
      jest.spyOn(privateService, 'extractSources').mockResolvedValueOnce([mockSource]);
      jest.spyOn(evidenceEvaluationService, 'verifySources').mockResolvedValueOnce([
        { ...mockSource, verified: true, reliability: 'moderate' }
      ]);

      // Ejecutar la evaluación
      const result = await evidenceEvaluationService.evaluateEvidence(
        'La metformina es efectiva para el tratamiento de diabetes tipo 2 según estudios recientes.'
      );

      // Verificaciones
      expect(result).toHaveProperty('evidenceLevel');
      expect(result).toHaveProperty('details');
      expect(result).toHaveProperty('confidenceScore');
      expect(privateService.extractSources).toHaveBeenCalled();
      expect(evidenceEvaluationService.verifySources).toHaveBeenCalled();
    });

    test('debería manejar contenido sin fuentes', async () => {
      // Simular que no se encontraron fuentes
      jest.spyOn(privateService, 'extractSources').mockResolvedValueOnce([]);
      jest.spyOn(privateService, 'generateLowEvidenceResult').mockReturnValueOnce({
        evidenceLevel: 'D',
        details: {
          level: 'D',
          description: 'Evidencia muy limitada o ausente',
          criteria: 'No se identificaron fuentes verificables',
          reliability: 'very-low',
          sources: []
        },
        confidenceScore: 20,
        limitationsNotes: 'Recomendación basada únicamente en opinión'
      });

      // Ejecutar evaluación
      const result = await evidenceEvaluationService.evaluateEvidence(
        'Algunos médicos sugieren que este tratamiento puede ser efectivo.'
      );

      // Verificaciones
      expect(result.evidenceLevel).toBe('D');
      expect(result.details.reliability).toBe('very-low');
      expect(privateService.generateLowEvidenceResult).toHaveBeenCalled();
    });
  });

  describe('Métodos de utilidad', () => {
    test('calculateReliabilityScore debería calcular puntuación adecuada', () => {
      const sources = [
        { ...mockSource, verified: true, reliability: 'high' as const },
        { ...mockSource, verified: true, reliability: 'moderate' as const, id: 'source234' },
        { ...mockSource, verified: false, id: 'source345' }
      ] as EvidenceSource[];

      const score = privateService.calculateReliabilityScore(sources);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('mapScoreToReliability debería mapear puntuaciones correctamente', () => {
      expect(privateService.mapScoreToReliability(0.9)).toBe('high');
      expect(privateService.mapScoreToReliability(0.7)).toBe('moderate');
      expect(privateService.mapScoreToReliability(0.4)).toBe('low');
      expect(privateService.mapScoreToReliability(0.2)).toBe('very-low');
    });

    test('determineEvidenceLevel debería asignar niveles correctamente', () => {
      expect(privateService.determineEvidenceLevel(0.9)).toBe('A');
      expect(privateService.determineEvidenceLevel(0.7)).toBe('B');
      expect(privateService.determineEvidenceLevel(0.4)).toBe('C');
      expect(privateService.determineEvidenceLevel(0.2)).toBe('D');
    });
  });
});
