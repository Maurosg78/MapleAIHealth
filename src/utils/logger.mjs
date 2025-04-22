const COLORS = {
  info: '\x1b[36m',    // Cyan
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  reset: '\x1b[0m'     // Reset
};

export function createLogger(module) {
  return {
    info: (...args) => {
      console.log(COLORS.info + `[${module}] INFO:`, ...args, COLORS.reset);
    },
    warn: (...args) => {
      console.warn(COLORS.warn + `[${module}] WARN:`, ...args, COLORS.reset);
    },
    error: (...args) => {
      console.error(COLORS.error + `[${module}] ERROR:`, ...args, COLORS.reset);
    }
  };
} 