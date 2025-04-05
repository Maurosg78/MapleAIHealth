#!/bin/bash

# Script para analizar problemas de rendimiento en la aplicación
# Se ejecuta desde la raíz del proyecto

echo "==============================================="
echo "  Análisis de problemas de rendimiento  "
echo "==============================================="

# Colores para la salida
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 1. Análisis de tamaño de componentes (archivos grandes que podrían necesitar división)
echo -e "\n[1/5] Analizando tamaño de componentes React..."
find src -type f -name "*.tsx" -exec wc -l {} \; | sort -nr | head -10
echo -e "${YELLOW}Estos son los 10 componentes más grandes que podrían beneficiarse de refactorización.${NC}"

# 2. Análisis de renderizados innecesarios
echo -e "\n[2/5] Identificando potenciales renderizados innecesarios..."
find src -type f -name "*.tsx" -exec grep -l "useState\|useEffect" {} \; | xargs grep -l "function" | while read -r file; do
  if ! grep -q "React.memo\|useCallback\|useMemo" "$file"; then
    echo -e "${YELLOW}Posible optimización en:${NC} $file"
  fi
done

# 3. Búsqueda de operaciones sincrónicas potencialmente bloqueantes
echo -e "\n[3/5] Buscando operaciones bloqueantes..."
grep -r "while\|for.*in\|for.*of" --include="*.ts" --include="*.tsx" src | grep -v "async\|Promise" | head -20
echo -e "${YELLOW}Estos bucles podrían ser bloqueantes y deberían considerarse para asincronía.${NC}"

# 4. Análisis de manejo de caché
echo -e "\n[4/5] Analizando estrategia de caché..."
cache_files=$(find src -type f -name "*.ts" -exec grep -l "cache\|Cache" {} \;)
echo "Encontrados $(echo "$cache_files" | wc -l | tr -d ' ') archivos relacionados con caché."
echo "$cache_files"

# 5. Análisis de gestión de recursos costosos
echo -e "\n[5/5] Analizando gestión de recursos..."
# Buscar conexiones a servicios externos, suscripciones, etc.
resources=$(grep -r "new \(WebSocket\|EventSource\)\|subscribe\|connect\|.open(" --include="*.ts" --include="*.tsx" src)
resource_cleanup=$(grep -r "close\|unsubscribe\|disconnect" --include="*.ts" --include="*.tsx" src)

echo "Recursos abiertos: $(echo "$resources" | wc -l | tr -d ' ')"
echo "Liberaciones de recursos: $(echo "$resource_cleanup" | wc -l | tr -d ' ')"

if [ "$(echo "$resources" | wc -l | tr -d ' ')" -gt "$(echo "$resource_cleanup" | wc -l | tr -d ' ')" ]; then
  echo -e "${RED}⚠️ ADVERTENCIA: Parece haber menos liberaciones de recursos que aperturas, posible fuga.${NC}"
else
  echo -e "${GREEN}✓ La gestión de recursos parece equilibrada.${NC}"
fi

# Buscar código que podría causar pérdidas de memoria en useEffect
echo -e "\n[+] Analizando useEffect sin cleanup..."
grep -r "useEffect" --include="*.tsx" src | grep -A 5 "useEffect" | grep -v "return" | grep -B 5 "}, \[" | head -20
echo -e "${YELLOW}Revisar estos useEffect que podrían no tener función de limpieza.${NC}"

echo -e "\n==============================================="
echo "      Análisis de rendimiento completado      "
echo "==============================================="

# Recomendaciones
echo -e "\n${GREEN}RECOMENDACIONES DE OPTIMIZACIÓN:${NC}"
echo "1. Considera dividir componentes grandes en partes más pequeñas y reutilizables."
echo "2. Usa React.memo para componentes que se renderizan frecuentemente con las mismas props."
echo "3. Implementa useCallback para funciones pasadas como props a componentes memorizados."
echo "4. Utiliza useMemo para cálculos costosos."
echo "5. Asegúrate de limpiar efectos, suscripciones y temporizadores."
echo "6. Considera técnicas de carga diferida (lazy loading) para rutas y componentes grandes."
echo "7. Implementa estrategias de debounce/throttle para eventos frecuentes como scroll o resize."
