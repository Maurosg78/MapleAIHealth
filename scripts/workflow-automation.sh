#!/bin/bash

# Script para automatizar el workflow completo de corrección de errores
# Ejecuta secuencialmente las herramientas necesarias y actualiza el progreso

# Colores para terminal
RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW} AUTOMATIZACIÓN DE CORRECCIÓN DE ERRORES ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Fecha: $(date)"
echo

# Directorio para guardar informes
REPORT_DIR="reports"
mkdir -p $REPORT_DIR
PROGRESS_FILE="$REPORT_DIR/progreso-correcciones.md"

# Inicializar archivo de progreso
echo "# 📊 Progreso de Corrección de Errores" > $PROGRESS_FILE
echo "" >> $PROGRESS_FILE
echo "Fecha de inicio: $(date)" >> $PROGRESS_FILE
echo "" >> $PROGRESS_FILE

# Función para actualizar progreso
update_progress() {
  echo -e "$1"
  echo -e "$1" >> $PROGRESS_FILE
}

# Crear una rama específica para correcciones
BRANCH_NAME="fix/error-correction-$(date +%Y%m%d)"
git checkout -b $BRANCH_NAME

update_progress "## Configuración Inicial"
update_progress "- ✅ Creada rama para correcciones: \`$BRANCH_NAME\`"
update_progress ""

# Paso 1: Análisis inicial
echo -e "${YELLOW}Paso 1: Análisis inicial de errores${NC}"
update_progress "## Paso 1: Análisis Inicial"

# Ejecutar análisis inicial
./scripts/error-check.sh

# Extraer estadísticas iniciales
INITIAL_ESLINT_CRITICAL=$(grep -c '"severity":2' $REPORT_DIR/eslint-report.json || echo 0)
INITIAL_TS_ERRORS=$(grep -c "error TS" $REPORT_DIR/typescript-errors.txt || echo 0)
INITIAL_TOTAL=$((INITIAL_ESLINT_CRITICAL + INITIAL_TS_ERRORS))

update_progress "- 📊 Estado inicial: $INITIAL_TOTAL errores críticos"
update_progress "  - $INITIAL_ESLINT_CRITICAL errores de ESLint"
update_progress "  - $INITIAL_TS_ERRORS errores de TypeScript"
update_progress ""

# Paso 2: Corrección automática de errores de formato
echo -e "${YELLOW}Paso 2: Corrección automática de errores de formato${NC}"
update_progress "## Paso 2: Corrección Automática de Errores de Formato"

# Ejecutar corrección automática
./scripts/auto-fix.sh

# Ejecutar análisis después de auto-fix
./scripts/error-check.sh

# Extraer estadísticas después de auto-fix
POST_AUTOFIX_ESLINT_CRITICAL=$(grep -c '"severity":2' $REPORT_DIR/eslint-report.json || echo 0)
POST_AUTOFIX_TS_ERRORS=$(grep -c "error TS" $REPORT_DIR/typescript-errors.txt || echo 0)
POST_AUTOFIX_TOTAL=$((POST_AUTOFIX_ESLINT_CRITICAL + POST_AUTOFIX_TS_ERRORS))

AUTOFIX_REDUCTION=$((INITIAL_TOTAL - POST_AUTOFIX_TOTAL))
AUTOFIX_PERCENTAGE=$((AUTOFIX_REDUCTION * 100 / INITIAL_TOTAL))

update_progress "- ✅ Ejecutada corrección automática de errores de formato"
update_progress "- 📊 Errores restantes: $POST_AUTOFIX_TOTAL ($AUTOFIX_PERCENTAGE% resuelto)"
update_progress ""

# Guardar progreso en git
git add src/
git commit -m "Fix: Corrección automática de errores de formato"
update_progress "- 💾 Commit: Corrección automática de errores de formato"

# Paso 3: Corrección por lotes de archivos prioritarios
echo -e "${YELLOW}Paso 3: Corrección por lotes de archivos prioritarios${NC}"
update_progress "## Paso 3: Corrección por Lotes"

# Lista de archivos prioritarios
PRIORITY_FILES=(
  "src/services/emr/implementations/ClinicCloudAdapter.ts"
  "src/services/emr/implementations/OSCARAdapter.ts"
  "src/components/examples/EMRPatientSearch.tsx"
)

