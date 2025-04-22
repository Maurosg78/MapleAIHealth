import { createLogger } from './logger.mjs';

export const runTerminalCmd = async (command) => {
  const logger = createLogger('Terminal');
  try {
    const { exec } = await import('child_process');
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Error ejecutando comando: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          logger.warn(`Advertencia: ${stderr}`);
        }
        logger.info(`Comando ejecutado: ${command}`);
        resolve(stdout);
      });
    });
  } catch (error) {
    logger.error(`Error al importar child_process: ${error.message}`);
    throw error;
  }
}; 