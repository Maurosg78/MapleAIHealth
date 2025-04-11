import {
  medicalSourceVerifier,
  MedicalSourceVerifier
} from '../index';
import { EvidenceSource } from '../../types';

// Mock para la clase Logger
jest.mock('../../logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('MedicalSourceVerifier', () => {
  // Datos de prueba
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
  // @ts-ignore - Acceso a métodos privados para pruebas
  const privateVerifier = medicalSourceVerifier as any;

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('verifySource', () => {
    test('debería verificar una fuente médica válida', async () => {
      // Mock para la verificación en la base de datos
      jest.spyOn(privateVerifier, 'checkSourceInDatabase').mockResolvedValueOnce({
        found: true,
        metadata: {
          impact_factor: 3.2,
          peer_reviewed: true,
          citations: 45
        }
      });

      // Ejecutar verificación
      const result = await medicalSourceVerifier.verifySource(mockSource);

      // Verificaciones
      expect(result.verified).toBe(true);
      expect(result.reliability).toBe('high');
      expect(result.verificationDetails).toBeDefined();
      expect(privateVerifier.checkSourceInDatabase).toHaveBeenCalledWith(
        mockSource,
        expect.any(String)
      );
    });

    test('debería marcar como no verificada una fuente no encontrada', async () => {
      // Mock para fuente no encontrada
      jest.spyOn(privateVerifier, 'checkSourceInDatabase').mockResolvedValueOnce({
        found: false
      });

      // Ejecutar verificación
      const result = await medicalSourceVerifier.verifySource(mockSource);

      // Verificaciones
      expect(result.verified).toBe(false);
      expect(result.reliability).toBe('unknown');
    });

    test('debería manejar errores durante la verificación', async () => {
      // Simular un error
      jest.spyOn(privateVerifier, 'checkSourceInDatabase').mockRejectedValueOnce(
        new Error('Error de conexión con la base de datos')
      );

      // Ejecutar verificación
      const result = await medicalSourceVerifier.verifySource(mockSource);

      // Verificaciones - la verificación debe fallar graciosamente
      expect(result.verified).toBe(false);
      expect(result.verificationError).toBeDefined();
    });
  });

  describe('verifyMultipleSources', () => {
    test('debería verificar múltiples fuentes', async () => {
      // Crear varias fuentes de prueba
      const sources = [
        mockSource,
        { ...mockSource, id: 'source456', title: 'Diabetes guidelines 2023' }
      ];

      // Mock para verificación individual
      jest.spyOn(medicalSourceVerifier, 'verifySource')
        .mockResolvedValueOnce({
          ...mockSource,
          verified: true,
          reliability: 'high',
          verificationDetails: { database: 'pubmed', timestamp: Date.now() }
        })
        .mockResolvedValueOnce({
          ...sources[1],
          verified: true,
          reliability: 'moderate',
          verificationDetails: { database: 'cochrane', timestamp: Date.now() }
        });

      // Ejecutar verificación múltiple
      const results = await medicalSourceVerifier.verifyMultipleSources(sources);

      // Verificaciones
      expect(results.length).toBe(2);
      expect(results[0].verified).toBe(true);
      expect(results[1].verified).toBe(true);
      expect(results[0].reliability).toBe('high');
      expect(results[1].reliability).toBe('moderate');
      expect(medicalSourceVerifier.verifySource).toHaveBeenCalledTimes(2);
    });

    test('debería continuar con la siguiente fuente si una falla', async () => {
      // Crear varias fuentes de prueba
      const sources = [
        mockSource,
        { ...mockSource, id: 'source456', title: 'Diabetes guidelines 2023' }
      ];

      // Mock para verificación - primera falla, segunda exitosa
      jest.spyOn(medicalSourceVerifier, 'verifySource')
        .mockRejectedValueOnce(new Error('Error en la verificación'))
        .mockResolvedValueOnce({
          ...sources[1],
          verified: true,
          reliability: 'high',
          verificationDetails: { database: 'cochrane', timestamp: Date.now() }
        });

      // Ejecutar verificación múltiple
      const results = await medicalSourceVerifier.verifyMultipleSources(sources);

      // Verificaciones
      expect(results.length).toBe(2);
      expect(results[0].verified).toBe(false); // La primera fuente debería fallar
      expect(results[1].verified).toBe(true);  // La segunda debería tener éxito
      expect(medicalSourceVerifier.verifySource).toHaveBeenCalledTimes(2);
    });
  });

  describe('calculateSourceReliability', () => {
    test('debería calcular alta confiabilidad para revistas de alto impacto', () => {
      const metadata = {
        impact_factor: 10.5,
        peer_reviewed: true,
        citations: 200,
        journal_quartile: 'Q1'
      };

      const reliability = privateVerifier.calculateSourceReliability(metadata);
      expect(reliability).toBe('high');
    });

    test('debería calcular confiabilidad moderada para fuentes estándar', () => {
      const metadata = {
        impact_factor: 2.1,
        peer_reviewed: true,
        citations: 45,
        journal_quartile: 'Q2'
      };

      const reliability = privateVerifier.calculateSourceReliability(metadata);
      expect(reliability).toBe('moderate');
    });

    test('debería calcular baja confiabilidad para fuentes débiles', () => {
      const metadata = {
        impact_factor: 0.8,
        peer_reviewed: true,
        citations: 5,
        journal_quartile: 'Q4'
      };

      const reliability = privateVerifier.calculateSourceReliability(metadata);
      expect(reliability).toBe('low');
    });

    test('debería manejar metadata incompleta', () => {
      const reliability = privateVerifier.calculateSourceReliability({});
      expect(reliability).toBe('unknown');
    });
  });
});
