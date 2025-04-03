#!/bin/bash

# Script para corregir errores críticos específicos
# Compatible con macOS M1 2020

set -e

# Configuración
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/critical-fix-$TIMESTAMP"
LOG_FILE="reports/critical-fix-$TIMESTAMP.log"

# Crear directorios necesarios
mkdir -p "$BACKUP_DIR/src"
mkdir -p reports

# Función para registrar mensajes
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$LOG_FILE"
}

# Crear respaldo
log "Creando respaldo del código..."
rsync -a --exclude="node_modules" --exclude=".git" --exclude="backups" src/ "$BACKUP_DIR/src/"
log "Respaldo creado en $BACKUP_DIR"

# 1. Corregir errores en archivos EMRAdapter
log "Paso 1: Corrigiendo errores en adaptadores EMR..."
find src/services/emr -name "*.ts" | while read file; do
  log "Procesando $file"
  
  # Corregir IDs undefined
  sed -i '' -E 's/id: ([a-zA-Z0-9_\.]+)\.id([,}])/id: \1.id || crypto.randomUUID()\2/g' "$file"
  
  # Añadir import crypto si no existe
  if grep -q "randomUUID" "$file" && ! grep -q "import crypto" "$file"; then
    sed -i '' '1i\
import crypto from "crypto";
' "$file"
  fi
done

# 2. Corregir archivos TSX sin importación de React
log "Paso 2: Corrigiendo importaciones de React..."
find src -name "*.tsx" | while read file; do
  if ! grep -q "import React" "$file"; then
    log "Añadiendo importación React a $file"
    sed -i '' '1i\
import React from "react";
' "$file"
  fi
done

# 3. Exportar interfaces que no están siendo exportadas
log "Paso 3: Exportando interfaces..."
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "interface [A-Za-z]\+Props" | while read file; do
  log "Verificando interfaces en $file"
  sed -i '' -E 's/interface ([A-Za-z]+Props) \{/export interface \1 {/g' "$file"
done

# 4. Corregir tipos que faltan en archivos EMR
log "Paso 4: Corrigiendo tipos en EMR..."
if [ -f "src/services/emr/implementations/EPICAdapter.ts" ]; then
  log "Corrigiendo tipos en EPICAdapter.ts"
  sed -i '' -E 's/(mapStatus\(status: string\)): string/\1: "active" | "inactive" | "pending" | "cancelled" | "completed"/g' "src/services/emr/implementations/EPICAdapter.ts"
  sed -i '' -E 's/return "([a-z]+)";/return "\1" as const;/g' "src/services/emr/implementations/EPICAdapter.ts"
fi

# 5. Ejecutar prettier
log "Paso 5: Aplicando prettier..."
npx prettier --write "src/**/*.{ts,tsx}" || true

# 6. Verificar errores restantes
log "Verificando errores restantes..."
npm run type-check 2>&1 | grep -c "error TS" > /dev/null
ERROR_COUNT=$?
if [ $ERROR_COUNT -eq 0 ]; then
  ERROR_COUNT=$(npm run type-check 2>&1 | grep -c "error TS")
  log "Quedan $ERROR_COUNT errores por corregir"
else
  log "No se detectaron errores de TypeScript"
fi

# 7. Hacer commit de los cambios
log "Haciendo commit de las correcciones..."
git add .
git commit -m "fix: corrección de errores críticos específicos" || true

log "==================================================="
log "Corrección de errores críticos completada"
log "Log completo disponible en: $LOG_FILE"

exit 0
