import { EMRAIIntegrationService } from '../EMRAIIntegrationService';
import { EMRConnectorFactory, EMRSystem } from '../../emr';
import { ClinicalCopilotService } from '../../ai/ClinicalCopilotService';
import { EvidenceEvaluationService } from '../../ai/EvidenceEvaluationService';

// Mock de dependencias
jest.mock('../../emr/EMRConnectorFactory');
jest.mock('../../ai/ClinicalCopilotService');
jest.mock('../../ai/EvidenceEvaluationService');

// Interfaz para el mock del conector EMR
interface MockEMRConnector {
  getPatientDemographics: jest.Mock;
  getPatientMedicalHistory: jest.Mock;
  getPatientConsultations: jest.Mock;
  getSystemName: jest.Mock;
  addPatientRecords: jest.Mock;
}

describe('EMRAIIntegrationService', () => {
  let service: EMRAIIntegrationService;
  let mockConnector: MockEMRConnector;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mocks
    mockConnector = {
      getPatientDemographics: jest.fn().mockResolvedValue({
        firstName: 'Juan',
        lastName: 'Pérez',
        birthDate: '1980-01-01'
      }),
      getPatientMedicalHistory: jest.fn().mockResolvedValue({
        conditions: [],
        allergies: [],
        medications: []
      }),
      getPatientConsultations: jest.fn().mockResolvedValue([]),
      getSystemName: jest.fn().mockReturnValue(EMRSystem.EPIC),
      addPatientRecords: jest.fn().mockResolvedValue(true)
    };

    (EMRConnectorFactory.getConnector as jest.Mock).mockReturnValue(mockConnector);

    // Mock del servicio ClinicalCopilot
    (ClinicalCopilotService.prototype.getSuggestions as jest.Mock).mockResolvedValue([
      {
        id: '1',
        title: 'Monitorear niveles de glucosa',
        description: 'Paciente con riesgo de diabetes',
        type: 'monitoring',
        confidence: 0.85
      },
      {
        id: '2',
        title: 'Recetar metformina',
        description: 'Control de glucemia',
        type: 'medication',
        confidence: 0.72
      }
    ]);

    // Mock del servicio de evidencia
    (EvidenceEvaluationService.prototype.getEvidenceForSuggestion as jest.Mock).mockResolvedValue({
      level: 'A',
      sources: [
        {
          id: 's1',
          title: 'Journal of Medical Research',
          authors: 'Smith et al.',
          year: 2022,
          verified: true,
          reliability: 'high'
        }
      ]
    });

    (EvidenceEvaluationService.prototype.getContraindications as jest.Mock).mockResolvedValue([
      'Insuficiencia renal'
    ]);

    // Inicializar servicio
    service = new EMRAIIntegrationService();
  });

  describe('getPatientEMRData', () => {
    it('debe obtener datos completos del paciente desde el EMR', async () => {
      const patientId = 'P12345';

      const result = await service.getPatientEMRData(patientId);

      expect(EMRConnectorFactory.getConnector).toHaveBeenCalled();
      expect(mockConnector.getPatientDemographics).toHaveBeenCalledWith(patientId);
      expect(mockConnector.getPatientMedicalHistory).toHaveBeenCalledWith(patientId);
      expect(mockConnector.getPatientConsultations).toHaveBeenCalledWith(patientId);

      expect(result).toEqual({
        patientId,
        demographics: expect.any(Object),
        medicalHistory: expect.any(Object),
        consultations: expect.any(Array),
        system: EMRSystem.EPIC
      });
    });

    it('debe permitir especificar el sistema EMR', async () => {
      const patientId = 'P12345';
      const emrSystem = EMRSystem.OSCAR;

      await service.getPatientEMRData(patientId, emrSystem);

      expect(EMRConnectorFactory.getConnector).toHaveBeenCalledWith(emrSystem);
    });

    it('debe manejar errores correctamente', async () => {
      const patientId = 'P12345';
      const errorMsg = 'Error de conexión';

      mockConnector.getPatientDemographics.mockRejectedValueOnce(new Error(errorMsg));

      await expect(service.getPatientEMRData(patientId))
        .rejects.toThrow(`Error obteniendo datos del paciente: ${errorMsg}`);
    });
  });

  describe('generatePatientRecommendations', () => {
    it('debe generar recomendaciones con datos del paciente', async () => {
      const patientId = 'P12345';

      const result = await service.generatePatientRecommendations(patientId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('title', 'Monitorear niveles de glucosa');
      expect(result[0]).toHaveProperty('evidenceLevel', 'A');
      expect(result[0]).toHaveProperty('sources');
      expect(result[0]).toHaveProperty('contraindications');
    });

    it('debe respetar las opciones de configuración', async () => {
      const patientId = 'P12345';

      await service.generatePatientRecommendations(patientId, {
        maxSuggestions: 3,
        minConfidence: 0.7,
        includeEvidence: true
      });

      expect(ClinicalCopilotService.prototype.getSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          maxSuggestions: 3,
          minConfidence: 0.7
        })
      );
    });

    it('no debe incluir evidencia si la opción está desactivada', async () => {
      const patientId = 'P12345';

      const result = await service.generatePatientRecommendations(patientId, {
        includeEvidence: false
      });

      expect(EvidenceEvaluationService.prototype.getEvidenceForSuggestion).not.toHaveBeenCalled();
      expect(result[0]).not.toHaveProperty('evidenceLevel');
      expect(result[0]).not.toHaveProperty('sources');
    });

    it('no debe incluir contraindicaciones si la opción está desactivada', async () => {
      const patientId = 'P12345';

      const result = await service.generatePatientRecommendations(patientId, {
        includeContraindications: false
      });

      expect(EvidenceEvaluationService.prototype.getContraindications).not.toHaveBeenCalled();
      expect(result[0]).not.toHaveProperty('contraindications');
    });
  });

  describe('syncAcceptedRecommendationsToEMR', () => {
    it('debe sincronizar recomendaciones aceptadas con el EMR', async () => {
      const patientId = 'P12345';
      const acceptedRecommendations = [
        {
          id: '1',
          title: 'Monitorear niveles de glucosa',
          description: 'Paciente con riesgo de diabetes',
          type: 'monitoring',
          confidence: 0.85,
          evidenceLevel: 'A'
        }
      ];

      const result = await service.syncAcceptedRecommendationsToEMR(
        patientId,
        acceptedRecommendations
      );

      expect(EMRConnectorFactory.getConnector).toHaveBeenCalled();
      expect(mockConnector.addPatientRecords).toHaveBeenCalledWith(
        patientId,
        expect.arrayContaining([
          expect.objectContaining({
            type: 'monitoring',
            description: expect.stringContaining('Monitorear niveles de glucosa'),
            source: 'AI_RECOMMENDATION'
          })
        ])
      );

      expect(result).toBe(true);
    });

    it('debe manejar errores correctamente', async () => {
      const patientId = 'P12345';
      const errorMsg = 'Error de sincronización';
      const acceptedRecommendations = [{ id: '1', title: 'Test', type: 'test', confidence: 0.8 }];

      mockConnector.addPatientRecords.mockRejectedValueOnce(new Error(errorMsg));

      await expect(service.syncAcceptedRecommendationsToEMR(patientId, acceptedRecommendations))
        .rejects.toThrow(`Error sincronizando recomendaciones: ${errorMsg}`);
    });
  });

  describe('getRecommendationStats', () => {
    it('debe devolver estadísticas de recomendaciones', async () => {
      const stats = await service.getRecommendationStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('accepted');
      expect(stats).toHaveProperty('rejected');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('acceptanceRate');
    });
  });
});
