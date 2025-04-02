#!/bin/bash

# Script para verificar y generar un informe de errores en el código
# Parte del sistema de vigilancia de errores

# Colores para terminal
RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW}    SISTEMA DE VIGILANCIA DE ERRORES   ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Fecha: $(date)"
echo

# Directorio para guardar informes
REPORT_DIR="reports"
mkdir -p $REPORT_DIR

# Nombres de archivos de informes
ESLINT_REPORT="$REPORT_DIR/eslint-report.json"
TS_REPORT="$REPORT_DIR/typescript-errors.txt"
SUMMARY_REPORT="$REPORT_DIR/error-summary.md"

echo -e "${YELLOW}Ejecutando análisis de código...${NC}"
echo

# Ejecutar ESLint y guardar resultados
echo -e "${YELLOW}Analizando con ESLint...${NC}"
npx eslint src/ --format json > $ESLINT_REPORT || echo "ESLint ejecutado con errores"

# Contar errores críticos e importantes de ESLint
ESLINT_CRITICAL=$(grep -c '"severity":2' $ESLINT_REPORT || echo 0)
ESLINT_IMPORTANT=$(grep -c '"severity":1' $ESLINT_REPORT || echo 0)

echo -e "ESLint encontró ${RED}$ESLINT_CRITICAL errores críticos${NC} y ${ORANGE}$ESLINT_IMPORTANT advertencias${NC}"

# Ejecutar TypeScript check y guardar resultados
echo -e "\n${YELLOW}Verificando tipos con TypeScript...${NC}"
npx tsc --noEmit --pretty false > $TS_REPORT 2>&1 || echo "TypeScript ejecutado con errores"

# Contar errores de TypeScript
TS_ERRORS=$(grep -c "error TS" $TS_REPORT || echo 0)
echo -e "TypeScript encontró ${RED}$TS_ERRORS errores de tipo${NC}"

# Categorizar errores de TypeScript
ANY_ERRORS=$(grep -c "TS7016\|TS7005\|TS7006\|no-explicit-any" $TS_REPORT $ESLINT_REPORT || echo 0)
NULL_ERRORS=$(grep -c "TS2531\|TS2532\|TS2533" $TS_REPORT || echo 0)
TYPE_ERRORS=$(grep -c "TS2322\|TS2345\|TS2339" $TS_REPORT || echo 0)

echo -e "- ${RED}Errores de tipo 'any':${NC} $ANY_ERRORS"
echo -e "- ${ORANGE}Errores de null/undefined:${NC} $NULL_ERRORS"
echo -e "- ${YELLOW}Errores de tipo incorrectos:${NC} $TYPE_ERRORS"

# Crear archivo de resumen
echo "# 📊 Reporte de Supervisión de Errores" > $SUMMARY_REPORT
echo "" >> $SUMMARY_REPORT
echo "Fecha: $(date)" >> $SUMMARY_REPORT
echo "" >> $SUMMARY_REPORT

echo "## Resumen de Errores" >> $SUMMARY_REPORT
echo "" >> $SUMMARY_REPORT
echo "| Categoría | Cantidad | Prioridad |" >> $SUMMARY_REPORT
echo "|-----------|----------|-----------|" >> $SUMMARY_REPORT
echo "| ESLint Errores | $ESLINT_CRITICAL | 🔴 Crítico |" >> $SUMMARY_REPORT
echo "| ESLint Warnings | $ESLINT_IMPORTANT | 🟠 Importante |" >> $SUMMARY_REPORT
echo "| TypeScript Errores | $TS_ERRORS | 🔴 Crítico |" >> $SUMMARY_REPORT

# Evaluar estado general
TOTAL_CRITICAL=$((ESLINT_CRITICAL + TS_ERRORS))

echo "" >> $SUMMARY_REPORT
if [ "$TOTAL_CRITICAL" -gt 50 ]; then
  echo "## ❌ Estado: Crítico" >> $SUMMARY_REPORT
  echo "El proyecto tiene un número elevado de errores críticos que deben ser corregidos inmediatamente." >> $SUMMARY_REPORT
  STATE="${RED}CRÍTICO${NC}"
elif [ "$TOTAL_CRITICAL" -gt 10 ]; then
  echo "## ⚠️ Estado: Atención Necesaria" >> $SUMMARY_REPORT
  echo "El proyecto tiene errores críticos que deben ser priorizados." >> $SUMMARY_REPORT
  STATE="${ORANGE}ATENCIÓN NECESARIA${NC}"
elif [ "$TOTAL_CRITICAL" -gt 0 ]; then
  echo "## 🟡 Estado: Vigilancia" >> $SUMMARY_REPORT
  echo "El proyecto tiene algunos errores críticos que deben ser resueltos pronto." >> $SUMMARY_REPORT
  STATE="${YELLOW}VIGILANCIA${NC}"
else
  echo "## ✅ Estado: Saludable" >> $SUMMARY_REPORT
  echo "El proyecto no tiene errores críticos." >> $SUMMARY_REPORT
  STATE="${GREEN}SALUDABLE${NC}"
fi

# Mostrar top 10 errores más comunes de ESLint
echo -e "\n${YELLOW}Top errores críticos de ESLint:${NC}"
grep '"severity":2' $ESLINT_REPORT | grep -o '"ruleId":"[^"]*"' | sort | uniq -c | sort -nr | head -10 || echo "No se encontraron errores críticos"

# Mostrar estado general
echo -e "\n${YELLOW}=======================================${NC}"
echo -e "${YELLOW}          ESTADO DEL PROYECTO           ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Estado: $STATE"
echo -e "Total errores críticos: ${RED}$TOTAL_CRITICAL${NC}"
echo -e "Reporte completo guardado en: ${GREEN}$SUMMARY_REPORT${NC}"

# Sugerir acciones basadas en el estado
echo -e "\n${YELLOW}Acciones recomendadas:${NC}"
if [ "$TOTAL_CRITICAL" -gt 50 ]; then
  echo -e "1. ${RED}Detener desarrollo de nuevas funcionalidades${NC}"
  echo -e "2. ${RED}Priorizar la corrección de errores críticos${NC}"
  echo -e "3. ${RED}Programar una revisión de código completa${NC}"
elif [ "$TOTAL_CRITICAL" -gt 10 ]; then
  echo -e "1. ${ORANGE}Asignar recursos para corregir errores críticos${NC}"
  echo -e "2. ${ORANGE}Incluir correcciones en el sprint actual${NC}"
  echo -e "3. ${ORANGE}Evitar que nuevos problemas críticos sean introducidos${NC}"
elif [ "$TOTAL_CRITICAL" -gt 0 ]; then
  echo -e "1. ${YELLOW}Planificar correcciones en los próximos días${NC}"
  echo -e "2. ${YELLOW}Revisar los patrones comunes de errores${NC}"
else
  echo -e "1. ${GREEN}Continuar con el desarrollo normal${NC}"
  echo -e "2. ${GREEN}Mantener las buenas prácticas actuales${NC}"
fi

echo -e "\n${YELLOW}=======================================${NC}"
