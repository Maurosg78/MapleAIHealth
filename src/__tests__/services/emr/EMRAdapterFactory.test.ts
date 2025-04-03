import {
  EMRAdapterFactory,
  GenericEMRAdapter,
  OSCARAdapter,
  ClinicCloudAdapter,
  EPICAdapter,
} from '../../../services/emr';

// Mock de los adaptadores para pruebas
jest.mock('../../../services/emr/implementations/GenericEMRAdapter');
jest.mock('../../../services/emr/implementations/OSCARAdapter');
jest.mock('../../../services/emr/implementations/ClinicCloudAdapter');
jest.mock('../../../services/emr/implementations/EPICAdapter');

// Creamos un mock de la clase Logger para evitar logs en los tests
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
  let factory: EMRAdapterFactory;

  beforeEach(() => {
    factory = EMRAdapterFactory.getInstance();
    EMRAdapterFactory.resetForTests();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdapter', () => {
    it('debería devolver el adaptador genérico por defecto', () => {
      const adapter = factory.getAdapter('GENERIC');
      expect(adapter).toBeInstanceOf(GenericEMRAdapter);
    });

    it('debería devolver un OSCARAdapter cuando se solicita OSCAR', () => {
      const adapter = factory.getAdapter('OSCAR', {
        baseUrl: 'https://oscar-test.example.ca',
        username: 'testuser',
        password: 'testpass',
        clinicId: 'clinic123',
      });
      expect(adapter).toBeInstanceOf(OSCARAdapter);
    });

    it('debería devolver un ClinicCloudAdapter cuando se solicita CLINICCLOUD', () => {
      const adapter = factory.getAdapter('CLINICCLOUD', {
        apiUrl: 'https://api.cliniccloud-test.es',
        apiKey: 'test-api-key-123',
        clinicId: 'clinica456',
      });
      expect(adapter).toBeInstanceOf(ClinicCloudAdapter);
    });

    it('debería devolver un EPICAdapter cuando se solicita EPIC', () => {
      const adapter = factory.getAdapter('EPIC', {
        baseUrl: 'https://epic-fhir-api.example.org',
        apiKey: 'test-api-key',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      });
      expect(adapter).toBeInstanceOf(EPICAdapter);
    });

    it('debería lanzar un error para un adaptador desconocido', () => {
      expect(() => {
        factory.getAdapter('UNKNOWN' as string);
      }).toThrow('Adaptador EMR no soportado: UNKNOWN');
    });

    it('debería lanzar un error cuando faltan parámetros requeridos', () => {
      expect(() => factory.getAdapter('OSCAR', {})).toThrow(
        'Se requiere baseUrl para el adaptador OSCAR'
      );

      expect(() => factory.getAdapter('CLINICCLOUD', {})).toThrow(
        'Se requiere apiUrl y apiKey para el adaptador CLINICCLOUD'
      );

      expect(() => factory.getAdapter('EPIC', {})).toThrow(
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

      const adapter1 = factory.getAdapter('OSCAR', config);
      const adapter2 = factory.getAdapter('OSCAR', config);

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

      const adapter1 = factory.getAdapter('OSCAR', config1);
      const adapter2 = factory.getAdapter('OSCAR', config2);

      expect(adapter1).not.toBe(adapter2); // Diferentes instancias
    });
  });

  describe('getAvailableAdapters', () => {
    it('debería devolver una lista de adaptadores disponibles', () => {
      const adapters = factory.getAvailableAdapters();
      expect(adapters).toContain('GENERIC');
      expect(adapters).toContain('OSCAR');
      expect(adapters).toContain('CLINICCLOUD');
      expect(adapters).toContain('EPIC');
    });
  });

  describe('getAdaptersInfo', () => {
    it('debería devolver información sobre los adaptadores disponibles', () => {
      const info = factory.getAdaptersInfo();
      expect(info).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'GENERIC',
            name: expect.any(String),
            description: expect.any(String),
          }),
          expect.objectContaining({
            id: 'OSCAR',
            name: expect.any(String),
            description: expect.any(String),
          }),
          expect.objectContaining({
            id: 'CLINICCLOUD',
            name: expect.any(String),
            description: expect.any(String),
          }),
          expect.objectContaining({
            id: 'EPIC',
            name: expect.any(String),
            description: expect.any(String),
          }),
        ])
      );
    });
  });
});
