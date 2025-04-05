#!/bin/bash

# Script maestro para ejecutar todas las correcciones de calidad
# Se ejecuta desde la raíz del proyecto

# Colores para la salida
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}${BOLD}======================================================${NC}"
echo -e "${BLUE}${BOLD}          CORRECCIÓN AUTOMÁTICA DE CALIDAD           ${NC}"
echo -e "${BLUE}${BOLD}======================================================${NC}"

# Asegurarse de que todos los scripts son ejecutables
echo -e "\n${YELLOW}Preparando scripts de corrección...${NC}"
chmod +x scripts/fix-console-logs.sh
chmod +x scripts/clean-backup-files.sh
chmod +x scripts/auto-cleanup.sh
chmod +x scripts/fix-quality-issues.sh
chmod +x scripts/performance-check.sh
chmod +x scripts/security-fix.sh

# Crear directorio de informes
mkdir -p reports
timestamp=$(date "+%Y%m%d_%H%M%S")
report_file="reports/quality_report_${timestamp}.txt"

echo "Informe de calidad del código - $(date)" > "$report_file"
echo "======================================================" >> "$report_file"

# Paso 1: Limpieza inicial básica
echo -e "\n${BLUE}${BOLD}[PASO 1/6] Limpieza inicial básica${NC}"
echo -e "${YELLOW}Eliminando archivos de respaldo y temporales...${NC}"
./scripts/auto-cleanup.sh | tee -a "$report_file"

# Paso 2: Análisis de rendimiento
echo -e "\n${BLUE}${BOLD}[PASO 2/6] Análisis de rendimiento${NC}"
echo -e "${YELLOW}Identificando problemas de rendimiento...${NC}"
./scripts/performance-check.sh | tee -a "$report_file"

# Paso 3: Correcciones de seguridad
echo -e "\n${BLUE}${BOLD}[PASO 3/6] Correcciones de seguridad${NC}"
echo -e "${YELLOW}Aplicando correcciones de seguridad...${NC}"
./scripts/security-fix.sh | tee -a "$report_file"

# Paso 4: Correcciones avanzadas de calidad
echo -e "\n${BLUE}${BOLD}[PASO 4/6] Correcciones avanzadas de calidad${NC}"
echo -e "${YELLOW}Aplicando correcciones avanzadas...${NC}"
./scripts/fix-quality-issues.sh | tee -a "$report_file"

# Paso 5: Linting final
echo -e "\n${BLUE}${BOLD}[PASO 5/6] Linting final${NC}"
echo -e "${YELLOW}Ejecutando ESLint y Prettier...${NC}"
npx eslint --fix src/ | tee -a "$report_file"
npx prettier --write "src/**/*.{ts,tsx}" | tee -a "$report_file"

# Paso 6: Verificación final
echo -e "\n${BLUE}${BOLD}[PASO 6/6] Verificación final${NC}"
echo -e "${YELLOW}Verificando errores restantes...${NC}"
lint_result=$(npx eslint --max-warnings=0 src/ 2>&1)
lint_exit_code=$?

if [ $lint_exit_code -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ No hay errores de linting restantes.${NC}" | tee -a "$report_file"
else
  echo -e "${RED}${BOLD}⚠️ Todavía quedan errores de linting:${NC}" | tee -a "$report_file"
  echo "$lint_result" | tee -a "$report_file"

  # Conteo de errores restantes
  errors_count=$(echo "$lint_result" | grep -c "error")
  warnings_count=$(echo "$lint_result" | grep -c "warning")

  echo -e "${YELLOW}Quedan ${RED}$errors_count${YELLOW} errores y ${RED}$warnings_count${YELLOW} advertencias.${NC}" | tee -a "$report_file"
fi

# Finalización y resumen
echo -e "\n${BLUE}${BOLD}======================================================${NC}"
echo -e "${BLUE}${BOLD}          CORRECCIÓN DE CALIDAD COMPLETADA           ${NC}"
echo -e "${BLUE}${BOLD}======================================================${NC}"

echo -e "\n${GREEN}${BOLD}Se ha generado un informe detallado en:${NC} ${BOLD}$report_file${NC}"
echo -e "${YELLOW}Por favor, revisa manualmente los cambios realizados y verifica que la aplicación sigue funcionando correctamente.${NC}"

# Calcular el total de archivos afectados
affected_files=$(grep -c "Corregido:" "$report_file")
echo -e "${GREEN}${BOLD}Total de archivos corregidos:${NC} ${BOLD}$affected_files${NC}"

# Sugerencias para verificación manual
echo -e "\n${YELLOW}${BOLD}RECOMENDACIONES ADICIONALES:${NC}"
echo -e "1. Ejecuta ${BOLD}npm test${NC} para verificar que las pruebas siguen pasando."
echo -e "2. Prueba manualmente la aplicación para asegurar que todos los cambios son correctos."
echo -e "3. Revisa el informe generado para ver detalles de todos los cambios realizados."
echo -e "4. Si encuentras problemas, considera revertir cambios específicos y reportarlos."
