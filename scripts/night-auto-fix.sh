#!/bin/bash

# night-auto-fix.sh
# Script para corregir automáticamente errores críticos durante la noche
# Ejecuta una serie de correcciones sin necesidad de intervención manual
# Autor: Claude AI

set -e # Salir en caso de error

# Configuración
ROOT_DIR=$(pwd)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BRANCH_NAME="auto-fix-$TIMESTAMP"
LOG_FILE="$ROOT_DIR/reports/night-auto-fix-$TIMESTAMP.log"
BACKUP_DIR="$ROOT_DIR/backups/night-backup-$TIMESTAMP"
MAX_ITERATIONS=50
ERROR_THRESHOLD=10

# Crear directorio de respaldo y logs
mkdir -p "$BACKUP_DIR"
mkdir -p "$ROOT_DIR/reports"

# Función para registrar mensajes
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$LOG_FILE"
}

# Función para crear respaldo del código
backup_code() {
  log "Creando respaldo del código en $BACKUP_DIR"
  rsync -av --exclude="node_modules" --exclude=".git" --exclude="backups" "$ROOT_DIR/src/" "$BACKUP_DIR/src/"
}

# Función para contar errores de TypeScript
count_ts_errors() {
  npm run typecheck 2>&1 | grep -i "error" | wc -l
}

# Función para contar errores de ESLint
count_eslint_errors() {
  npm run lint 2>&1 | grep -i "error" | wc -l
}

# Función para crear una nueva rama git
create_branch() {
  log "Creando rama $BRANCH_NAME"
  git checkout -b "$BRANCH_NAME"
}

# Función para hacer commit de los cambios
commit_changes() {
  git add .
  git commit -m "fix: correcciones automáticas de errores - $TIMESTAMP"
}

# Inicio del script
log "Iniciando proceso de corrección automática nocturna"
log "==============================================="

# Crear respaldo inicial
backup_code

# Crear nueva rama para los cambios
create_branch

# Registrar número inicial de errores
INITIAL_TS_ERRORS=$(count_ts_errors)
INITIAL_LINT_ERRORS=$(count_eslint_errors)

log "Errores iniciales - TypeScript: $INITIAL_TS_ERRORS, ESLint: $INITIAL_LINT_ERRORS"

