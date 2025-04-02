/**
import {
   HttpService 
} from "../../../lib/api"; * Tipo de error de linting
 */
export enum LintingErrorType {
  /** Errores de TypeScript */
  TYPESCRIPT = 'typescript',
  /** Errores de ESLint */
  ESLINT = 'eslint',
  /** Errores de SonarQube */
  SONAR = 'sonar',
  /** Errores de Prettier */
  PRETTIER = 'prettier',
  /** Errores de compilación */
  COMPILATION = 'compilation',
  /** Otros errores de linting */
  OTHER = 'other',
}

/**
 * Prioridad para atender errores de linting
 */
export enum LintingErrorPriority {
  /** Atender inmediatamente, bloquea el desarrollo */
  BLOCKER = 'blocker',
  /** Atender lo antes posible, afecta la calidad */
  CRITICAL = 'critical',
  /** Atender durante el sprint actual */
  MAJOR = 'major',
  /** Atender cuando sea conveniente */
  MINOR = 'minor',
  /** Informativo, no requiere acción inmediata */
  INFO = 'info',
}

/**
 * Estructura para representar un error de linting
 */
export interface LintingError {
  /** ID único del error de linting */
  id: string;
  /** Mensaje descriptivo del error */
  message: string;
  /** Código de regla que generó el error */
  rule: string;
  /** Tipo de error de linting */
  type: LintingErrorType;
  /** Prioridad para atender el error */
  priority: LintingErrorPriority;
  /** Archivo donde se encontró el error */
  file: string;
  /** Línea donde se encontró el error */
  line?: number;
  /** Columna donde se encontró el error */
  column?: number;
  /** Línea final del rango donde se encontró el error */
  endLine?: number;
  /** Columna final del rango donde se encontró el error */
  endColumn?: number;
  /** Fecha de detección del error */
  detectedAt: Date;
  /** Si el error bloquea la compilación */
  blocksCompilation: boolean;
  /** Si el error es solo estético */
  isStyleOnly: boolean;
  /** Sugerencia de cómo corregir el error */
  suggestion?: string;
  /** Si el error ha sido resuelto */
  resolved: boolean;
  /** Fecha en que se resolvió el error */
  resolvedAt?: Date;
  /** Usuario que resolvió el error */
  resolvedBy?: string;
  /** ID del monitor de error relacionado */
  monitorErrorId?: string;
}

/**
 * Mapeo de reglas de linting a prioridades y características
 */
const rulesPriorityMap: Record<
  string,
  {
    priority: LintingErrorPriority;
    blocksCompilation: boolean;
    isStyleOnly: boolean;
  }
> = {
  // TypeScript
  'typescript:S1854': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: false,
  }, // Dead store
  'typescript:S1172': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: false,
  }, // Unused parameter
  'typescript:S3358': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: true,
  }, // Nested ternary

  // ESLint
  'no-unused-vars': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: false,
  },
  'no-console': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: true,
  },
  'prefer-const': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: true,
  },

  // SonarQube
  'typescript:S6582': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: true,
  }, // Optional chaining
  'typescript:S6606': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: false,
  }, // Nullish coalescing
  'typescript:S6747': {
    priority: LintingErrorPriority.MINOR,
    blocksCompilation: false,
    isStyleOnly: true,
  }, // Unknown property

  // Errores de TypeScript que bloquean compilación
  TS2322: {
    priority: LintingErrorPriority.BLOCKER,
    blocksCompilation: true,
    isStyleOnly: false,
  }, // Type error
  TS2531: {
    priority: LintingErrorPriority.BLOCKER,
    blocksCompilation: true,
    isStyleOnly: false,
  }, // Object is possibly null
  TS2532: {
    priority: LintingErrorPriority.BLOCKER,
    blocksCompilation: true,
    isStyleOnly: false,
  }, // Object is possibly undefined
  TS2339: {
    priority: LintingErrorPriority.BLOCKER,
    blocksCompilation: true,
    isStyleOnly: false,
  }, // Property does not exist on type
};

/**
 * Servicio para gestionar y clasificar errores de linting
 */
export class LintingErrorService {
  private readonly logger: Logger;
  private lintingErrors: LintingError[] = [];
  private static instance: LintingErrorService;

  /**
   * Constructor privado para implementar patrón Singleton
   */
  private constructor() {
    this.logger = new Logger('LintingErrorService');
    this.logger.info('Servicio de gestión de errores de linting inicializado');
  }

  /**
   * Obtiene la instancia única del servicio (patrón Singleton)
   */
  public static getInstance(): LintingErrorService {
    if (!LintingErrorService.instance) {
      LintingErrorService.instance = new LintingErrorService();
    }
    return LintingErrorService.instance;
  }

