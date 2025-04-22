import { interactionService } from '../InteractionService';
import { User } from '../../../models/User';

describe('InteractionService', () => {
  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // Limpiar interacciones antes de cada prueba
    jest.clearAllMocks();
  });

  describe('logInteraction', () => {
    it('debería registrar una interacción exitosa', async () => {
      await interactionService.logInteraction(
        mockUser,
        'view',
        'patient_details',
        'view_patient',
        { patientId: 'test-patient-id' }
      );

      const interactions = await interactionService.getUserInteractions(mockUser.id);
      expect(interactions).toHaveLength(1);
      expect(interactions[0]).toMatchObject({
        userId: mockUser.id,
        type: 'view',
        module: 'patient_details',
        action: 'view_patient',
        success: true
      });
    });

    it('debería registrar una interacción fallida', async () => {
      const errorDetails = 'Error de prueba';
      await interactionService.logInteraction(
        mockUser,
        'update',
        'patient_details',
        'update_patient',
        { patientId: 'test-patient-id' },
        false,
        errorDetails
      );

      const interactions = await interactionService.getUserInteractions(mockUser.id);
      expect(interactions[0]).toMatchObject({
        success: false,
        errorDetails
      });
    });
  });

  describe('getInteractionStats', () => {
    it('debería calcular estadísticas correctamente', async () => {
      // Registrar algunas interacciones de prueba
      await interactionService.logInteraction(
        mockUser,
        'view',
        'patient_details',
        'view_patient',
        { patientId: 'test-patient-id' }
      );

      await interactionService.logInteraction(
        mockUser,
        'update',
        'patient_details',
        'update_patient',
        { patientId: 'test-patient-id' }
      );

      const stats = await interactionService.getInteractionStats('day');
      
      expect(stats).toHaveProperty('totalInteractions');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('moduleBreakdown');
      expect(stats).toHaveProperty('typeBreakdown');
      expect(stats.totalInteractions).toBe(2);
      expect(stats.successRate).toBe(100);
    });
  });

  describe('getPatientEngagementMetrics', () => {
    it('debería calcular métricas de engagement', async () => {
      const patientId = 'test-patient-id';
      
      await interactionService.logInteraction(
        mockUser,
        'view',
        'patient_details',
        'view_patient',
        { patientId }
      );

      const metrics = await interactionService.getPatientEngagementMetrics(patientId);
      
      expect(metrics).toHaveProperty('totalInteractions');
      expect(metrics).toHaveProperty('lastInteraction');
      expect(metrics).toHaveProperty('averageSessionDuration');
      expect(metrics).toHaveProperty('commonActions');
      expect(metrics.totalInteractions).toBeGreaterThan(0);
    });
  });
}); 