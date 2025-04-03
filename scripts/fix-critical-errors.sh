#!/bin/bash

# fix-critical-errors.sh
# Script para corregir errores críticos de manera organizada por paquetes
# Compatible con macOS M1 2020

set -e

# Configuración
ROOT_DIR=$(pwd)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$ROOT_DIR/reports/fix-critical-$TIMESTAMP.log"
BACKUP_DIR="$ROOT_DIR/backups/pre-fix-$TIMESTAMP"

# Crear directorios necesarios
mkdir -p "$BACKUP_DIR/src"
mkdir -p "$ROOT_DIR/reports"

echo "Iniciando corrección organizada de errores críticos"
echo "==================================================="

# Ejecutaremos paso a paso
echo "Paso 1: Creando respaldo inicial..."
rsync -a --exclude="node_modules" --exclude=".git" --exclude="backups" "$ROOT_DIR/src/" "$BACKUP_DIR/src/"

echo "Respaldo creado en $BACKUP_DIR"
echo "Paso 2: Corrigiendo archivos con errores..."

# Función para corregir un archivo específico
fix_file() {
  local file=$1
  echo "Corrigiendo $file..."
  
  # Hacer backup
  cp "$file" "$file.bak"
  
  # Corregir errores comunes
  sed -i '' -E 's/interface ([A-Za-z]+)Props \{/export interface \1Props {/g' "$file"
  sed -i '' -E 's/const ([A-Za-z]+) = /export const \1 = /g' "$file"
  
  # Si es un archivo TSX, asegurar que tiene import React
  if [[ "$file" == *.tsx ]] && ! grep -q "import React" "$file"; then
    sed -i '' '1i\
import React from "react";
' "$file"
  fi
  
  # Corregir IDs que pueden ser undefined
  sed -i '' -E 's/id: ([a-zA-Z0-9_\.]+\.id)([,}])/id: \1 || crypto.randomUUID()\2/g' "$file"
  
  # Si usa randomUUID, asegurar que importa crypto
  if grep -q "randomUUID" "$file" && ! grep -q "import crypto" "$file"; then
    sed -i '' '1i\
import crypto from "crypto";
' "$file"
  fi
}

# Corregir algunos archivos críticos
if [ -f "src/services/emr/implementations/EPICAdapter.ts" ]; then
  fix_file "src/services/emr/implementations/EPICAdapter.ts"
fi

if [ -f "src/components/common/Button.tsx" ]; then
  fix_file "src/components/common/Button.tsx"
fi

if [ -f "src/components/common/Input.tsx" ]; then
  fix_file "src/components/common/Input.tsx"
fi

echo "Paso 3: Ejecutando prettier..."
npx prettier --write "src/**/*.{ts,tsx}" || true

echo "Corrección completada. Revisa los archivos modificados y ejecuta npm run type-check para verificar los errores restantes."
