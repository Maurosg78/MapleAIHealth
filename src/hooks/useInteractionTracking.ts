import { useCallback } from 'react';
import { interactionService, InteractionType } from '../services/interactions/InteractionService';
import { useAuth } from './useAuth';

export const useInteractionTracking = (module: string) => {
  const { user } = useAuth();

  const trackInteraction = useCallback(
    async (
      type: InteractionType,
      action: string,
      details: {
        patientId?: string;
        resourceId?: string;
        metadata?: Record<string, unknown>;
      } = {},
      success: boolean = true,
      errorDetails?: string
    ) => {
      if (!user) {
        console.warn('No se puede registrar interacción: usuario no autenticado');
        return;
      }

      try {
        await interactionService.logInteraction(
          user,
          type,
          module,
          action,
          details,
          success,
          errorDetails
        );
      } catch (error) {
        console.error('Error al registrar interacción:', error);
      }
    },
    [user, module]
  );

  const trackView = useCallback(
    (resourceId?: string, patientId?: string) => {
      return trackInteraction('view', 'view_resource', { resourceId, patientId });
    },
    [trackInteraction]
  );

  const trackCreate = useCallback(
    (resourceId: string, patientId?: string, metadata?: Record<string, unknown>) => {
      return trackInteraction('create', 'create_resource', { resourceId, patientId, metadata });
    },
    [trackInteraction]
  );

  const trackUpdate = useCallback(
    (resourceId: string, patientId?: string, metadata?: Record<string, unknown>) => {
      return trackInteraction('update', 'update_resource', { resourceId, patientId, metadata });
    },
    [trackInteraction]
  );

  const trackDelete = useCallback(
    (resourceId: string, patientId?: string) => {
      return trackInteraction('delete', 'delete_resource', { resourceId, patientId });
    },
    [trackInteraction]
  );

  const trackSearch = useCallback(
    (query: string, results: number) => {
      return trackInteraction('search', 'search_resources', {
        metadata: { query, resultCount: results }
      });
    },
    [trackInteraction]
  );

  const trackFilter = useCallback(
    (filters: Record<string, unknown>) => {
      return trackInteraction('filter', 'apply_filters', {
        metadata: { filters }
      });
    },
    [trackInteraction]
  );

  const trackSort = useCallback(
    (field: string, order: 'asc' | 'desc') => {
      return trackInteraction('sort', 'sort_resources', {
        metadata: { field, order }
      });
    },
    [trackInteraction]
  );

  const trackExport = useCallback(
    (format: string, resourceIds: string[]) => {
      return trackInteraction('export', 'export_resources', {
        metadata: { format, resourceIds }
      });
    },
    [trackInteraction]
  );

  const trackPrint = useCallback(
    (resourceId: string, documentType: string) => {
      return trackInteraction('print', 'print_document', {
        resourceId,
        metadata: { documentType }
      });
    },
    [trackInteraction]
  );

  const trackAIAssist = useCallback(
    (query: string, successful: boolean, errorDetails?: string) => {
      return trackInteraction(
        'ai_assist',
        'ai_query',
        { metadata: { query } },
        successful,
        errorDetails
      );
    },
    [trackInteraction]
  );

  return {
    trackInteraction,
    trackView,
    trackCreate,
    trackUpdate,
    trackDelete,
    trackSearch,
    trackFilter,
    trackSort,
    trackExport,
    trackPrint,
    trackAIAssist
  };
}; 