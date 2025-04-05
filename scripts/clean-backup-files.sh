#!/bin/bash

# Script para eliminar archivos .bak del proyecto
# Se ejecuta desde la raíz del proyecto

echo "Buscando archivos .bak para eliminar..."
find_result=$(find src -name "*.bak")

if [ -z "$find_result" ]; then
  echo "No se encontraron archivos .bak en el directorio src."
  exit 0
fi

echo "Se encontraron los siguientes archivos .bak:"
echo "$find_result"
echo ""

# Preguntar confirmación
read -p "¿Desea eliminar estos archivos? (s/n): " confirm
if [[ $confirm != [sS] ]]; then
  echo "Operación cancelada."
  exit 0
fi

# Eliminar los archivos
find src -name "*.bak" -delete

echo "Archivos .bak eliminados correctamente."
