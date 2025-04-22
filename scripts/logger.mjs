export const createLogger = (name) => {
  return {
    info: (message, context = {}) => {
      console.log(`[${name}] INFO:`, message, context);
    },
    error: (message, error = null) => {
      console.error(`[${name}] ERROR:`, message, error);
    },
    warn: (message, context = {}) => {
      console.warn(`[${name}] WARN:`, message, context);
    },
    debug: (message, context = {}) => {
      console.debug(`[${name}] DEBUG:`, message, context);
    }
  };
}; 