// Configuración adicional para pruebas
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock para objetos que no están disponibles en jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  // @ts-expect-error - El tipado de jest.fn() es complicado y fuera del ámbito principal
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 