import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { EvidenceVisualizer } from '../EvidenceVisualizer';
import { CacheManagerFactory } from '../../services/cache/CacheManagerFactory';

// Mock del CacheManagerFactory
jest.mock('../../services/cache/CacheManagerFactory');

describe('EvidenceVisualizer', () => {
  const mockEvidence = {
    id: 'test-id',
    title: 'Test Evidence',
    summary: 'Test Summary',
    content: 'Test Content',
    source: 'Test Source',
    lastUpdated: '2024-05-24T00:00:00.000Z'
  };

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('muestra el indicador de carga inicialmente', () => {
    render(<EvidenceVisualizer evidenceId="test-id" />);
    expect(screen.getByLabelText('Cargando evidencia')).toBeInTheDocument();
  });

  it('muestra la evidencia cuando se carga correctamente', async () => {
    const mockGet = jest.fn().mockResolvedValue(mockEvidence);
    (CacheManagerFactory.getInstance as jest.Mock).mockReturnValue({
      get: mockGet,
      set: jest.fn()
    });

    render(<EvidenceVisualizer evidenceId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Test Evidence')).toBeInTheDocument();
      expect(screen.getByText('Test Summary')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('maneja correctamente los errores', async () => {
    const mockGet = jest.fn().mockRejectedValue(new Error('Test Error'));
    (CacheManagerFactory.getInstance as jest.Mock).mockReturnValue({
      get: mockGet,
      set: jest.fn()
    });

    const onError = jest.fn();
    render(<EvidenceVisualizer evidenceId="test-id" onError={onError} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo cargar la evidencia solicitada')).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('almacena en caché la evidencia cuando se obtiene de la API', async () => {
    const mockGet = jest.fn().mockResolvedValue(null);
    const mockSet = jest.fn();
    (CacheManagerFactory.getInstance as jest.Mock).mockReturnValue({
      get: mockGet,
      set: mockSet
    });

    // Mock de fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEvidence)
    });

    render(<EvidenceVisualizer evidenceId="test-id" patientId="patient-123" />);

    await waitFor(() => {
      expect(mockSet).toHaveBeenCalledWith(
        'test-id',
        mockEvidence,
        expect.objectContaining({
          patientId: 'patient-123',
          section: 'evidence-visualizer'
        })
      );
    });
  });
}); 