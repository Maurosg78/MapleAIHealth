#!/bin/bash

# Script simple para verificar errores críticos
echo "===== VERIFICACIÓN FINAL DE ERRORES ====="
echo "Fecha: $(date)"
echo "======================================="

# 1. Verificar errores de TypeScript
echo "\n=== ERRORES DE TYPESCRIPT ==="
npm run type-check
if [ $? -eq 0 ]; then
  echo "✅ No hay errores de TypeScript"
  TS_OK=true
else
  echo "❌ Hay errores de TypeScript"
  TS_OK=false
fi

# 2. Verificar la compilación
echo "\n=== COMPILACIÓN ==="
npm run build
if [ $? -eq 0 ]; then
  echo "✅ La aplicación compila correctamente"
  BUILD_OK=true
else
  echo "❌ Hay errores de compilación"
  BUILD_OK=false
fi

# Resumen
echo "\n=== RESUMEN ==="
if [ "$TS_OK" = true ] && [ "$BUILD_OK" = true ]; then
  echo "🎉 El código está libre de errores críticos!"
else
  echo "❌ Se encontraron errores que deben corregirse."
fi
echo "======================================="
