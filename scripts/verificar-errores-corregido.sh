#!/bin/bash

# Script mejorado para verificar errores críticos
set -e

echo "===== VERIFICACIÓN DE ERRORES CRÍTICOS ====="
echo "Fecha: $(date)"
echo "================================================"

# Crear directorio para informes
mkdir -p reports

# Archivo de informe
REPORT_FILE="reports/verificacion-$(date +"%Y%m%d_%H%M%S").log"

# Función para registrar mensajes
log() {
  echo "$1" | tee -a "$REPORT_FILE"
}

log "Iniciando verificación exhaustiva de errores..."

# 1. Verificar errores de TypeScript
log "\n===== ERRORES DE TYPESCRIPT ====="
if npm run type-check > /tmp/ts-check.log 2>&1; then
  log "✅ No se encontraron errores de TypeScript"
  TYPESCRIPT_ERRORS=0
else
  ERROR_COUNT=$(grep -c "error TS" /tmp/ts-check.log || echo "0")
  log "❌ Se encontraron $ERROR_COUNT errores de TypeScript"
  grep "error TS" /tmp/ts-check.log | head -10 >> "$REPORT_FILE"
  TYPESCRIPT_ERRORS=$ERROR_COUNT
fi

# 2. Verificar errores de ESLint
log "\n===== ERRORES DE ESLINT ====="
if npm run lint > /tmp/eslint.log 2>&1; then
  log "✅ No se encontraron errores de ESLint"
  ESLINT_ERRORS=0
else
  ERROR_COUNT=$(grep -c "error" /tmp/eslint.log || echo "0")
  WARNING_COUNT=$(grep -c "warning" /tmp/eslint.log || echo "0")
  log "⚠️ Se encontraron $ERROR_COUNT errores y $WARNING_COUNT advertencias de ESLint"
  grep -E "error|warning" /tmp/eslint.log | head -10 >> "$REPORT_FILE"
  ESLINT_ERRORS=$ERROR_COUNT
fi

# 3. Verificar que la aplicación puede compilarse
log "\n===== VERIFICACIÓN DE COMPILACIÓN ====="
if npm run build > /tmp/build.log 2>&1; then
  log "✅ La aplicación compila correctamente"
  BUILD_ERROR=0
else
  log "❌ Error al compilar la aplicación"
  tail -20 /tmp/build.log >> "$REPORT_FILE"
  BUILD_ERROR=1
fi

# Resumen de errores
log "\n===== RESUMEN DE ERRORES ====="
TOTAL_ERRORS=$((TYPESCRIPT_ERRORS + ESLINT_ERRORS + BUILD_ERROR))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
  log "🎉 ¡No se encontraron errores críticos en el código!"
  log "La aplicación está lista para seguir desarrollando."
else
  log "❌ Se encontraron $TOTAL_ERRORS errores críticos en total:"
  log "  - Errores de TypeScript: $TYPESCRIPT_ERRORS"
  log "  - Errores de ESLint: $ESLINT_ERRORS"
  log "  - Errores de compilación: $BUILD_ERROR"
fi

log "\nInforme completo disponible en: $REPORT_FILE"
echo "================================================"
