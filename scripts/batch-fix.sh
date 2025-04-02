#!/bin/bash

# Script para corrección por lotes de errores de tipo críticos
# Complemento a auto-fix.sh para resolver problemas específicos

# Colores para terminal
RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW}  CORRECCIÓN POR LOTES DE ERRORES DE TIPO  ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Fecha: $(date)"
echo

# Directorio para guardar informes
REPORT_DIR="reports"
mkdir -p $REPORT_DIR
LOG_FILE="$REPORT_DIR/batch-fix-log.md"

# Crear archivo de log
echo "# 🔧 Log de Correcciones por Lotes" > $LOG_FILE
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

# Crear directorio de backup para archivos originales
BACKUP_DIR="$REPORT_DIR/backups-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
log_action "✅ Creado directorio de backup: $BACKUP_DIR"

# Seleccionar archivos a corregir
read -p "¿Quieres corregir todos los archivos o específicos? (todos/especificos): " scope

if [ "$scope" = "especificos" ]; then
  read -p "Introduce la ruta del archivo a corregir: " target_file
  if [ -f "$target_file" ]; then
    TARGET_FILES=("$target_file")
  else
    echo -e "${RED}Archivo no encontrado: $target_file${NC}"
    exit 1
  fi
else
  # Archivos prioritarios para corrección
  TARGET_FILES=(
    "src/services/emr/implementations/ClinicCloudAdapter.ts"
    "src/services/emr/implementations/OSCARAdapter.ts"
    "src/components/examples/EMRPatientSearch.tsx"
  )
fi

# Recorrer cada archivo y aplicar correcciones
for file in "${TARGET_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    log_action "⚠️ Archivo no encontrado: $file"
    continue
  fi

  echo -e "${YELLOW}Procesando $file...${NC}"

  # Crear backup del archivo original
  cp "$file" "$BACKUP_DIR/$(basename "$file")"
  log_action "📁 Backup creado para $file"

  # 1. Reemplazar 'any' con tipos específicos más comunes
  echo -e "${YELLOW}Corrigiendo tipos 'any'...${NC}"

  # Record<string, unknown> para objetos genéricos
  sed -i '' 's/: any{/: Record<string, unknown>{/g' "$file"
  sed -i '' 's/: any\[/: unknown[]/g' "$file"
  sed -i '' 's/: any)/: unknown)/g' "$file"
  sed -i '' 's/: any;/: unknown;/g' "$file"

  log_action "✅ Reemplazados tipos 'any' con 'unknown' en $file"

  # 2. Corregir errores comunes de null/undefined
  echo -e "${YELLOW}Corrigiendo errores de null/undefined...${NC}"

  # Añadir comprobaciones de nulidad para operaciones comunes
  sed -i '' 's/\(\w\+\)\.length/\1?.length/g' "$file"
  sed -i '' 's/\(\w\+\)\.map(/\1?.map(/g' "$file"
  sed -i '' 's/\(\w\+\)\.filter(/\1?.filter(/g' "$file"
  sed -i '' 's/\(\w\+\)\.forEach(/\1?.forEach(/g' "$file"

  log_action "✅ Añadidas comprobaciones de nulidad para métodos comunes en $file"

  # 3. Corregir imports de Chakra UI para componentes específicos
  if [[ "$file" == *"EMRPatientSearch.tsx" ]]; then
    echo -e "${YELLOW}Corrigiendo imports de Chakra UI...${NC}"

    # Verificar si ya existe un import de @chakra-ui/react
    if grep -q "@chakra-ui/react" "$file"; then
      # Extender el import existente
      sed -i '' 's/import {/import { Tbody, Td, Th, Thead, Tr, /g' "$file"
    else
      # Añadir nuevo import
      sed -i '' '1i\
import { Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
' "$file"
    fi

    log_action "✅ Corregidos imports de Chakra UI en $file"
  fi

  # 4. Aplicar prettier al archivo para mantener formato consistente
  echo -e "${YELLOW}Formateando archivo...${NC}"
  npx prettier --write "$file" --loglevel error

  if [ $? -eq 0 ]; then
    log_action "✅ Formateado con Prettier: $file"
  else
    log_action "⚠️ Error al formatear con Prettier: $file"
  fi

  echo -e "${GREEN}Completado procesamiento de $file${NC}"
  echo
done

# Verificar errores restantes
echo -e "${YELLOW}Verificando errores restantes...${NC}"

# Ejecutar TypeScript check en los archivos corregidos
for file in "${TARGET_FILES[@]}"; do
  if [ -f "$file" ]; then
    npx tsc --noEmit --pretty false "$file"

    if [ $? -eq 0 ]; then
      log_action "✅ No hay errores de tipo en $file"
    else
      log_action "⚠️ Aún hay errores de tipo en $file que requieren corrección manual"
    fi
  fi
done

echo -e "\n${YELLOW}=======================================${NC}"
echo -e "${YELLOW}     CORRECCIONES POR LOTES COMPLETADAS     ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Log de correcciones guardado en: ${GREEN}$LOG_FILE${NC}"
echo

echo -e "${YELLOW}Pasos siguientes recomendados:${NC}"
echo -e "1. Revisar correcciones realizadas"
echo -e "2. Completar correcciones manuales para errores restantes"
echo -e "3. Ejecutar scripts/error-check.sh para verificar progreso general"

echo -e "\n${YELLOW}=======================================${NC}"

# Preguntar si se desea revertir cambios en caso de problemas
read -p "¿Deseas revertir los cambios realizados? (s/n): " revert

if [ "$revert" = "s" ]; then
  for file in "${TARGET_FILES[@]}"; do
    if [ -f "$BACKUP_DIR/$(basename "$file")" ]; then
      cp "$BACKUP_DIR/$(basename "$file")" "$file"
      echo -e "${GREEN}Revertidos cambios en $file${NC}"
    fi
  done
  echo -e "${GREEN}Todos los cambios han sido revertidos${NC}"
fi
