import { ClinicCloudAdapter } from '../../../services/emr/implementations/ClinicCloudAdapter';
import { MockHttpService } from './mocks/MockHttpService';
import {
  clinicCloudPatientData,
  clinicCloudSearchResults,
  clinicCloudPatientHistory,
  patientMetrics,
} from './mocks/MockEMRResponses';
import { EMRConsultation, EMRDiagnosis } from '../../../services/emr/EMRAdapter';

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

describe('ClinicCloudAdapter', () => {
  let adapter: ClinicCloudAdapter;
  let mockHttp: MockHttpService;

  // Configuración antes de cada test
  beforeEach(() => {
    // Creamos un mock del servicio HTTP
    mockHttp = new MockHttpService();

    // Creamos una instancia del adaptador con el mock
    adapter = new ClinicCloudAdapter({
      apiUrl: 'https://api.cliniccloud-test.es',
      apiKey: 'test-api-key-123',
      clinicId: 'clinica456',
    });

    // Reemplazamos el método httpService privado con nuestro mock
    // Usamos un tipo 'unknown' para evitar problemas de acceso a propiedades privadas
    (adapter as unknown as { httpService: MockHttpService }).httpService =
      mockHttp;
  });

  describe('testConnection', () => {
    it('debería devolver true cuando la conexión es exitosa', async () => {
      // Preparamos el mock para simular una autenticación exitosa
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockResolvedValue('mock-token');

      // Ejecutamos el método a probar
      const result = await adapter.testConnection();

      // Verificamos el resultado
      expect(result).toBe(true);
      expect(mockHttp.authenticateClinicCloud).toHaveBeenCalledWith(
        'test-api-key-123'
      );
    });

    it('debería devolver false cuando falla la autenticación', async () => {
      // Preparamos el mock para simular un fallo en la autenticación
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockRejectedValue(new Error('API Key inválida'));

      // Ejecutamos el método a probar
      const result = await adapter.testConnection();

      // Verificamos el resultado
      expect(result).toBe(false);
    });
  });

  describe('getPatientData', () => {
    it('debería obtener y convertir correctamente los datos del paciente', async () => {
      // Preparamos el mock para la autenticación
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockResolvedValue('mock-token');
      // Preparamos el mock para la obtención de datos
      jest.spyOn(mockHttp, 'get').mockResolvedValue(clinicCloudPatientData);

      // Ejecutamos el método a probar
      const patientData = await adapter.getPatientData('cc-67890');

      // Verificamos que se haya llamado correctamente al servicio HTTP
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://api.cliniccloud-test.es/paciente/cc-67890',
        'cliniccloud'
      );

      // Verificamos los datos convertidos
      expect(patientData).toEqual({
        id: 'cc-67890',
        fullName: 'Laura Sánchez Pérez',
        birthDate: '1988-11-24',
        gender: 'female',
        contactInfo: {
          email: 'laura.sanchez@example.es',
          phone: '634567890',
          address: {
            street: 'Calle Gran Vía 123',
            city: 'Madrid',
            state: 'Madrid',
            postalCode: '28013',
            country: 'España',
          },
        },
        identifiers: {
          mrn: 'CC-2023-1234',
          nationalId: {
            type: 'DNI',
            value: '87654321X',
          },
        },
      });
    });

    it('debería manejar errores al obtener datos del paciente', async () => {
      // Preparamos el mock para la autenticación
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockResolvedValue('mock-token');
      // Preparamos el mock para simular un error en la API
      jest
        .spyOn(mockHttp, 'get')
        .mockRejectedValue(new Error('Error al obtener datos'));

      // Ejecutamos el método y verificamos que lance un error
      await expect(adapter.getPatientData('cc-67890')).rejects.toThrow(
        'Error al obtener datos del paciente: Error al obtener datos'
      );
    });
  });

  describe('searchPatients', () => {
    it('debería buscar y convertir correctamente los resultados', async () => {
      // Preparamos el mock para la autenticación
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockResolvedValue('mock-token');
      // Preparamos el mock para la búsqueda
      jest.spyOn(mockHttp, 'get').mockResolvedValue(clinicCloudSearchResults);

      // Ejecutamos el método a probar
      const searchResults = await adapter.searchPatients(
        {
          name: 'Martín',
          documentId: 'X1234567Z',
        },
        10
      );

      // Verificamos que la URL de búsqueda sea correcta
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.cliniccloud-test.es/buscar'),
        'cliniccloud',
        expect.objectContaining({
          nombre: 'Martín',
          documento: 'X1234567Z',
          limite: '10',
        })
      );

      // Verificamos los resultados convertidos
      expect(searchResults.length).toBe(2);
      expect(searchResults[0].id).toBe('cc-67890');
      expect(searchResults[0].name).toBe('Laura Sánchez Pérez');
      expect(searchResults[0].birthDate).toBe('1988-11-24');
      expect(searchResults[0].gender).toBe('female');
      expect(searchResults[0].mrn).toBe('CC-2023-1234');
    });
  });

  describe('getPatientHistory', () => {
    it('debería obtener y convertir correctamente el historial médico', async () => {
      // Preparamos el mock para la autenticación
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockResolvedValue('mock-token');
      // Preparamos el mock para la obtención del historial
      jest.spyOn(mockHttp, 'get').mockResolvedValue(clinicCloudPatientHistory);

      // Opciones para el historial
      const options = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      // Ejecutamos el método a probar
      const history = await adapter.getPatientHistory('cc-67890', options);

      // Verificamos que la URL de obtención sea correcta
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.cliniccloud-test.es/historial/cc-67890'
        ),
        'cliniccloud',
        expect.objectContaining({
          fechaInicio: '2023-01-01',
          fechaFin: '2023-12-31',
        })
      );

      // Verificamos los datos convertidos
      expect(history).toHaveProperty('consultations');
      expect(history).toHaveProperty('medications');
      expect(history).toHaveProperty('allergies');
      expect(history).toHaveProperty('diagnosticTests');

      // Verificamos las consultas
      expect(history?.consultations?.length).toBe(2);
      expect(history?.consultations?.[0].id).toBe('cons-500');
      expect(history?.consultations?.[0].date).toBe('2023-09-15T16:00:00');
      expect(history?.consultations?.[0].reason).toBe('Dolor cervical');
      expect(history?.consultations?.[0].diagnoses?.length).toBe(1);
      expect(history?.consultations?.[0].diagnoses?.[0].code).toBe('M54.2');

      // Verificamos los medicamentos
      expect(history?.medications?.length).toBe(2);
      expect(history?.medications?.[0].name).toBe('Enantyum');
      expect(history?.medications?.[0].dosage).toBe('25mg');
    });
  });

  describe('saveConsultation', () => {
    it('debería guardar una consulta correctamente', async () => {
      // Preparamos el mock para la autenticación
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockResolvedValue('mock-token');
      // Preparamos el mock para la creación de la consulta
      jest
        .spyOn(mockHttp, 'post')
        .mockResolvedValue({ id: 'nueva-consulta-456', estado: 'creada' });

      // Datos de la consulta a guardar
      const consultation: EMRConsultation = {
        patientId: 'cc-67890',
        date: new Date('2023-11-20T16:30:00'),
        reason: 'Dolor en rodilla derecha',
        notes: 'Paciente refiere dolor en rodilla derecha tras caída',
        diagnoses: [
          {
            code: 'S83.6',
            description: 'Esguince de rodilla',
            system: 'ICD-10',
            status: 'active'
          } as EMRDiagnosis,
        ],
      };

      // Ejecutamos el método a probar
      const result = await adapter.saveConsultation(consultation);

      // Verificamos el resultado
      expect(result).toBeDefined();
      expect(mockHttp.post).toHaveBeenCalledWith(
        'https://api.cliniccloud-test.es/consulta',
        'cliniccloud',
        expect.objectContaining({
          pacienteId: 'cc-67890',
          fecha: expect.any(String),
          motivo: 'Dolor en rodilla derecha',
        })
      );
    });
  });

  describe('getPatientMetrics', () => {
    it('debería obtener y convertir correctamente las métricas', async () => {
      // Preparamos el mock para la autenticación
      jest
        .spyOn(mockHttp, 'authenticateClinicCloud')
        .mockResolvedValue('mock-token');
      // Preparamos el mock para la obtención de métricas
      jest.spyOn(mockHttp, 'get').mockResolvedValue(patientMetrics);

      // Ejecutamos el método a probar
      const metrics = await adapter.getPatientMetrics('cc-67890', [
        'peso',
        'altura',
        'tensionArterial',
      ]) as unknown as {
        weight: { value: number; unit: string };
        height: { value: number; unit: string };
        bloodPressure: { systolic: number; diastolic: number };
      };

      // Verificamos que la URL de obtención sea correcta
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.cliniccloud-test.es/metricas/cc-67890'
        ),
        'cliniccloud',
        expect.objectContaining({
          tipos: 'peso,altura,tensionArterial',
        })
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
