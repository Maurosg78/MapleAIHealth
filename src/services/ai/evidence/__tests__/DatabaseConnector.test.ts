import { EvidenceSource } from '../../types';

// Importamos la interfaz DatabaseConnector
interface DatabaseConnector {
  name: string;
  connect(): Promise<boolean>;
  search(query: string): Promise<unknown[]>;
  verify(source: EvidenceSource): Promise<{
    verified: boolean;
    reliability?: 'high' | 'moderate' | 'low' | 'unknown';
  }>;
}

// Creamos una implementación mock para testing
class MockDatabaseConnector implements DatabaseConnector {
  name: string;
  isConnected: boolean;
  shouldFailConnect: boolean;
  shouldFailSearch: boolean;
  shouldFailVerify: boolean;
  mockSearchResults: unknown[];
  mockVerificationResult: {
    verified: boolean;
    reliability?: 'high' | 'moderate' | 'low' | 'unknown';
  };

  constructor(name: string) {
    this.name = name;
    this.isConnected = false;
    this.shouldFailConnect = false;
    this.shouldFailSearch = false;
    this.shouldFailVerify = false;
    this.mockSearchResults = [];
    this.mockVerificationResult = { verified: false };
  }

  async connect(): Promise<boolean> {
    if (this.shouldFailConnect) {
      throw new Error(`Error connecting to ${this.name}`);
    }
    this.isConnected = true;
    return true;
  }

  async search(query: string): Promise<unknown[]> {
    if (this.shouldFailSearch) {
      throw new Error(`Error searching on ${this.name}: ${query}`);
    }
    if (!this.isConnected) {
      throw new Error(`Cannot search on ${this.name}: not connected`);
    }
    return this.mockSearchResults;
  }

  async verify(source: EvidenceSource): Promise<{
    verified: boolean;
    reliability?: 'high' | 'moderate' | 'low' | 'unknown';
  }> {
    if (this.shouldFailVerify) {
      throw new Error(`Error verifying source on ${this.name}: ${source.id}`);
    }
    if (!this.isConnected) {
      throw new Error(`Cannot verify on ${this.name}: not connected`);
    }
    return this.mockVerificationResult;
  }
}

describe('DatabaseConnector', () => {
  let pubmedConnector: MockDatabaseConnector;
  let cochraneConnector: MockDatabaseConnector;

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

  beforeEach(() => {
    // Inicializar los conectores para cada prueba
    pubmedConnector = new MockDatabaseConnector('PubMed');
    cochraneConnector = new MockDatabaseConnector('Cochrane Library');
  });

  describe('connect', () => {
    test('debería conectar exitosamente a la base de datos', async () => {
      const result = await pubmedConnector.connect();
      expect(result).toBe(true);
      expect(pubmedConnector.isConnected).toBe(true);
    });

    test('debería manejar errores de conexión', async () => {
      pubmedConnector.shouldFailConnect = true;
      await expect(pubmedConnector.connect()).rejects.toThrow('Error connecting');
      expect(pubmedConnector.isConnected).toBe(false);
    });
  });

  describe('search', () => {
    test('debería buscar resultados correctamente', async () => {
      // Configurar resultados de búsqueda mock
      const mockResults = [
        { id: 'result1', title: 'Research on diabetes' },
        { id: 'result2', title: 'Metformin clinical trial' }
      ];
      pubmedConnector.mockSearchResults = mockResults;

      // Conectar primero
      await pubmedConnector.connect();

      // Realizar búsqueda
      const results = await pubmedConnector.search('metformin diabetes');
      expect(results).toEqual(mockResults);
      expect(results.length).toBe(2);
    });

    test('debería fallar si no está conectado', async () => {
      // No conectamos
      await expect(pubmedConnector.search('metformin')).rejects.toThrow('not connected');
    });

    test('debería manejar errores de búsqueda', async () => {
      await pubmedConnector.connect();
      pubmedConnector.shouldFailSearch = true;
      await expect(pubmedConnector.search('metformin')).rejects.toThrow('Error searching');
    });
  });

  describe('verify', () => {
    test('debería verificar una fuente exitosamente', async () => {
      // Configurar verificación exitosa
      pubmedConnector.mockVerificationResult = {
        verified: true,
        reliability: 'high'
      };

      // Conectar primero
      await pubmedConnector.connect();

      // Verificar fuente
      const result = await pubmedConnector.verify(mockSource);
      expect(result.verified).toBe(true);
      expect(result.reliability).toBe('high');
    });

    test('debería fallar si no está conectado', async () => {
      // No conectamos
      await expect(pubmedConnector.verify(mockSource)).rejects.toThrow('not connected');
    });

    test('debería manejar errores de verificación', async () => {
      await pubmedConnector.connect();
      pubmedConnector.shouldFailVerify = true;
      await expect(pubmedConnector.verify(mockSource)).rejects.toThrow('Error verifying');
    });
  });

  describe('múltiples conectores', () => {
    test('debería funcionar con múltiples instancias independientes', async () => {
      // Configurar los conectores
      pubmedConnector.mockVerificationResult = {
        verified: true,
        reliability: 'high'
      };

      cochraneConnector.mockVerificationResult = {
        verified: true,
        reliability: 'moderate'
      };

      // Conectar ambos
      await pubmedConnector.connect();
      await cochraneConnector.connect();

      // Verificar fuente en ambos
      const pubmedResult = await pubmedConnector.verify(mockSource);
      const cochraneResult = await cochraneConnector.verify(mockSource);

      // Verificaciones
      expect(pubmedResult.verified).toBe(true);
      expect(pubmedResult.reliability).toBe('high');

      expect(cochraneResult.verified).toBe(true);
      expect(cochraneResult.reliability).toBe('moderate');
    });
  });
});
