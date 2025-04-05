#!/bin/bash

# Script para ejecutar tareas de limpieza automáticamente
# Se ejecuta desde la raíz del proyecto

echo "==============================================="
echo "  Iniciando limpieza automática del proyecto  "
echo "==============================================="

# 1. Eliminar archivos .bak
echo -e "\n[1/3] Eliminando archivos .bak..."
bak_files=$(find src -name "*.bak")
if [ -z "$bak_files" ]; then
  echo "No se encontraron archivos .bak."
else
  find src -name "*.bak" -delete
  echo "Eliminados $(echo "$bak_files" | wc -l | tr -d ' ') archivos .bak."
fi

# 2. Aplicar correcciones de console.log
echo -e "\n[2/3] Aplicando correcciones de logging..."
if [ -f "scripts/fix-console-logs.sh" ]; then
  ./scripts/fix-console-logs.sh
else
  echo "Error: No se encontró el script fix-console-logs.sh"
  exit 1
fi

# 3. Formatear el código
echo -e "\n[3/3] Formateando el código con Prettier..."
if command -v npx &> /dev/null; then
  npx prettier --write "src/**/*.{ts,tsx}"
  echo "Código formateado correctamente."
else
  echo "Error: No se encontró npx. Asegúrate de tener Node.js instalado."
  exit 1
fi

echo -e "\n==============================================="
echo "      Limpieza automática completada      "
echo "==============================================="
