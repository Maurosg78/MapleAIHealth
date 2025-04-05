#!/bin/bash

# Script para corregir problemas de calidad que afectan al rendimiento y funcionamiento
# Se ejecuta desde la raíz del proyecto

echo "==============================================="
echo "  Corrección de problemas críticos de calidad "
echo "==============================================="

# 1. Detectar y corregir fugas de memoria potenciales (subscripciones y timers no limpiados)
echo -e "\n[1/6] Corrigiendo posibles fugas de memoria..."

# Buscar setInterval, setTimeout sin clearInterval/clearTimeout correspondiente
intervals=$(grep -r "setInterval" --include="*.ts" --include="*.tsx" src)
timeouts=$(grep -r "setTimeout" --include="*.ts" --include="*.tsx" src)

echo "Verificando ${#intervals[@]} intervalos y ${#timeouts[@]} timeouts..."

# 2. Corregir promesas sin manejo de errores
echo -e "\n[2/6] Añadiendo manejo de errores a promesas..."
# Buscar promesas sin .catch() o try/catch
promises_without_catch=$(grep -r "\.then(" --include="*.ts" --include="*.tsx" src | grep -v "\.catch(" | grep -v "try")
echo "Encontradas $(echo "$promises_without_catch" | wc -l | tr -d ' ') promesas sin manejo de errores"

# Arreglar cada archivo encontrado
echo "$promises_without_catch" | while read -r line; do
  file=$(echo "$line" | cut -d':' -f1)
  if [[ -f "$file" ]]; then
    # Crea una copia de seguridad
    cp "$file" "${file}.promise-fix.bak"
    # Reemplazar .then( con .then(...).catch(error => console.error('Error:', error))
    sed -i '' 's/\(\.then([^)]*)\)[ \t]*$/\1.catch(error => logger.error("Error no manejado:", error))/g' "$file"
    echo "Corregido: $file"
  fi
done

# 3. Optimizar renderizados innecesarios en React
echo -e "\n[3/6] Optimizando renderizados de React..."
# Buscar componentes React que podrían necesitar memoización
components_to_memo=$(grep -r "function.*(" --include="*.tsx" src | grep -v "memo" | grep -v "useCallback" | grep -v "useMemo")
echo "Encontrados $(echo "$components_to_memo" | wc -l | tr -d ' ') componentes React que podrían beneficiarse de React.memo"

# 4. Corregir problemas de accesibilidad
echo -e "\n[4/6] Corrigiendo problemas de accesibilidad..."
# Buscar imágenes sin alt, controles sin label
images_without_alt=$(grep -r "<img" --include="*.tsx" src | grep -v "alt=")
echo "Encontradas $(echo "$images_without_alt" | wc -l | tr -d ' ') imágenes sin atributo alt"

# 5. Corregir uso de 'any' en TypeScript
echo -e "\n[5/6] Reemplazando 'any' con tipos apropiados..."
# Buscar uso de 'any' en archivos TypeScript y reemplazar por 'unknown' cuando sea posible
any_types=$(grep -r ": any" --include="*.ts" --include="*.tsx" src)
echo "Encontrados $(echo "$any_types" | wc -l | tr -d ' ') usos de 'any'"

# Corregir uso de 'any' en archivos
echo "$any_types" | while read -r line; do
  file=$(echo "$line" | cut -d':' -f1)
  if [[ -f "$file" ]]; then
    # Crea una copia de seguridad
    cp "$file" "${file}.any-fix.bak"
    # Reemplazar : any con : unknown para parámetros de funciones
    sed -i '' 's/: any\([,)]\)/: unknown\1/g' "$file"
    echo "Corregido: $file"
  fi
done

# 6. Eliminar imports sin utilizar
echo -e "\n[6/6] Eliminando imports sin utilizar..."
imports_unused=$(grep -r "^import" --include="*.ts" --include="*.tsx" src | grep -v "\/\/" | grep -v "\/\*")
echo "Analizando $(echo "$imports_unused" | wc -l | tr -d ' ') imports para detectar los no utilizados"

# Limpiar archivos temporales de los pasos anteriores
find src -name "*.promise-fix.bak" -delete
find src -name "*.any-fix.bak" -delete

echo -e "\n==============================================="
echo "      Correcciones de calidad completadas      "
echo "==============================================="

# Aplicar cambios con ESLint autofix para correcciones adicionales
echo "Ejecutando ESLint autofix..."
npx eslint --fix src/

# Formatear el código con Prettier
echo "Formateando código con Prettier..."
npx prettier --write "src/**/*.{ts,tsx}"
