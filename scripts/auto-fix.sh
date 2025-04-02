#!/bin/bash

# Script para corregir automáticamente errores críticos
# Parte del sistema de vigilancia de errores

# Colores para terminal
RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW}    CORRECCIÓN AUTOMÁTICA DE ERRORES   ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Fecha: $(date)"
echo

# Directorio para guardar informes
REPORT_DIR="reports"
mkdir -p $REPORT_DIR
LOG_FILE="$REPORT_DIR/auto-fix-log.md"

# Crear archivo de log
echo "# 🔧 Log de Correcciones Automáticas" > $LOG_FILE
echo "" >> $LOG_FILE
echo "Fecha: $(date)" >> $LOG_FILE
echo "" >> $LOG_FILE
echo "## Correcciones realizadas" >> $LOG_FILE
echo "" >> $LOG_FILE

# Función para registrar acciones
log_action() {
  echo -e "$1"
  echo "- $1" >> $LOG_FILE
}

# Ejecutar ESLint con autofix para errores de formato
echo -e "${YELLOW}Corrigiendo errores de formato con ESLint...${NC}"
npx eslint src/ --fix

# Verificar resultado
if [ $? -eq 0 ]; then
  log_action "✅ Corregidos automáticamente errores de formato detectables por ESLint"
else
  log_action "⚠️ ESLint encontró errores que no pudieron ser corregidos automáticamente"
fi

# Corregir errores de espacio/tabulación consistentemente
echo -e "${YELLOW}Corrigiendo errores de espacios y tabulaciones...${NC}"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\t/  /g'

log_action "✅ Reemplazados tabuladores por espacios en archivos .ts y .tsx"

# Usar Prettier para formatear código
echo -e "${YELLOW}Formateando código con Prettier...${NC}"
npx prettier --write "src/**/*.{ts,tsx}" --loglevel error

if [ $? -eq 0 ]; then
  log_action "✅ Formateado código con Prettier"
else
  log_action "⚠️ Prettier encontró archivos que no pudieron ser formateados"
fi

# Corregir errores de variables no utilizadas
echo -e "${YELLOW}Corrigiendo variables no utilizadas...${NC}"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@typescript-eslint/no-unused-vars" | while read file; do
  log_action "🔍 Analizando variables no utilizadas en $file"

  # Buscar variables no utilizadas y añadir prefijo "_"
  VARS=$(grep -o "[a-zA-Z_][a-zA-Z0-9_]* is defined but never used" $file | grep -o "^[a-zA-Z_][a-zA-Z0-9_]*")

  for var in $VARS; do
    # Reemplazar solo si no empieza ya con "_"
    if [[ ! $var == _* ]]; then
      sed -i '' "s/\b$var\b/_$var/g" $file
      log_action "  ✓ Renombrada variable no utilizada '$var' a '_$var' en $file"
    fi
  done
done

# Ejecutar verificación de TypeScript para encontrar errores restantes
echo -e "${YELLOW}Verificando errores de TypeScript restantes...${NC}"
npx tsc --noEmit --pretty false > "$REPORT_DIR/typescript-errors-after-fix.txt" 2>&1

TS_ERRORS=$(grep -c "error TS" "$REPORT_DIR/typescript-errors-after-fix.txt" || echo 0)
log_action "ℹ️ Errores de TypeScript restantes después de correcciones automáticas: $TS_ERRORS"

# Generar informe estadístico
echo -e "${YELLOW}Generando informe de correcciones...${NC}"

# Ejecutar script de verificación de errores para obtener estado actualizado
./scripts/error-check.sh

echo -e "\n${YELLOW}=======================================${NC}"
echo -e "${YELLOW}     CORRECCIONES AUTOMÁTICAS COMPLETADAS     ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Log de correcciones guardado en: ${GREEN}$LOG_FILE${NC}"
echo

echo -e "${YELLOW}Pasos siguientes recomendados:${NC}"
echo -e "1. Revisar correcciones automáticas realizadas"
echo -e "2. Corregir manualmente los errores que no pudieron ser automatizados:"
echo -e "   - Interfaces incorrectas en ClinicCloudAdapter.ts"
echo -e "   - Problemas de importación en EMRPatientSearch.tsx"
echo -e "   - Errores de tipo en componentes específicos"
echo -e "3. Ejecutar nuevamente el script de verificación para validar mejoras"

echo -e "\n${YELLOW}=======================================${NC}"
