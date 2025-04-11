import { aiHistoryService, AIHistoryService, AIHistoryItem } from '../aiHistoryService';
import { AIResponse } from '../types';

// Mock para localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string): string => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    clear: jest.fn((): void => {
      store = {};
    }),
    removeItem: jest.fn((key: string): void => {
      delete store[key];
    }),
    getAll: (): Record<string, string> => store
  };
})();

// Asignar mock a localStorage global
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AIHistoryService', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorageMock.clear();
    // Forzar reinicio de la instancia para pruebas aisladas
    (aiHistoryService as any).history = [];
  });

  // Datos de prueba
  const mockQuery = "¿Cuáles son los síntomas de la diabetes?";
  const mockResponse: AIResponse = {
    summary: "Los síntomas principales de la diabetes incluyen sed excesiva, micción frecuente, fatiga y visión borrosa.",
    insights: [
      {
        type: 'clinical-pattern',
        title: "Síntomas clásicos",
        description: "Polidipsia, poliuria, polifagia, y pérdida de peso",
        severity: 'medium'
      }
    ],
    recommendations: [
      {
        id: "rec1",
        content: "Realizar prueba de glucosa en ayunas",
        title: "Prueba diagnóstica",
        type: "test",
        confidence: 0.92
      }
    ]
  };

  test('debería agregar una consulta al historial', () => {
    // Acción
    const id = aiHistoryService.addToHistory(mockQuery, mockResponse, "user1", "patient1");

    // Obtener resultados
    const results = aiHistoryService.searchHistory();

    // Verificaciones
    expect(id).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].query).toBe(mockQuery);
    expect(results[0].response).toBe(mockResponse);
    expect(results[0].userId).toBe("user1");
    expect(results[0].patientId).toBe("patient1");
  });

  test('debería buscar en el historial con filtros', () => {
    // Preparación
    aiHistoryService.addToHistory(mockQuery, mockResponse, "user1", "patient1");
    aiHistoryService.addToHistory("Otra consulta", mockResponse, "user2", "patient2");
    aiHistoryService.addToHistory("Tercera consulta", mockResponse, "user1", "patient2");

    // Acciones
    const resultsByUser = aiHistoryService.searchHistory({ userId: "user1" });
    const resultsByPatient = aiHistoryService.searchHistory({ patientId: "patient2" });

    // Verificaciones
    expect(resultsByUser.length).toBe(2);
    expect(resultsByPatient.length).toBe(2);
  });

  test('debería marcar elementos como destacados', () => {
    // Preparación
    const id = aiHistoryService.addToHistory(mockQuery, mockResponse);

    // Acción
    const result = aiHistoryService.toggleStarred(id, true);
    const items = aiHistoryService.searchHistory({ starred: true });

    // Verificaciones
    expect(result).toBe(true);
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(id);
    expect(items[0].starred).toBe(true);
  });

  test('debería eliminar elementos del historial', () => {
    // Preparación
    const id = aiHistoryService.addToHistory(mockQuery, mockResponse);

    // Verificar que se agregó
    expect(aiHistoryService.searchHistory().length).toBe(1);

    // Acción
    const result = aiHistoryService.deleteHistoryItem(id);

    // Verificaciones
    expect(result).toBe(true);
    expect(aiHistoryService.searchHistory().length).toBe(0);
  });

  test('debería generar tags automáticamente', () => {
    // Preparación
    const diabetesQuery = "medicamento para diabetes";
    const id = aiHistoryService.addToHistory(diabetesQuery, mockResponse);

    // Acción
    const items = aiHistoryService.searchHistory();

    // Verificaciones
    expect(items[0].tags).toContain('medication');
  });

  test('debería ordenar resultados de búsqueda', () => {
    // Preparación - crear entradas con diferentes timestamps
    aiHistoryService.addToHistory("Consulta antigua", mockResponse);

    // Simular retraso
    jest.advanceTimersByTime(1000);

    aiHistoryService.addToHistory("Consulta reciente", mockResponse);

    // Acción
    const ascResults = aiHistoryService.searchHistory({ sortOrder: 'asc' });
    const descResults = aiHistoryService.searchHistory({ sortOrder: 'desc' });

    // Verificaciones
    expect(ascResults[0].query).toBe("Consulta antigua");
    expect(descResults[0].query).toBe("Consulta reciente");
  });

  test('debería generar estadísticas correctas', () => {
    // Preparación
    aiHistoryService.addToHistory(mockQuery, mockResponse, "user1", "patient1");
    aiHistoryService.addToHistory("Otra consulta", mockResponse, "user1", "patient2");
    aiHistoryService.addToHistory("Tercera consulta", mockResponse, "user2", "patient2");

    // Acción
    const stats = aiHistoryService.getStats();

    // Verificaciones
    expect(stats.totalQueries).toBe(3);
    expect(stats.queriesByUser['user1']).toBe(2);
    expect(stats.queriesByUser['user2']).toBe(1);
    expect(stats.queriesByPatient['patient1']).toBe(1);
    expect(stats.queriesByPatient['patient2']).toBe(2);
  });

  test('debería respetar el tamaño máximo del historial', () => {
    // Modificar tamaño máximo para la prueba
    (aiHistoryService as any).maxHistorySize = 3;

    // Agregar más elementos del máximo
    aiHistoryService.addToHistory("Consulta 1", mockResponse);
    aiHistoryService.addToHistory("Consulta 2", mockResponse);
    aiHistoryService.addToHistory("Consulta 3", mockResponse);
    aiHistoryService.addToHistory("Consulta 4", mockResponse);
    aiHistoryService.addToHistory("Consulta 5", mockResponse);

    // Verificación
    const results = aiHistoryService.searchHistory();
    expect(results.length).toBe(3);
    // Los más recientes deben mantenerse
    expect(results[0].query).toBe("Consulta 5");
    expect(results[1].query).toBe("Consulta 4");
    expect(results[2].query).toBe("Consulta 3");
  });
});
