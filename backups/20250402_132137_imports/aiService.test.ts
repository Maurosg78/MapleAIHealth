import { render, screen } from '@testing-library/react'; // Mock del cacheService
import { HttpService } from '../../../lib/api';
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
    expect(instance1).toBe(instance2);
  });

  it('should have providers configured', () => {
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should estimate cost correctly', () => {
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

    expect(logs.length).toBeGreaterThan(0);

    // Verificar logs de info

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
