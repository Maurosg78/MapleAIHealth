import { AIQuery, AIResponse } from './types';
import { Logger } from './logger';

/**
 * Interfaz para representar un elemento del historial de IA
 */
export interface AIHistoryItem {
  id: string;
  timestamp: number;
  query: AIQuery;
  response: AIResponse;
  userId?: string;
  patientId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  starred?: boolean;
}

/**
 * Opciones para filtrar el historial de consultas
 */
export interface AIHistoryFilterOptions {
  userId?: string;
  patientId?: string;
  sessionId?: string;
  tags?: string[];
  startDate?: number;
  endDate?: number;
  starred?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Estadísticas del historial de consultas
 */
export interface AIHistoryStats {
  totalQueries: number;
  queriesByUser: Record<string, number>;
  queriesByPatient: Record<string, number>;
  topQueries: Array<{query: string, count: number}>;
  queriesByDate: Record<string, number>;
  averageQueriesPerDay: number;
  lastQueryTimestamp: number;
}

/**
 * Servicio para gestionar el historial de consultas de IA
 * Implementa funcionalidades para almacenar, recuperar y analizar consultas previas
 */
export class AIHistoryService {
  private static instance: AIHistoryService;
  private logger: Logger;
  private history: AIHistoryItem[] = [];
  private maxHistorySize: number = 1000;
  private storageKey: string = 'ai_history';

  private constructor() {
    this.logger = new Logger('AIHistoryService');
    this.loadHistory();
    this.logger.info('AIHistoryService initialized');
  }

  /**
   * Obtiene la instancia única del servicio de historial
   */
  public static getInstance(): AIHistoryService {
    if (!AIHistoryService.instance) {
      AIHistoryService.instance = new AIHistoryService();
    }
    return AIHistoryService.instance;
  }

  /**
   * Añade una nueva consulta al historial
   * @param query Consulta realizada
   * @param response Respuesta obtenida
   * @param userId ID del usuario (opcional)
   * @param patientId ID del paciente (opcional)
   * @param metadata Metadatos adicionales (opcional)
   * @returns ID del elemento creado
   */
  public addToHistory(
    query: AIQuery,
    response: AIResponse,
    userId?: string,
    patientId?: string,
    metadata?: Record<string, unknown>
  ): string {
    const id = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();
    const sessionId = metadata?.sessionId as string || `session_${timestamp}`;

    const historyItem: AIHistoryItem = {
      id,
      timestamp,
      query,
      response,
      userId,
      patientId,
      sessionId,
      metadata,
      tags: this.generateTags(query, response),
      starred: false
    };

    this.history.unshift(historyItem);

    // Mantener el tamaño del historial controlado
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    this.saveHistory();
    this.logger.debug('Added new query to history', { id, query: typeof query === 'string' ? query : query.query });

    return id;
  }

  /**
   * Marca o desmarca un elemento del historial como destacado
   * @param id ID del elemento
   * @param starred Estado de destacado
   * @returns true si la operación fue exitosa
   */
  public toggleStarred(id: string, starred: boolean): boolean {
    const index = this.history.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }

    this.history[index].starred = starred;
    this.saveHistory();
    return true;
  }

  /**
   * Genera etiquetas automáticas basadas en la consulta y respuesta
   */
  private generateTags(query: AIQuery, response: AIResponse): string[] {
    const tags: string[] = [];
    const queryText = typeof query === 'string' ? query : query.query;

    // Etiquetas basadas en el tipo de consulta
    if (queryText.toLowerCase().includes('diagnos')) tags.push('diagnostic');
    if (queryText.toLowerCase().includes('medica')) tags.push('medication');
    if (queryText.toLowerCase().includes('tratamiento') || queryText.toLowerCase().includes('treatment')) tags.push('treatment');

    // Etiquetas basadas en la respuesta
    if (response.insights && response.insights.length > 0) tags.push('insights');
    if (response.recommendations && response.recommendations.length > 0) tags.push('recommendations');

    // Añadir ID de paciente como etiqueta si existe
    if (typeof query !== 'string' && query.patientId) {
      tags.push(`patient:${query.patientId}`);
    }

    return tags;
  }

