import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extiende las expectativas de Vitest con las de Testing Library
expect.extend(matchers);

// Limpia el DOM después de cada test
afterEach(() => {
    cleanup();
});