  /**
   * Determina la prioridad de un error de linting basado en su código y tipo
   */
  private determinePriority(
    rule: string,
    type: LintingErrorType
  ): {
    priority: LintingErrorPriority;
    blocksCompilation: boolean;
    isStyleOnly: boolean;
  } {
    // Buscar configuración específica para esta regla

    if (ruleConfig) {
      return ruleConfig;
    }

    // Configuración por defecto basada en el tipo de error
    switch (type) {
      case LintingErrorType.TYPESCRIPT:
        return {
          priority: LintingErrorPriority.MAJOR,
          blocksCompilation: true,
          isStyleOnly: false,
        };
      case LintingErrorType.ESLINT:
        return {
          priority: LintingErrorPriority.MINOR,
          blocksCompilation: false,
          isStyleOnly: true,
        };
      case LintingErrorType.SONAR:
        return {
          priority: LintingErrorPriority.MINOR,
          blocksCompilation: false,
          isStyleOnly: true,
        };
      case LintingErrorType.PRETTIER:
        return {
          priority: LintingErrorPriority.INFO,
          blocksCompilation: false,
          isStyleOnly: true,
        };
      case LintingErrorType.COMPILATION:
        return {
          priority: LintingErrorPriority.BLOCKER,
          blocksCompilation: true,
          isStyleOnly: false,
        };
      default:
        return {
          priority: LintingErrorPriority.MINOR,
          blocksCompilation: false,
          isStyleOnly: false,
        };
    }
  }

  /**
   * Determina el equivalente de severidad para el monitor general
   */
  private mapPriorityToSeverity(priority: LintingErrorPriority): ErrorSeverity {
    switch (priority) {
      case LintingErrorPriority.BLOCKER:
        return ErrorSeverity.CRITICAL;
      case LintingErrorPriority.CRITICAL:
        return ErrorSeverity.HIGH;
      case LintingErrorPriority.MAJOR:
        return ErrorSeverity.MEDIUM;
      case LintingErrorPriority.MINOR:
        return ErrorSeverity.LOW;
      case LintingErrorPriority.INFO:
        return ErrorSeverity.INFO;
      default:
        return ErrorSeverity.LOW;
    }
  }

  /**
   * Registra un nuevo error de linting
   * @returns ID del error registrado
   */
  public captureError(error: {
    message: string;
    rule: string;
    type: LintingErrorType;
    file: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
    suggestion?: string;
  }): string {
    // Generar ID único para el error

    // Determinar prioridad y características
    const { priority, blocksCompilation, isStyleOnly } = this.determinePriority(
      error.rule,
      error.type
    );

    // Crear objeto de error
    const lintingError: LintingError = {
      id: errorId,
      message: error.message,
      rule: error.rule,
      type: error.type,
      priority,
      file: error.file,
      line: error.line,
      column: error.column,
      endLine: error.endLine,
      endColumn: error.endColumn,
      detectedAt: new Date(),
      blocksCompilation,
      isStyleOnly,
      suggestion: error.suggestion,
      resolved: false,
    };

    // Registrar el error
    this.lintingErrors.push(lintingError);

    // Registrar también en el monitor general para errores prioritarios
    if (
      priority === LintingErrorPriority.BLOCKER ||
      priority === LintingErrorPriority.CRITICAL ||
      blocksCompilation
    ) {
      const monitorErrorId = monitorService.captureError({
        message: `Error de linting: ${error.message}`,
        details: `Archivo: ${error.file}${error.line ? `, Línea: ${error.line}` : ''}
Regla: ${error.rule}
${error.suggestion ? `Sugerencia: ${error.suggestion}` : ''}`,
        category: ErrorCategory.VALIDATION,
        severity,
        component: 'Linting',
        path: error.file,
        code: error.rule,
      });

      // Guardar referencia al error en el monitor
      lintingError.monitorErrorId = monitorErrorId;
    }

    this.logger.info('Error de linting registrado', {
      errorId,
      rule: error.rule,
      file: error.file,
      priority,
      blocksCompilation,
    });

    return errorId;
  }

  /**
   * Marca un error de linting como resuelto
   */
  public resolveError(errorId: string, userId: string): boolean {
    if (!error) return false;

    error.resolved = true;
    error.resolvedAt = new Date();
    error.resolvedBy = userId;

    // Si el error está registrado en el monitor general, marcarlo como resuelto ahí también
    if (error.monitorErrorId) {
      monitorService.resolveError(error.monitorErrorId, userId, {
        notes: `Error de linting resuelto: ${error.rule}`,
      });
    }

    this.logger.info('Error de linting resuelto', { errorId, userId });
    return true;
  }

  /**
   * Obtiene todos los errores activos de linting
   */
  public getActiveErrors(): LintingError[] {
    return this.lintingErrors.filter((error) => !error.resolved);
  }