  /**
   * Busca en el historial según filtros especificados
   * @param options Opciones de filtrado
   * @returns Array de elementos que coinciden con los filtros
   */
  public searchHistory(options: AIHistoryFilterOptions = {}): AIHistoryItem[] {
    let results = [...this.history];

    // Aplicar filtros
    if (options.userId) {
      results = results.filter(item => item.userId === options.userId);
    }

    if (options.patientId) {
      results = results.filter(item => item.patientId === options.patientId);
    }

    if (options.sessionId) {
      results = results.filter(item => item.sessionId === options.sessionId);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(item =>
        item.tags && options.tags?.some(tag => item.tags?.includes(tag))
      );
    }

    if (options.startDate) {
      results = results.filter(item => item.timestamp >= (options.startDate || 0));
    }

    if (options.endDate) {
      results = results.filter(item => item.timestamp <= (options.endDate || Date.now()));
    }

    if (options.starred !== undefined) {
      results = results.filter(item => item.starred === options.starred);
    }

    // Ordenar resultados
    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';

    results.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return sortOrder === 'asc'
          ? a.timestamp - b.timestamp
          : b.timestamp - a.timestamp;
      }
      // Implementación simple de relevancia (podría mejorarse)
      return sortOrder === 'asc' ?
        (a.tags?.length || 0) - (b.tags?.length || 0) :
        (b.tags?.length || 0) - (a.tags?.length || 0);
    });

    // Aplicar paginación
    if (options.offset || options.limit) {
      const offset = options.offset || 0;
      const limit = options.limit || results.length;
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  /**
   * Obtiene estadísticas del historial de consultas
   * @returns Estadísticas del historial
   */
  public getStats(): AIHistoryStats {
    // Mapeo para contar queries por usuario
    const queriesByUser: Record<string, number> = {};
    const queriesByPatient: Record<string, number> = {};
    const queriesByDate: Record<string, number> = {};
    const queriesCount: Record<string, number> = {};

    // Procesar cada elemento del historial
    this.history.forEach(item => {
      // Contar por usuario
      if (item.userId) {
        queriesByUser[item.userId] = (queriesByUser[item.userId] || 0) + 1;
      }

      // Contar por paciente
      if (item.patientId) {
        queriesByPatient[item.patientId] = (queriesByPatient[item.patientId] || 0) + 1;
      }

      // Contar por fecha (por día)
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      queriesByDate[date] = (queriesByDate[date] || 0) + 1;

      // Contar consultas más frecuentes
      const queryText = typeof item.query === 'string' ?
        item.query : item.query.query || '';

      // Simplificar la consulta para agrupar similares
      const simplifiedQuery = queryText
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50); // Limitar longitud

      if (simplifiedQuery) {
        queriesCount[simplifiedQuery] = (queriesCount[simplifiedQuery] || 0) + 1;
      }
    });

    // Obtener las consultas más frecuentes
    const topQueries = Object.entries(queriesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Calcular consultas promedio por día
    const days = Object.keys(queriesByDate).length || 1;
    const averageQueriesPerDay = this.history.length / days;

    return {
      totalQueries: this.history.length,
      queriesByUser,
      queriesByPatient,
      topQueries,
      queriesByDate,
      averageQueriesPerDay,
      lastQueryTimestamp: this.history[0]?.timestamp || 0
    };
  }

  /**
   * Elimina un elemento del historial
   * @param id ID del elemento a eliminar
   * @returns true si la operación fue exitosa
   */
  public deleteHistoryItem(id: string): boolean {
    const initialLength = this.history.length;
    this.history = this.history.filter(item => item.id !== id);

    if (this.history.length < initialLength) {
      this.saveHistory();
      this.logger.debug('Deleted history item', { id });
      return true;
    }

    return false;
  }

  /**
   * Borra todo el historial o filtra según criterios
   * @param filter Filtro opcional para borrado selectivo
   * @returns Número de elementos eliminados
   */
  public clearHistory(filter?: AIHistoryFilterOptions): number {
    if (!filter) {
      const count = this.history.length;
      this.history = [];
      this.saveHistory();
      this.logger.info('Cleared entire history', { count });
      return count;
    }

    // Borrado selectivo con filtros
    const itemsToKeep = this.searchHistory({
      userId: filter.userId ? undefined : '',
      patientId: filter.patientId ? undefined : '',
      sessionId: filter.sessionId ? undefined : '',
      tags: filter.tags,
      startDate: filter.startDate,
      endDate: filter.endDate,
      starred: filter.starred === true ? false : undefined,
    });

    const initialCount = this.history.length;
    this.history = itemsToKeep;
    this.saveHistory();

    const deletedCount = initialCount - this.history.length;
    this.logger.info('Cleared filtered history items', {
      deletedCount,
      remainingCount: this.history.length
    });

    return deletedCount;
  }

  /**
   * Guarda el historial en localStorage (en un entorno real sería en DB)
   */
  private saveHistory(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
      }
    } catch (error) {
      this.logger.error('Error saving history to storage', { error });
    }
  }

  /**
   * Carga el historial desde localStorage (en un entorno real sería desde DB)
   */
  private loadHistory(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedHistory = localStorage.getItem(this.storageKey);
        if (savedHistory) {
          this.history = JSON.parse(savedHistory);
          this.logger.info('Loaded history from storage', { count: this.history.length });
        }
      }
    } catch (error) {
      this.logger.error('Error loading history from storage', { error });
    }
  }

  /**
   * Obtiene sesiones únicas del historial
   * @returns Lista de IDs de sesión
   */
  public getSessions(): string[] {
    const sessions = new Set<string>();
    this.history.forEach(item => {
      if (item.sessionId) {
        sessions.add(item.sessionId);
      }
    });
    return Array.from(sessions);
  }
}

// Exportar instancia única del servicio
export const aiHistoryService = AIHistoryService.getInstance();
