import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIService, AIServiceError } from '../aiService';
import { cacheService } from '../cacheService';
import { EMRData, UnstructuredNote, AIServiceInternals } from '../types';

// Mock del cacheService
vi.mock('../cacheService', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn(),
  },
}));

// Mock de la API
vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = AIService.getInstance();
    aiService.clearLogs();
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = AIService.getInstance();
    const instance2 = AIService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should have providers configured', () => {
    const providers = aiService.getAvailableProviders();
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should estimate cost correctly', () => {
    const cost = aiService.estimateCost('gpt-4-medical', 2);
    expect(cost).toBe(0.06); // 0.03 * 2
  });

  it('should log operations', async () => {
    // Configurar mocks
    vi.mocked(cacheService.get).mockResolvedValue(null);
    vi.mocked(cacheService.set).mockResolvedValue(undefined);

    // Realizar operación que genere logs
    await aiService.query({
      query: 'test query',
    });

    // Verificar logs
    const logs = aiService.getLogs();
    expect(logs.length).toBeGreaterThan(0);

    // Verificar logs de info
    const infoLogs = aiService.getLogs('info');
    expect(infoLogs.length).toBeGreaterThan(0);
    expect(infoLogs[0].level).toBe('info');
  });

  it('should detect contradictions in medical data', async () => {
    // Datos de prueba
    const emrData: EMRData = {
      patientId: 'test123',
      medicalHistory: [
        {
          date: '2023-01-01',
          type: 'note',
          description: 'Initial consultation',
        },
      ],
      medications: [
        { name: 'Medication A', dosage: '10mg', frequency: 'daily' },
      ],
      vitalSigns: [],
    };

    const notes: UnstructuredNote[] = [
      {
        content: 'Patient reports taking Medication B',
        timestamp: '2023-01-02',
        author: 'Dr. Smith',
        type: 'consultation',
        medications: ['Medication B'],
      },
    ];

    // Configurar mocks
    vi.mocked(cacheService.get).mockResolvedValue(null);
    vi.mocked(cacheService.set).mockResolvedValue(undefined);
    vi.spyOn(
      aiService as unknown as AIServiceInternals,
      'getEMRData'
    ).mockResolvedValue(emrData);
    vi.spyOn(
      aiService as unknown as AIServiceInternals,
      'generateSimulatedResponse'
    ).mockResolvedValue({
      answer: 'Test response',
      confidence: 0.9,
    });

    // Ejecutar
    const result = await aiService.analyzeUnstructuredNotes('test123', notes);

    // Verificar
    expect(result).toBeDefined();
    expect(result.insights).toBeDefined();
    // Debería haber detectado la contradicción del medicamento
    expect(
      result.insights?.some((insight) => insight.type === 'contradiction')
    ).toBe(true);
  });

  it('should retry operations on failure', async () => {
    // Mock de una operación que falla y luego tiene éxito
    const mockOperation = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { test: 'success' } });

    // Ejecutar método con reintentos
    const result = await (
      aiService as unknown as AIServiceInternals
    ).executeWithRetry(mockOperation);

    // Verificar
    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: { test: 'success' } });
  });

  it('should throw AIServiceError on unrecoverable errors', async () => {
    // Mockear el método generateSimulatedResponse para que lance un error
    vi.spyOn(
      aiService as unknown as AIServiceInternals,
      'generateSimulatedResponse'
    ).mockRejectedValue(new Error('Simulated API error'));

    // Verificar que se lanza AIServiceError
    await expect(
      aiService.analyzeEMRData({
        patientId: 'test123',
        medicalHistory: [],
        medications: [],
        vitalSigns: [],
      })
    ).rejects.toBeInstanceOf(AIServiceError);
  });
});
