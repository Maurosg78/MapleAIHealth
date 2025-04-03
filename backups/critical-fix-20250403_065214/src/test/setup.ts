// Extender los matchers de Vitest con los de @testing-library/jest-dom
expect.extend(matchers);
// Limpiar después de cada test
afterEach(() => {
  cleanup();
});
import '@testing-library/jest-dom';
