import monitorService, {
  ErrorMonitorService,
  ErrorSeverity,
  ErrorCategory,
  MonitoredError,
  captureException
} from './monitorService';

import lintingErrorService, {
  LintingErrorService,
  LintingErrorType,
  LintingErrorPriority,
  LintingError
} from './lintingErrorService';

// Exportar funciones y clases
export {
  // Monitor de errores general
  monitorService,
  ErrorMonitorService,
  captureException,

  // Servicio de errores de linting
  lintingErrorService,
  LintingErrorService
};

// Exportar tipos e interfaces
export type {
  ErrorSeverity,
  ErrorCategory,
  MonitoredError,

  LintingErrorType,
  LintingErrorPriority,
  LintingError
};

// Exportar instancias por defecto
export default {
  errorMonitor: monitorService,
  lintingErrors: lintingErrorService
};
