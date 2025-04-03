#!/bin/bash

# Script para verificar si quedan errores críticos en el código
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
  log "$(grep "error TS" /tmp/ts-check.log | head -10)"
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
  log "$(grep -E "error|warning" /tmp/eslint.log | head -10)"
  ESLINT_ERRORS=$ERROR_COUNT
fi

# 3. Verificar errores de sintaxis JavaScript/TypeScript
log "\n===== ERRORES DE SINTAXIS ====="
SYNTAX_ERRORS=0
for file in $(find src -type f -name "*.ts" -o -name "*.tsx"); do
  if ! node --check "$file" > /dev/null 2>&1; then
    log "❌ Error de sintaxis en $file"
    node --check "$file" 2>&1 | head -3 >> "$REPORT_FILE"
    SYNTAX_ERRORS=$((SYNTAX_ERRORS + 1))
  fi
done

if [ "$SYNTAX_ERRORS" -eq 0 ]; then
  log "✅ No se encontraron errores de sintaxis"
fi

# 4. Verificar importaciones incorrectas
log "\n===== ERRORES DE IMPORTACIÓN ====="
IMPORT_ERRORS=0
for file in $(find src -type f -name "*.ts" -o -name "*.tsx"); do
  if grep -q "import.*from.*;" "$file" && grep -q "import " "$file" | grep -v "import.*from.*;" > /dev/null; then
    log "⚠️ Posible error de importación en $file"
    grep "import " "$file" | grep -v "import.*from.*;" | head -3 >> "$REPORT_FILE"
    IMPORT_ERRORS=$((IMPORT_ERRORS + 1))
  fi
done

if [ "$IMPORT_ERRORS" -eq 0 ]; then
  log "✅ No se encontraron errores de importación"
fi

# 5. Verificar que la aplicación puede compilarse
log "\n===== VERIFICACIÓN DE COMPILACIÓN ====="
if npm run build > /tmp/build.log 2>&1; then
  log "✅ La aplicación compila correctamente"
  BUILD_ERROR=0
else
  log "❌ Error al compilar la aplicación"
  cat /tmp/build.log | head -20 >> "$REPORT_FILE"
  BUILD_ERROR=1
fi

# Resumen de errores
log "\n===== RESUMEN DE ERRORES ====="
TOTAL_ERRORS=$((TYPESCRIPT_ERRORS + ESLINT_ERRORS + SYNTAX_ERRORS + IMPORT_ERRORS + BUILD_ERROR))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
  log "🎉 ¡No se encontraron errores críticos en el código!"
else
  log "❌ Se encontraron $TOTAL_ERRORS errores en total:"
  log "  - Errores de TypeScript: $TYPESCRIPT_ERRORS"
  log "  - Errores de ESLint: $ESLINT_ERRORS"
  log "  - Errores de sintaxis: $SYNTAX_ERRORS"
  log "  - Errores de importación: $IMPORT_ERRORS"
  log "  - Errores de compilación: $BUILD_ERROR"
fi

log "\nInforme completo disponible en: $REPORT_FILE"
echo "================================================"