# Ejecutar corrección por lotes sin interacción
for file in "${PRIORITY_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${YELLOW}Procesando archivo prioritario: $file${NC}"
    update_progress "### Procesando $file"

    # Ejecutar batch-fix.sh automáticamente para cada archivo
    echo "especificos" | ./scripts/batch-fix.sh <<< "$file"

    # Contar errores restantes en el archivo
    ERRORS_IN_FILE=$(npx tsc --noEmit --pretty false "$file" 2>&1 | grep -c "error TS" || echo 0)

    if [ $ERRORS_IN_FILE -eq 0 ]; then
      update_progress "- ✅ Archivo corregido completamente: $file"
    else
      update_progress "- ⚠️ Errores restantes en $file: $ERRORS_IN_FILE"
    fi

    # Guardar progreso en git
    git add "$file"
    git commit -m "Fix: Corrección de errores en $file"
    update_progress "- 💾 Commit: Corrección de errores en $file"
    update_progress ""
  fi
done

# Paso 4: Verificación intermedia
echo -e "${YELLOW}Paso 4: Verificación intermedia de progreso${NC}"
update_progress "## Paso 4: Verificación Intermedia"

# Ejecutar análisis después de las correcciones por lotes
./scripts/error-check.sh

# Extraer estadísticas después de batch-fix
POST_BATCHFIX_ESLINT_CRITICAL=$(grep -c '"severity":2' $REPORT_DIR/eslint-report.json || echo 0)
POST_BATCHFIX_TS_ERRORS=$(grep -c "error TS" $REPORT_DIR/typescript-errors.txt || echo 0)
POST_BATCHFIX_TOTAL=$((POST_BATCHFIX_ESLINT_CRITICAL + POST_BATCHFIX_TS_ERRORS))

BATCHFIX_REDUCTION=$((INITIAL_TOTAL - POST_BATCHFIX_TOTAL))
BATCHFIX_PERCENTAGE=$((BATCHFIX_REDUCTION * 100 / INITIAL_TOTAL))

update_progress "- 📊 Progreso actual: $BATCHFIX_PERCENTAGE% de errores resueltos"
update_progress "- 📊 Errores restantes: $POST_BATCHFIX_TOTAL"
update_progress "  - $POST_BATCHFIX_ESLINT_CRITICAL errores de ESLint"
update_progress "  - $POST_BATCHFIX_TS_ERRORS errores de TypeScript"
update_progress ""

# Paso 5: Actualización de documentación
echo -e "${YELLOW}Paso 5: Actualización de documentación${NC}"
update_progress "## Paso 5: Actualización de Documentación"

# Actualizar documento de error-corrections.md con el progreso
ERROR_CORRECTION_DOC="docs/error-corrections.md"

if [ -f "$ERROR_CORRECTION_DOC" ]; then
  # Añadir sección de progreso al documento
  cat << EOF >> "$ERROR_CORRECTION_DOC"

## Actualización de Progreso ($(date +%d-%m-%Y))

### Errores Corregidos
- $BATCHFIX_REDUCTION de $INITIAL_TOTAL errores críticos resueltos ($BATCHFIX_PERCENTAGE%)
- Errores de formato corregidos automáticamente
- Archivos prioritarios procesados

### Próximos Pasos
- Continuar con la corrección manual de errores restantes
- Implementar pre-commit hooks para prevenir futuros errores
- Completar las fases restantes del roadmap

EOF

  git add "$ERROR_CORRECTION_DOC"
  git commit -m "Docs: Actualización de progreso en corrección de errores"
  update_progress "- ✅ Actualizada documentación en $ERROR_CORRECTION_DOC"
else
  update_progress "- ⚠️ No se encontró el documento $ERROR_CORRECTION_DOC"
fi

# Paso 6: Push de cambios y resumen
echo -e "${YELLOW}Paso 6: Push de cambios y resumen${NC}"
update_progress "## Paso 6: Finalización"

# Push de la rama con correcciones
git push -u origin $BRANCH_NAME

update_progress "- ✅ Rama con correcciones enviada a repositorio remoto: $BRANCH_NAME"
update_progress ""

# Resumen final
update_progress "## Resumen Final"
update_progress "- 📊 Errores iniciales: $INITIAL_TOTAL"
update_progress "- 📊 Errores corregidos: $BATCHFIX_REDUCTION ($BATCHFIX_PERCENTAGE%)"
update_progress "- 📊 Errores restantes: $POST_BATCHFIX_TOTAL"
update_progress ""
update_progress "### Siguientes Pasos Recomendados"
update_progress "1. Revisar los cambios realizados en la rama $BRANCH_NAME"
update_progress "2. Crear un Pull Request para integrar las correcciones"
update_progress "3. Continuar con la corrección manual de errores restantes"
update_progress "4. Implementar medidas preventivas según el roadmap"
update_progress ""
update_progress "Fecha de finalización: $(date)"

echo -e "${GREEN}Proceso de corrección automatizada completado${NC}"
echo -e "Resumen guardado en: ${GREEN}$PROGRESS_FILE${NC}"
echo -e "${YELLOW}=======================================${NC}"
