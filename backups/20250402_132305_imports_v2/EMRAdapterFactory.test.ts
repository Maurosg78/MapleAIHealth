import {
   render, screen 
} from '@testing-library/react'; // Creamos un mock de la clase Logger para evitar logs en los tests
import {
   HttpService 
} from '../../../lib/api';
jest.mock('../../../lib/logger', () => {
  return {
    Logger: jest.fn().mockImplementation(() => {
      return {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
    }),
  };
});

describe('EMRAdapterFactory', () => {
  beforeEach(() => {
    // Reseteamos el estado de la fábrica antes de cada test
    // Accedemos a un método protegido para tests
    (EMRAdapterFactory as unknown).resetForTests();
  });

  describe('getAdapter', () => {
    it('debería devolver un GenericEMRAdapter cuando se solicita GENERIC', () => {
      expect(adapter).toBeInstanceOf(GenericEMRAdapter);
    });

    it('debería devolver un OSCARAdapter cuando se solicita OSCAR', () => {
      const adapter = EMRAdapterFactory.getAdapter('OSCAR', {
        baseUrl: 'https://oscar-test.example.ca',
        username: 'testuser',
        password: 'testpass',
        clinicId: 'clinic123',
      });
      expect(adapter).toBeInstanceOf(OSCARAdapter);
    });

    it('debería devolver un ClinicCloudAdapter cuando se solicita CLINICCLOUD', () => {
      const adapter = EMRAdapterFactory.getAdapter('CLINICCLOUD', {
        apiUrl: 'https://api.cliniccloud-test.es',
        apiKey: 'test-api-key-123',
        clinicId: 'clinica456',
      });
      expect(adapter).toBeInstanceOf(ClinicCloudAdapter);
    });

    it('debería devolver un EPICAdapter cuando se solicita EPIC', () => {
      const adapter = EMRAdapterFactory.getAdapter('EPIC', {
        baseUrl: 'https://epic-fhir-api.example.org',
        apiKey: 'test-api-key',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      });
      expect(adapter).toBeInstanceOf(EPICAdapter);
    });

    it('debería lanzar un error cuando se solicita un adaptador desconocido', () => {
      expect(() => EMRAdapterFactory.getAdapter('UNKNOWN' as unknown)).toThrow(
        'Adaptador EMR no soportado: UNKNOWN'
      );
    });

    it('debería lanzar un error cuando faltan parámetros requeridos', () => {
      expect(() => EMRAdapterFactory.getAdapter('OSCAR', {})).toThrow(
        'Se requiere baseUrl para el adaptador OSCAR'
      );

      expect(() => EMRAdapterFactory.getAdapter('CLINICCLOUD', {})).toThrow(
        'Se requiere apiUrl y apiKey para el adaptador CLINICCLOUD'
      );

      expect(() => EMRAdapterFactory.getAdapter('EPIC', {})).toThrow(
        'Se requiere baseUrl para el adaptador EPIC'
      );
    });

    it('debería reutilizar instancias existentes para las mismas configuraciones', () => {
      const config = {
        baseUrl: 'https://oscar-test.example.ca',
        username: 'testuser',
        password: 'testpass',
        clinicId: 'clinic123',
      };

      expect(adapter1).toBe(adapter2); // Misma instancia
    });

    it('debería crear nuevas instancias para diferentes configuraciones', () => {
      const config1 = {
        baseUrl: 'https://oscar-test1.example.ca',
        username: 'testuser1',
        password: 'testpass1',
        clinicId: 'clinic123',
      };

      const config2 = {
        baseUrl: 'https://oscar-test2.example.ca',
        username: 'testuser2',
        password: 'testpass2',
        clinicId: 'clinic456',
      };

      expect(adapter1).not.toBe(adapter2); // Diferentes instancias
    });
  });

  describe('getAvailableAdapters', () => {
    it('debería devolver un array con los IDs de los adaptadores disponibles', () => {
      expect(adapters).toContain('GENERIC');
      expect(adapters).toContain('OSCAR');
      expect(adapters).toContain('CLINICCLOUD');
      expect(adapters).toContain('EPIC');
    });
  });

  describe('getAdaptersInfo', () => {
    it('debería devolver información detallada de los adaptadores disponibles', () => {
      expect(info.length).toBeGreaterThanOrEqual(4); // Al menos 4 adaptadores

      // Verificar que cada adaptador tiene la estructura correcta
      info.forEach((adapter) => {
        expect(adapter).toHaveProperty('id');
        expect(adapter).toHaveProperty('name');
        expect(adapter).toHaveProperty('description');
      });

      // Verificar que los adaptadores específicos existen
      expect(info.find((a) => a.id === 'GENERIC')).toBeDefined();
      expect(info.find((a) => a.id === 'OSCAR')).toBeDefined();
      expect(info.find((a) => a.id === 'CLINICCLOUD')).toBeDefined();
      expect(info.find((a) => a.id === 'EPIC')).toBeDefined();
    });
  });
});
