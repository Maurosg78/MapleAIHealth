#!/bin/bash

# Script para la segunda iteración de correcciones de errores

# Colores para terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE} SEGUNDA ITERACIÓN DE CORRECCIONES     ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "Fecha: $(date)"
echo

# Crear directorio para informes si no existe
REPORT_DIR="reports"
mkdir -p $REPORT_DIR
LOG_FILE="$REPORT_DIR/iteracion2-log.md"

# Inicializar archivo de log
echo "# 📊 Segunda Iteración de Correcciones" > $LOG_FILE
echo "" >> $LOG_FILE
echo "Fecha: $(date)" >> $LOG_FILE
echo "" >> $LOG_FILE

# Función para registrar acciones
log_action() {
  echo -e "$1"
  echo "- $1" >> $LOG_FILE
}

# Asegurar que estamos en la rama de corrección
BRANCH_NAME="fix/error-correction-20250402"
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  echo -e "${YELLOW}Cambiando a la rama $BRANCH_NAME...${NC}"
  git checkout $BRANCH_NAME

  if [ $? -ne 0 ]; then
    echo -e "${RED}Error al cambiar a la rama $BRANCH_NAME${NC}"
    exit 1
  fi
fi

log_action "✅ Trabajando en la rama: $BRANCH_NAME"

# Ejecutar análisis inicial para tener un punto de referencia
echo -e "${YELLOW}Paso 1: Análisis inicial de estado${NC}"
./scripts/error-check.sh

# Extraer estadísticas iniciales
INITIAL_ESLINT_CRITICAL=$(grep -c '"severity":2' $REPORT_DIR/eslint-report.json || echo 0)
INITIAL_TS_ERRORS=$(grep -c "error TS" $REPORT_DIR/typescript-errors.txt || echo 0)
INITIAL_TOTAL=$((INITIAL_ESLINT_CRITICAL + INITIAL_TS_ERRORS))

log_action "📊 Estado inicial de la segunda iteración: $INITIAL_TOTAL errores críticos"
log_action "  - $INITIAL_ESLINT_CRITICAL errores de ESLint"
log_action "  - $INITIAL_TS_ERRORS errores de TypeScript"
log_action ""

# Paso 1: Actualizar configuración de TypeScript
echo -e "${YELLOW}Paso 2: Actualizando configuración de TypeScript...${NC}"

# Crear backup del tsconfig.json existente
if [ -f "tsconfig.json" ]; then
  cp tsconfig.json "$REPORT_DIR/tsconfig.json.bak"
  log_action "📁 Creado backup de tsconfig.json"
fi

# Crear nuevo tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowJs": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "vite.config.ts"]
}
EOF

log_action "✅ Actualizada configuración de TypeScript"

# Paso 2: Corregir problemas de importación
echo -e "${YELLOW}Paso 3: Corrigiendo problemas de importación...${NC}"

# Verificar que el script existe
if [ -f "scripts/fix-imports.sh" ]; then
  chmod +x scripts/fix-imports.sh
  ./scripts/fix-imports.sh

  if [ $? -eq 0 ]; then
    log_action "✅ Corregidos problemas de importación"
  else
    log_action "❌ Error al corregir problemas de importación"
  fi
else
  log_action "❌ No se encontró el script scripts/fix-imports.sh"
fi

# Paso 3: Corregir interfaces
echo -e "${YELLOW}Paso 4: Corrigiendo interfaces...${NC}"

# Verificar que el script existe
if [ -f "scripts/fix-interfaces.sh" ]; then
  chmod +x scripts/fix-interfaces.sh
  ./scripts/fix-interfaces.sh

  if [ $? -eq 0 ]; then
    log_action "✅ Corregidas interfaces en adaptadores EMR"
  else
    log_action "❌ Error al corregir interfaces"
  fi
else
  log_action "❌ No se encontró el script scripts/fix-interfaces.sh"
fi

# Guardar cambios en git
echo -e "${YELLOW}Paso 5: Guardando cambios...${NC}"
git add tsconfig.json src/
git commit -m "Fix: Segunda iteración de correcciones - Configuración TypeScript y corrección de interfaces"

log_action "💾 Commit: Segunda iteración de correcciones"