  /**
   * Obtiene errores filtrados por criterios
   */
  public getErrors(filters?: {
    type?: LintingErrorType;
    priority?: LintingErrorPriority;
    file?: string;
    rule?: string;
    blocksCompilation?: boolean;
    isStyleOnly?: boolean;
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): LintingError[] {
    let filteredErrors = [...this.lintingErrors];

    if (!filters) return filteredErrors;

    if (filters.type) {
      filteredErrors = filteredErrors.filter(
        (error) => error.type === filters.type
      );
    }

    if (filters.priority) {
      filteredErrors = filteredErrors.filter(
        (error) => error.priority === filters.priority
      );
    }

    if (filters.file) {
      filteredErrors = filteredErrors.filter((error) =>
        error.file.includes(filters.file!)
      );
    }

    if (filters.rule) {
      filteredErrors = filteredErrors.filter(
        (error) => error.rule === filters.rule
      );
    }

    if (filters.blocksCompilation !== undefined) {
      filteredErrors = filteredErrors.filter(
        (error) => error.blocksCompilation === filters.blocksCompilation
      );
    }

    if (filters.isStyleOnly !== undefined) {
      filteredErrors = filteredErrors.filter(
        (error) => error.isStyleOnly === filters.isStyleOnly
      );
    }

    if (filters.resolved !== undefined) {
      filteredErrors = filteredErrors.filter(
        (error) => error.resolved === filters.resolved
      );
    }

    if (filters.startDate) {
      filteredErrors = filteredErrors.filter(
        (error) => error.detectedAt >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredErrors = filteredErrors.filter(
        (error) => error.detectedAt <= filters.endDate!
      );
    }

    return filteredErrors;
  }

  /**
   * Obtiene estadísticas de errores de linting
   */
  public getErrorStats(): {
    total: number;
    active: number;
    byPriority: Record<LintingErrorPriority, number>;
    byType: Record<LintingErrorType, number>;
    blocksCompilation: number;
    styleOnly: number;
  } {
    const stats = {
      total: this.lintingErrors.length,
      active: activeErrors.length,
      byPriority: Object.values(LintingErrorPriority).reduce(
        (acc, priority) => {
          acc[priority] = activeErrors.filter(
            (e) => e.priority === priority
          ).length;
          return acc;
        },
        {} as Record<LintingErrorPriority, number>
      ),
      byType: Object.values(LintingErrorType).reduce(
        (acc, type) => {
          acc[type] = activeErrors.filter((e) => e.type === type).length;
          return acc;
        },
        {} as Record<LintingErrorType, number>
      ),
      blocksCompilation: activeErrors.filter((e) => e.blocksCompilation).length,
      styleOnly: activeErrors.filter((e) => e.isStyleOnly).length,
    };

    return stats;
  }

  /**
   * Importa errores de SonarQube desde un JSON
   */
  public importSonarQubeErrors(
    issues: Array<{
      resource: string;
      code: string;
      severity: number;
      message: string;
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    }>
  ): number {
    let importedCount = 0;

    for (const issue of issues) {
      // Extraer el nombre de archivo de la ruta completa

      // Capturar el error
      this.captureError({
        message: issue.message,
        rule: issue.code,
        type: LintingErrorType.SONAR,
        file,
        line: issue.startLineNumber,
        column: issue.startColumn,
        endLine: issue.endLineNumber,
        endColumn: issue.endColumn,
      });

      importedCount++;
    }

    this.logger.info(`Importados ${importedCount} errores de SonarQube`);
    return importedCount;
  }

  /**
   * Genera recomendaciones de cuáles errores abordar primero
   */
  public generateActionPlan(): {
    immediateAttention: LintingError[];
    highPriority: LintingError[];
    normalPriority: LintingError[];
    lowPriority: LintingError[];
  } {
    return {
      // Errores que bloquean la compilación o son BLOCKER
      immediateAttention: activeErrors.filter(
        (e) =>
          e.blocksCompilation || e.priority === LintingErrorPriority.BLOCKER
      ),

      // Errores CRITICAL que no bloquean compilación
      highPriority: activeErrors.filter(
        (e) =>
          !e.blocksCompilation && e.priority === LintingErrorPriority.CRITICAL
      ),

      // Errores MAJOR
      normalPriority: activeErrors.filter(
        (e) => e.priority === LintingErrorPriority.MAJOR
      ),

      // Errores MINOR o INFO que no son puramente estéticos
      lowPriority: activeErrors.filter(
        (e) =>
          (e.priority === LintingErrorPriority.MINOR ||
            e.priority === LintingErrorPriority.INFO) &&
          !e.isStyleOnly
      ),
    };
  }

  /**
   * Purga errores resueltos antiguos
   */
  public purgeOldResolvedErrors(olderThan: Date): number {
    this.lintingErrors = this.lintingErrors.filter(
      (error) =>
        !error.resolved || (error.resolvedAt && error.resolvedAt > olderThan)
    );

    if (purgedCount > 0) {
      this.logger.info(
        `Purgados ${purgedCount} errores de linting resueltos antiguos`
      );
    }

    return purgedCount;
  }
}

export default LintingErrorService.getInstance();
