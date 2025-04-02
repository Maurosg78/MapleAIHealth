import { OSCARAdapter } from '../../../services/emr/implementations/OSCARAdapter';
import { MockHttpService } from './mocks/MockHttpService';
import {
  oscarPatientData,
  oscarSearchResults,
  oscarPatientHistory,
  patientMetrics,
} from './mocks/MockEMRResponses';

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

describe('OSCARAdapter', () => {
  let adapter: OSCARAdapter;
  let mockHttp: MockHttpService;

  // Configuración antes de cada test
  beforeEach(() => {
    // Creamos un mock del servicio HTTP
    mockHttp = new MockHttpService();

    // Creamos una instancia del adaptador con el mock
    adapter = new OSCARAdapter({
      baseUrl: 'https://oscar-test.example.ca',
      username: 'testuser',
      password: 'testpass',
      clinicId: 'clinic123',
    });

    // Reemplazamos el método httpService privado con nuestro mock
    (adapter as any).httpService = mockHttp;
  });

  describe('testConnection', () => {
    it('debería devolver true cuando la conexión es exitosa', async () => {
      // Preparamos el mock para simular una autenticación exitosa
      spyOn(mockHttp, 'authenticateOscar').and.resolveTo('mock-token');

      // Ejecutamos el método a probar
      const result = await adapter.testConnection();

      // Verificamos el resultado
      expect(result).toBe(true);
      expect(mockHttp.authenticateOscar).toHaveBeenCalledWith(
        'testuser',
        'testpass'
      );
    });

    it('debería devolver false cuando falla la autenticación', async () => {
      // Preparamos el mock para simular un fallo en la autenticación
      spyOn(mockHttp, 'authenticateOscar').and.rejectWith(
        new Error('Credenciales inválidas')
      );

      // Ejecutamos el método a probar
      const result = await adapter.testConnection();

      // Verificamos el resultado
      expect(result).toBe(false);
    });
  });

  describe('getPatientData', () => {
    it('debería obtener y convertir correctamente los datos del paciente', async () => {
      // Preparamos el mock para la autenticación
      spyOn(mockHttp, 'authenticateOscar').and.resolveTo('mock-token');
      // Preparamos el mock para la obtención de datos
      spyOn(mockHttp, 'get').and.resolveTo(oscarPatientData);

      // Ejecutamos el método a probar
      const patientData = await adapter.getPatientData('12345');

      // Verificamos que se haya llamado correctamente al servicio HTTP
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://oscar-test.example.ca/demographic/12345',
        'oscar'
      );

      // Verificamos los datos convertidos
      expect(patientData).toEqual({
        id: '12345',
        fullName: 'Roberto García',
        birthDate: '1975-08-15',
        gender: 'male',
        contactInfo: {
          email: 'roberto.garcia@example.com',
          phone: '416-555-1234',
          address: {
            street: '123 Maple Street',
            city: 'Toronto',
            state: 'ON',
            postalCode: 'M5V 2N4',
            country: 'Canada',
          },
        },
        identifiers: {
          mrn: 'ONT123456789',
        },
      });
    });

    it('debería manejar errores al obtener datos del paciente', async () => {
      // Preparamos el mock para la autenticación
      spyOn(mockHttp, 'authenticateOscar').and.resolveTo('mock-token');
      // Preparamos el mock para simular un error en la API
      spyOn(mockHttp, 'get').and.rejectWith(
        new Error('Error al obtener datos')
      );

      // Ejecutamos el método y verificamos que lance un error
      await expectAsync(adapter.getPatientData('12345')).toBeRejectedWithError(
        'Error al obtener datos del paciente: Error al obtener datos'
      );
    });
  });

  describe('searchPatients', () => {
    it('debería buscar y convertir correctamente los resultados', async () => {
      // Preparamos el mock para la autenticación
      spyOn(mockHttp, 'authenticateOscar').and.resolveTo('mock-token');
      // Preparamos el mock para la búsqueda
      spyOn(mockHttp, 'get').and.resolveTo(oscarSearchResults);

      // Ejecutamos el método a probar
      const searchResults = await adapter.searchPatients(
        { name: 'García' },
        10
      );

      // Verificamos que la URL de búsqueda sea correcta
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://oscar-test.example.ca/search?name=García&limit=10',
        'oscar',
        { name: 'García', limit: '10' }
      );

      // Verificamos los resultados convertidos
      expect(searchResults.length).toBe(2);
      expect(searchResults[0].id).toBe('12345');
      expect(searchResults[0].name).toBe('Roberto García');
      expect(searchResults[0].birthDate).toBe('1975-08-15');
      expect(searchResults[0].gender).toBe('male');
      expect(searchResults[0].mrn).toBe('ONT123456789');
    });
  });

  describe('getPatientHistory', () => {
    it('debería obtener y convertir correctamente el historial médico', async () => {
      // Preparamos el mock para la autenticación
      spyOn(mockHttp, 'authenticateOscar').and.resolveTo('mock-token');
      // Preparamos el mock para la obtención del historial
      spyOn(mockHttp, 'get').and.resolveTo(oscarPatientHistory);

      // Opciones para el historial
      const options = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      // Ejecutamos el método a probar
      const history = await adapter.getPatientHistory('12345', options);

      // Verificamos que la URL de obtención sea correcta
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://oscar-test.example.ca/history/12345?startDate=2023-01-01&endDate=2023-12-31',
        'oscar',
        { startDate: '2023-01-01', endDate: '2023-12-31' }
      );

      // Verificamos los datos convertidos
      expect(history).toHaveProperty('consultations');
      expect(history).toHaveProperty('medications');
      expect(history).toHaveProperty('allergies');
      expect(history).toHaveProperty('diagnosticTests');

      // Verificamos las consultas
      expect(history.consultations.length).toBe(2);
      expect(history.consultations[0].id).toBe('enc_100');
      expect(history.consultations[0].date).toBe('2023-05-10T14:30:00');
      expect(history.consultations[0].diagnoses.length).toBe(1);
      expect(history.consultations[0].diagnoses[0].code).toBe('M54.5');

      // Verificamos los medicamentos
      expect(history.medications.length).toBe(2);
      expect(history.medications[0].name).toBe('Ibuprofeno');
      expect(history.medications[0].dose).toBe('400mg');
    });
  });

  describe('saveConsultation', () => {
    it('debería guardar una consulta correctamente', async () => {
      // Preparamos el mock para la autenticación
      spyOn(mockHttp, 'authenticateOscar').and.resolveTo('mock-token');
      // Preparamos el mock para la creación de la consulta
      spyOn(mockHttp, 'post').and.resolveTo({
        id: 'new-consultation-123',
        status: 'created',
      });

      // Datos de la consulta a guardar
      const consultation = {
        patientId: '12345',
        date: new Date('2023-10-15T11:30:00'),
        reason: 'Consulta de seguimiento',
        notes: 'El paciente muestra mejoría',
        diagnoses: [
          {
            code: 'J45.909',
            description: 'Asma no especificada',
          },
        ],
      };

      // Ejecutamos el método a probar
      const result = await adapter.saveConsultation(consultation);

      // Verificamos el resultado
      expect(result).toBe('new-consultation-123');
      expect(mockHttp.post).toHaveBeenCalledWith(
        'https://oscar-test.example.ca/consultation',
        'oscar',
        jasmine.any(Object)
      );
    });
  });

  describe('getPatientMetrics', () => {
    it('debería obtener y convertir correctamente las métricas', async () => {
      // Preparamos el mock para la autenticación
      spyOn(mockHttp, 'authenticateOscar').and.resolveTo('mock-token');
      // Preparamos el mock para la obtención de métricas
      spyOn(mockHttp, 'get').and.resolveTo(patientMetrics);

      // Ejecutamos el método a probar
      const metrics = await adapter.getPatientMetrics('12345', [
        'weight',
        'height',
        'bloodPressure',
      ]);

      // Verificamos que la URL de obtención sea correcta
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://oscar-test.example.ca/metrics/12345?types=weight,height,bloodPressure',
        'oscar',
        { types: 'weight,height,bloodPressure' }
      );

      // Verificamos los datos convertidos
      expect(metrics).toHaveProperty('weight');
      expect(metrics).toHaveProperty('height');
      expect(metrics).toHaveProperty('bloodPressure');

      expect(metrics.weight.value).toBe(75.5);
      expect(metrics.weight.unit).toBe('kg');
      expect(metrics.height.value).toBe(175);
      expect(metrics.height.unit).toBe('cm');
      expect(metrics.bloodPressure.systolic).toBe(120);
      expect(metrics.bloodPressure.diastolic).toBe(80);
    });
  });
});
