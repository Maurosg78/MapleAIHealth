/**
import {
   render, screen 
} from "@testing-library/react"; * Configuración global para los tests con Jest
 */

// Aumentamos el timeout para pruebas asíncronas
jest.setTimeout(10000);

// Mock global para localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

// Configurar localStorage global para pruebas
global.localStorage = new LocalStorageMock() as unknown as Storage;

// Asegurarse de que fetch esté disponible
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {
      get: jest.fn(),
      forEach: jest.fn(),
      has: jest.fn(),
    },
  } as Response)
) as jest.Mock;
