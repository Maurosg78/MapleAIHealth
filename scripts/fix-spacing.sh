#!/bin/bash

# Script para corregir problemas de espacios y tabulaciones mixtas

echo "===== Corrector de problemas de espacios y tabulaciones ====="
echo "Fecha: $(date)"

# Directorio base (raíz del proyecto)
BASE_DIR="$(pwd)"

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
  echo "Error: Este script debe ejecutarse desde la raíz del proyecto (donde está package.json)"
  exit 1
fi

# Crear directorio de respaldo
BACKUP_DIR="${BASE_DIR}/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Se crearán copias de seguridad en: $BACKUP_DIR"

# Ejecutar Prettier para corregir problemas de formato
echo ""
echo "Ejecutando Prettier para corregir problemas de formato en archivos TypeScript/JavaScript..."
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"

# Buscar archivos con mezcla de espacios y tabulaciones y corregirlos
echo ""
echo "Buscando archivos con problemas de espacios y tabulaciones mixtas..."

# Crear un archivo de registro
LOG_FILE="${BASE_DIR}/reports/fix-spacing-log.txt"
mkdir -p "${BASE_DIR}/reports"
echo "$(date): Inicio de corrección de espacios y tabulaciones" > "$LOG_FILE"

# Buscar archivos con problemas de espacios y tabulaciones mixtas
FILES_WITH_ISSUES=$(grep -l $'\t' $(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"))

if [ -z "$FILES_WITH_ISSUES" ]; then
  echo "No se encontraron archivos con problemas de tabulaciones."
  echo "No se encontraron archivos con problemas de tabulaciones." >> "$LOG_FILE"
else
  echo "Se encontraron $(echo "$FILES_WITH_ISSUES" | wc -l | tr -d ' ') archivos con problemas de tabulaciones."
  echo "Se encontraron $(echo "$FILES_WITH_ISSUES" | wc -l | tr -d ' ') archivos con problemas de tabulaciones." >> "$LOG_FILE"

  # Procesar cada archivo con problemas
  for FILE in $FILES_WITH_ISSUES; do
    echo "Procesando: $FILE"
    echo "Procesando: $FILE" >> "$LOG_FILE"

    # Crear copia de seguridad
    cp "$FILE" "${BACKUP_DIR}/$(basename "$FILE")"

    # Convertir tabulaciones a espacios (asumiendo 2 espacios por tabulación)
    sed -i '' 's/\t/  /g' "$FILE"

    echo "  ✓ Corregido"
    echo "  ✓ Corregido" >> "$LOG_FILE"
  done
fi

# Verificar si hay archivos con punto y coma extra
echo ""
echo "Buscando archivos con puntos y coma extras..."

# Usar ESLint para identificar archivos con puntos y coma extras
FILES_WITH_SEMICOLON=$(npx eslint --quiet --format json src/**/*.{ts,tsx,js,jsx} | grep -B 5 -A 2 "no-extra-semi" | grep "filePath" | sed 's/.*filePath":"\([^"]*\).*/\1/')

if [ -z "$FILES_WITH_SEMICOLON" ]; then
  echo "No se encontraron archivos con puntos y coma extras."
  echo "No se encontraron archivos con puntos y coma extras." >> "$LOG_FILE"
else
  echo "Se encontraron archivos con puntos y coma extras."
  echo "Se encontraron archivos con puntos y coma extras." >> "$LOG_FILE"

  # Corregir con ESLint --fix
  echo "Ejecutando ESLint para corregir puntos y coma extras..."
  npx eslint --fix src/**/*.{ts,tsx,js,jsx}

  echo "  ✓ Corregido con ESLint"
  echo "  ✓ Corregido con ESLint" >> "$LOG_FILE"
fi

echo ""
echo "===== Corrección completada ====="
echo "Verificando resultados con error-check.sh..."

# Ejecutar el script de verificación de errores para comprobar los resultados
./scripts/error-check.sh

echo ""
echo "Las correcciones se han completado. Por favor, revisa el informe de errores para verificar mejoras."
echo "Log guardado en: $LOG_FILE"
echo "Copias de seguridad guardadas en: $BACKUP_DIR"