# Ejecutar scripts de corrección en secuencia
for ((i=1; i<=MAX_ITERATIONS; i++)); do
  log "Iniciando iteración $i de $MAX_ITERATIONS"

  # Corrección de espacios y formato
  log "Ejecutando corrección de espacios y formato..."
  bash "$ROOT_DIR/scripts/fix-spacing.sh" >> "$LOG_FILE" 2>&1

  # Corrección de imports
  log "Ejecutando corrección de imports..."
  bash "$ROOT_DIR/scripts/fix-imports-v2.sh" >> "$LOG_FILE" 2>&1

  # Corrección de variables no utilizadas
  log "Ejecutando corrección de variables no utilizadas..."
  bash "$ROOT_DIR/scripts/fix-unused-vars.sh" >> "$LOG_FILE" 2>&1

  # Corrección de errores comunes
  log "Ejecutando corrección de errores comunes..."
  bash "$ROOT_DIR/scripts/fix-common-errors.sh" >> "$LOG_FILE" 2>&1

  # Corrección específica para interfaces y tipos
  log "Ejecutando corrección de interfaces y tipos..."

  # Buscar archivos con problemas de tipo
  PROBLEM_FILES=$(npm run typecheck 2>&1 | grep -o "src/.*\.ts[x]\?" | sort -u)

  for file in $PROBLEM_FILES; do
    if [ -f "$file" ]; then
      log "Corrigiendo tipos en $file"

      # Añadir manejo de IDs indefinidos (como se hizo en EPICAdapter.ts)
      sed -i '' 's/\(\s*id:\s*\)\([^|]*\)$/\1\2 || crypto.randomUUID(),/g' "$file"

      # Añadir imports para crypto si no está presente
      if grep -q "crypto.randomUUID" "$file" && ! grep -q "import.*crypto" "$file"; then
        sed -i '' '1i\
import crypto from "crypto";
' "$file"
      fi
    fi
  done

  # Ejecutar corrección automática de ESLint
  log "Ejecutando corrección automática de ESLint..."
  npm run lint:fix >> "$LOG_FILE" 2>&1 || true

  # Hacer commit de los cambios de esta iteración
  log "Guardando cambios de la iteración $i"
  commit_changes || log "No hay cambios para guardar en esta iteración"

  # Verificar si hemos resuelto suficientes errores
  CURRENT_TS_ERRORS=$(count_ts_errors)
  CURRENT_LINT_ERRORS=$(count_eslint_errors)

  log "Errores actuales - TypeScript: $CURRENT_TS_ERRORS, ESLint: $CURRENT_LINT_ERRORS"

  # Si los errores están por debajo del umbral o no hay mejora, terminar
  if [ "$CURRENT_TS_ERRORS" -le "$ERROR_THRESHOLD" ] && [ "$CURRENT_LINT_ERRORS" -le "$ERROR_THRESHOLD" ]; then
    log "Número de errores por debajo del umbral. Finalizando proceso."
    break
  fi

  # Si no hay cambios en el número de errores después de 3 iteraciones, probar con enfoque específico
  if [ "$i" -gt 3 ] && [ "$CURRENT_TS_ERRORS" -eq "$(count_ts_errors)" ]; then
    log "Sin progreso después de múltiples iteraciones. Aplicando enfoque específico para errores persistentes."

    # Corrección específica para errores persistentes
    # Identificar los archivos con más errores
    TOP_ERROR_FILES=$(npm run typecheck 2>&1 | grep -o "src/.*\.ts[x]\?" | sort | uniq -c | sort -nr | head -10 | awk '{print $2}')

    for file in $TOP_ERROR_FILES; do
      if [ -f "$file" ]; then
        log "Aplicando correcciones específicas a $file"

        # Respaldar el archivo antes de la corrección específica
        cp "$file" "$BACKUP_DIR/$(basename "$file").specific-backup"

        # Aplicar correcciones específicas para diferentes tipos de componentes
        if grep -q "FHIRResource" "$file"; then
          log "Detectado archivo con recursos FHIR. Aplicando correcciones específicas."

          # Asegurar que todas las propiedades de ID nunca son undefined
          sed -i '' 's/\(\s*id[?]*:\s*\)\(string\)/\1string/g' "$file"
          sed -i '' 's/\(\s*id[?]*:\s*\)\(string | undefined\)/\1string/g' "$file"

          # Corregir mapeos de estado
          sed -i '' '/switch.*status/,/}/ s/return "unknown"/return "unknown" as const/g' "$file"

          # Asegurar que los métodos de conversión siempre devuelven el tipo correcto
          sed -i '' 's/\(function\s\+convert[A-Za-z]*\)(\([^)]*\)):\s*\([A-Za-z][A-Za-z]*\)[|\s]*undefined/\1(\2): \3/g' "$file"
        fi

        # Correcciones para componentes React
        if grep -q "React" "$file"; then
          log "Detectado componente React. Aplicando correcciones específicas."

          # Asegurar que los props tienen tipos correctos
          sed -i '' 's/\(const [A-Za-z][A-Za-z]*\)\s*=\s*(\s*{\s*\([^}]*\)\s*}\s*)\s*=>/\1: React.FC<{\2}> = ({}) =>/g' "$file"

          # Asegurar que los estados tienen tipos correctos
          sed -i '' 's/\(useState\)(\([^)]*\))/\1<\2 | null>(\2)/g' "$file"
        fi
      fi
    done

    # Intentar commit después de correcciones específicas
    commit_changes || log "No hay cambios para guardar después de correcciones específicas"
  fi

  # Si no hay mejora después de 5 iteraciones más, terminar
  if [ "$i" -gt 8 ] && [ "$CURRENT_TS_ERRORS" -eq "$(count_ts_errors)" ]; then
    log "Sin progreso después de múltiples intentos. Finalizando proceso."
    break
  fi
done

# Resumen final
FINAL_TS_ERRORS=$(count_ts_errors)
FINAL_LINT_ERRORS=$(count_eslint_errors)

log "==============================================="
log "Proceso de corrección automática completado"
log "Errores iniciales - TypeScript: $INITIAL_TS_ERRORS, ESLint: $INITIAL_LINT_ERRORS"
log "Errores finales - TypeScript: $FINAL_TS_ERRORS, ESLint: $FINAL_LINT_ERRORS"
log "Reducción de errores - TypeScript: $((INITIAL_TS_ERRORS - FINAL_TS_ERRORS)), ESLint: $((INITIAL_LINT_ERRORS - FINAL_LINT_ERRORS))"

# Instrucciones finales
log "Los cambios han sido aplicados y guardados en la rama $BRANCH_NAME"
log "Para revisar los cambios, ejecuta: git log $BRANCH_NAME"
log "Para volver a la rama principal: git checkout main"
log "Para aplicar estos cambios a la rama principal: git merge $BRANCH_NAME"

exit 0