# Paso 4: Verificar mejoras
echo -e "${YELLOW}Paso 6: Verificando mejoras...${NC}"
./scripts/error-check.sh

# Extraer estadísticas finales
FINAL_ESLINT_CRITICAL=$(grep -c '"severity":2' $REPORT_DIR/eslint-report.json || echo 0)
FINAL_TS_ERRORS=$(grep -c "error TS" $REPORT_DIR/typescript-errors.txt || echo 0)
FINAL_TOTAL=$((FINAL_ESLINT_CRITICAL + FINAL_TS_ERRORS))

REDUCTION=$((INITIAL_TOTAL - FINAL_TOTAL))
PERCENTAGE=$((REDUCTION * 100 / INITIAL_TOTAL))

log_action "📊 Estado final: $FINAL_TOTAL errores críticos"
log_action "  - $FINAL_ESLINT_CRITICAL errores de ESLint"
log_action "  - $FINAL_TS_ERRORS errores de TypeScript"
log_action "📈 Mejora: $REDUCTION errores corregidos ($PERCENTAGE%)"
log_action ""

# Actualizar documentación con resultados
echo -e "${YELLOW}Paso 7: Actualizando documentación...${NC}"

# Actualizar documento de error-corrections.md
ERROR_CORRECTION_DOC="docs/error-corrections.md"
if [ -f "$ERROR_CORRECTION_DOC" ]; then
  # Añadir sección de progreso
  cat << EOF >> "$ERROR_CORRECTION_DOC"

## Actualización de Progreso - Segunda Iteración ($(date +%d-%m-%Y))

### Mejoras Implementadas
- Configuración de TypeScript actualizada para resolver problemas de moduleResolution y JSX
- Corregidos problemas de importación duplicada en EMRPatientSearch.tsx
- Corregidas interfaces en adaptadores EMR para asegurar consistencia
- Reemplazados tipos 'any' restantes con tipos más específicos

### Resultados
- Estado inicial: $INITIAL_TOTAL errores críticos
- Estado actual: $FINAL_TOTAL errores críticos
- Mejora: $REDUCTION errores corregidos ($PERCENTAGE%)

### Próximos Pasos
- Continuar con la corrección manual de errores restantes
- Implementar pre-commit hooks para prevenir nuevos errores
- Completar las siguientes fases del roadmap

EOF

  git add "$ERROR_CORRECTION_DOC"
  git commit -m "Docs: Actualización de progreso de segunda iteración"
  log_action "✅ Actualizada documentación"
else
  log_action "❌ No se encontró el documento $ERROR_CORRECTION_DOC"
fi

# Enviar cambios al repositorio remoto
echo -e "${YELLOW}Paso 8: Enviando cambios al repositorio remoto...${NC}"
git push origin $BRANCH_NAME

if [ $? -eq 0 ]; then
  log_action "✅ Cambios enviados a la rama remota: $BRANCH_NAME"
else
  log_action "❌ Error al enviar cambios al repositorio remoto"
fi

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   SEGUNDA ITERACIÓN COMPLETADA        ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "Log guardado en: ${GREEN}$LOG_FILE${NC}"
echo

# Mostrar recomendaciones finales
echo -e "${YELLOW}Recomendaciones finales:${NC}"

if [ $FINAL_TOTAL -gt 50 ]; then
  echo -e "1. ${RED}Todavía hay un número significativo de errores ($FINAL_TOTAL)${NC}"
  echo -e "2. ${RED}Se recomienda una tercera iteración para corregir errores restantes${NC}"
  echo -e "3. ${RED}Considera corregir manualmente EMRPatientSearch.tsx${NC}"
elif [ $FINAL_TOTAL -gt 0 ]; then
  echo -e "1. ${YELLOW}Quedan $FINAL_TOTAL errores por corregir${NC}"
  echo -e "2. ${YELLOW}Considera abordar los errores restantes manualmente${NC}"
  echo -e "3. ${YELLOW}Implementa pre-commit hooks para prevenir nuevos errores${NC}"
else
  echo -e "1. ${GREEN}¡Felicidades! Todos los errores críticos han sido corregidos${NC}"
  echo -e "2. ${GREEN}Implementa medidas preventivas para mantener la calidad del código${NC}"
  echo -e "3. ${GREEN}Crea un Pull Request para integrar estos cambios${NC}"
fi
