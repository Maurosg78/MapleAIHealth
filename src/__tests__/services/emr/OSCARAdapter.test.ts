import { 
   render, screen 
 } from "@testing-library/react"
  oscarPatientData,
import { 
   HttpService 
 } from "../../../lib/api"
  oscarSearchResults,
import { 
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
    (adapter as unknown as { httpService: MockHttpService }).httpService = mockHttp;
  });

  describe('testConnection', () => {
    it('debería devolver true cuando la conexión es exitosa', async () => {
      // Preparamos el mock para simular una autenticación exitosa
      jest.spyOn(mockHttp, 'authenticateOscar').mockResolvedValue('mock-token');

      // Ejecutamos el método a probar


      // Verificamos el resultado
      expect(result).toBe(true);
      expect(mockHttp.authenticateOscar).toHaveBeenCalledWith(
        'testuser',
        'testpass'
      );
    });

    it('debería devolver false cuando falla la autenticación', async () => {
      // Preparamos el mock para simular un fallo en la autenticación
      jest.spyOn(mockHttp, 'authenticateOscar').mockRejectedValue(
        new Error('Credenciales inválidas')
      );

      // Ejecutamos el método a probar


      // Verificamos el resultado
      expect(result).toBe(false);
    });
  });

  describe('getPatientData', () => {
    it('debería obtener y convertir correctamente los datos del paciente', async () => {
      // Preparamos el mock para la autenticación
      jest.spyOn(mockHttp, 'authenticateOscar').mockResolvedValue('mock-token');
      // Preparamos el mock para la obtención de datos
      jest.spyOn(mockHttp, 'get').mockResolvedValue(oscarPatientData);

      // Ejecutamos el método a probar


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
      jest.spyOn(mockHttp, 'authenticateOscar').mockResolvedValue('mock-token');
      // Preparamos el mock para simular un error en la API
      jest.spyOn(mockHttp, 'get').mockRejectedValue(
        new Error('Error al obtener datos')
      );

      // Ejecutamos el método y verificamos que lance un error
      await expect(adapter.getPatientData('12345')).rejects.toThrow(
        'Error al obtener datos del paciente: Error al obtener datos'
      );
    });
  });

  describe('searchPatients', () => {
    it('debería devolver resultados de búsqueda de pacientes', async () => {
      httpServiceMock.get.and.returnValue(Promise.resolve({ data: { patients: [] } }));

      const results = await adapter.searchPatients({
        name: 'Juan',
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Si tenemos resultados, verificamos que cada resultado tenga los campos requeridos
      results.forEach((patient) => {
        expect(patient.id).toBeDefined();
        expect(patient.name).toBeDefined();
        expect(patient.birthDate).toBeDefined();
        expect(patient.gender).toBeDefined();
        expect(patient.mrn).toBeDefined();
      });
    });
  });

  describe('getPatientHistory', () => {
    it('debería obtener el historial médico completo del paciente', async () => {



      expect(history).toBeDefined();
      expect(history.patientId).toBe(patientId);
      expect(history.consultations).toBeDefined();
      expect(history.treatments).toBeDefined();

      // Verificamos los medicamentos con optional chaining
      if (history.medications && history.medications.length > 0) {
        expect(history.medications[0].name).toBeDefined();
        expect(history.medications[0].dosage).toBeDefined(); // Usamos dosage en lugar de dose
        expect(history.medications[0].frequency).toBeDefined();
      }
    });
  });

  describe('saveConsultation', () => {
    it('debería guardar una consulta correctamente', async () => {
      // Preparamos el mock para la autenticación
      jest.spyOn(mockHttp, 'authenticateOscar').mockResolvedValue('mock-token');
      // Preparamos el mock para la creación de la consulta
      jest.spyOn(mockHttp, 'post').mockResolvedValue({
        id: 'new-consultation-123',
        status: 'created',
      });

      // Datos de la consulta a guardar
      const consultation: EMRConsultation = {
        patientId: '12345',
        date: new Date('2023-10-15T11:30:00'),
        reason: 'Consulta de seguimiento',
        notes: 'El paciente muestra mejoría',
        diagnoses: [
          {
            code: 'J45.909',
            description: 'Asma no especificada',
            system: 'ICD-10',
            status: 'active'
          } as EMRDiagnosis,
        ],
      };

      // Ejecutamos el método a probar


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
    it('debería obtener las métricas de salud del paciente', async () => {

      const metrics = await adapter.getPatientMetrics(patientId, [
        'weight',
        'height',
        'bloodPressure',
      ]);

      expect(metrics).toBeDefined();
      expect(metrics.patientId).toBe(patientId);

      // Verificamos con optional chaining para evitar errores de tipo
      if (metrics.weightHistory && metrics.weightHistory.length > 0) {
        expect(metrics.weightHistory[0].value).toBeGreaterThan(0);
      }

      if (metrics.heightHistory && metrics.heightHistory.length > 0) {
        expect(metrics.heightHistory[0].value).toBeGreaterThan(0);
      }

      if (metrics.bloodPressureHistory && metrics.bloodPressureHistory.length > 0) {
        expect(metrics.bloodPressureHistory[0].systolic).toBeGreaterThan(0);
        expect(metrics.bloodPressureHistory[0].diastolic).toBeGreaterThan(0);
      }
    });
  });
});
