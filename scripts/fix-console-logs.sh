#!/bin/bash

# Script para reemplazar console.log con logger.debug
# Se ejecuta desde la raíz del proyecto

# Crear un servicio logger si no existe
if [ ! -f "src/services/logger.ts" ]; then
  echo "Creando archivo logger.ts..."
  mkdir -p src/services

  cat > src/services/logger.ts << 'EOL'
/**
 * Servicio de logging para la aplicación
 */

// Niveles de log
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Configuración global del logger
let currentLogLevel = LogLevel.INFO;
let enableConsoleOutput = process.env.NODE_ENV !== 'production';

// Establecer el nivel de log
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

// Habilitar o deshabilitar la salida por consola
export function setConsoleOutput(enable: boolean): void {
  enableConsoleOutput = enable;
}

// Método principal de logging
function log(level: LogLevel, message: string, ...args: any[]): void {
  // No hacer nada si el nivel actual es menor que el solicitado
  if (level > currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${LogLevel[level]}: ${message}`;

  // En producción, aquí se podría enviar a un servicio de log externo

  // Output por consola si está habilitado
  if (enableConsoleOutput) {
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.log(formattedMessage, ...args);
        break;
    }
  }
}

// Métodos de ayuda para cada nivel
export function error(message: string, ...args: any[]): void {
  log(LogLevel.ERROR, message, ...args);
}

export function warn(message: string, ...args: any[]): void {
  log(LogLevel.WARN, message, ...args);
}

export function info(message: string, ...args: any[]): void {
  log(LogLevel.INFO, message, ...args);
}

export function debug(message: string, ...args: any[]): void {
  log(LogLevel.DEBUG, message, ...args);
}

export function trace(message: string, ...args: any[]): void {
  log(LogLevel.TRACE, message, ...args);
}

// Exportar objeto logger
export const logger = {
  setLogLevel,
  setConsoleOutput,
  error,
  warn,
  info,
  debug,
  trace
};

// Exportación por defecto
export default logger;
EOL

  echo "Archivo logger.ts creado correctamente."
fi

# Función para procesar un archivo
process_file() {
  local file=$1
  local temp_file="${file}.temp"

  # Verificar el patrón de console.log
  if grep -q "console\.log" "$file"; then
    # Añadir la importación de logger si no existe
    if ! grep -q "import.*logger" "$file"; then
      # Conservar el primer bloque de comentarios si existe
      if head -n 20 "$file" | grep -q "/\*\*"; then
        # Encontrar dónde terminan los comentarios iniciales
        local comment_end_line=$(grep -n "\*/" "$file" | head -n 1 | cut -d: -f1)

        # Insertar la importación después de los comentarios
        head -n "$comment_end_line" "$file" > "$temp_file"
        echo "" >> "$temp_file"
        echo "import logger from '../../services/logger';" >> "$temp_file"
        tail -n +$((comment_end_line + 1)) "$file" >> "$temp_file"
      else
        # Si no hay comentarios, añadir al inicio
        echo "import logger from '../../services/logger';" > "$temp_file"
        cat "$file" >> "$temp_file"
      fi

      # Reemplazar la importación por la ruta correcta basada en la profundidad del archivo
      local depth=$(echo "$file" | tr '/' '\n' | grep -c .)
      local import_path=""

      # Calcular la ruta relativa correcta
      for ((i=0; i<depth-2; i++)); do
        import_path="../$import_path"
      done

      sed -i '' "s|../../services/logger|${import_path}services/logger|g" "$temp_file"
    else
      # Si ya existe la importación, solo copiar el archivo
      cp "$file" "$temp_file"
    fi

    # Reemplazar console.log con logger.debug
    sed -i '' 's/console\.log(/logger.debug(/g' "$temp_file"

    # Sustituir el archivo original
    mv "$temp_file" "$file"
    echo "Procesado: $file"
  fi
}

# Buscar todos los archivos TS y TSX en el directorio src
echo "Buscando archivos TS/TSX para procesar..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/dist/*" | while read file; do
  process_file "$file"
done

echo "¡Proceso completado!"
echo "Los console.log han sido reemplazados con logger.debug"
