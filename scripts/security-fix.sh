#!/bin/bash

# Script para identificar y corregir problemas de seguridad
# Se ejecuta desde la raíz del proyecto

echo "==============================================="
echo "  Corrección de problemas de seguridad  "
echo "==============================================="

# Colores para la salida
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 1. Buscar y corregir vulnerabilidades XSS (innerHTML, dangerouslySetInnerHTML sin sanitización)
echo -e "\n[1/5] Buscando vulnerabilidades XSS potenciales..."
xss_issues=$(grep -r "innerHTML\|dangerouslySetInnerHTML" --include="*.tsx" --include="*.ts" src)
echo "Encontradas $(echo "$xss_issues" | wc -l | tr -d ' ') posibles vulnerabilidades XSS:"
echo "$xss_issues"

# Intentar corregir dangerouslySetInnerHTML añadiendo DOMPurify
if [ ! -z "$xss_issues" ]; then
  echo -e "${YELLOW}Añadiendo sanitización a dangerouslySetInnerHTML...${NC}"

  # Verificar si DOMPurify está instalado
  if ! grep -q "dompurify" package.json; then
    echo "DOMPurify no está instalado. Recomendación: Ejecuta 'npm install dompurify @types/dompurify'"
  fi

  # Para cada archivo con dangerouslySetInnerHTML, añadir DOMPurify
  echo "$xss_issues" | grep "dangerouslySetInnerHTML" | cut -d':' -f1 | sort | uniq | while read -r file; do
    if [ -f "$file" ]; then
      # Verificar si ya usa DOMPurify
      if ! grep -q "DOMPurify" "$file"; then
        # Crear backup
        cp "$file" "${file}.xss-fix.bak"

        # Añadir import para DOMPurify si no existe
        if ! grep -q "import DOMPurify" "$file"; then
          sed -i '' '1s/^/import DOMPurify from "dompurify";\n/' "$file"
        fi

        # Reemplazar dangerouslySetInnerHTML={{__html: ... }} con sanitización
        sed -i '' 's/dangerouslySetInnerHTML={{__html: \([^}]*\)}}/dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(\1)}}/g' "$file"
        echo "Corregido: $file"
      else
        echo "$file ya usa DOMPurify, no es necesario corregirlo."
      fi
    fi
  done
fi

# 2. Buscar posibles problemas de ruta de acceso relativa
echo -e "\n[2/5] Buscando problemas de ruta de acceso relativa..."
path_traversal=$(grep -r "\.\.\/\|\.\./" --include="*.ts" --include="*.tsx" src | grep -v "import\|export")
echo "Encontrados $(echo "$path_traversal" | wc -l | tr -d ' ') posibles problemas de ruta relativa:"
echo "$path_traversal"

# 3. Buscar y corregir declaraciones eval() o Function() inseguras
echo -e "\n[3/5] Buscando evaluación de código dinámico inseguro..."
dynamic_code=$(grep -r "eval\|new Function" --include="*.ts" --include="*.tsx" src)
echo "Encontradas $(echo "$dynamic_code" | wc -l | tr -d ' ') evaluaciones de código dinámico potencialmente inseguras:"
echo "$dynamic_code"

if [ ! -z "$dynamic_code" ]; then
  echo -e "${RED}⚠️ ADVERTENCIA: El uso de eval() o new Function() representa una grave vulnerabilidad de seguridad.${NC}"
  echo -e "${YELLOW}Recomendación: Reemplazar con alternativas más seguras como JSON.parse() para datos JSON.${NC}"
fi

# 4. Buscar y corregir almacenamiento inseguro de datos sensibles en localStorage
echo -e "\n[4/5] Comprobando almacenamiento seguro..."
storage_issues=$(grep -r "localStorage\|sessionStorage" --include="*.ts" --include="*.tsx" src | grep -v "import")
echo "Encontrados $(echo "$storage_issues" | wc -l | tr -d ' ') usos de almacenamiento local:"
echo "$storage_issues"

# Si hay tokens JWT u otros datos sensibles, sugerir encriptación
if echo "$storage_issues" | grep -q "token\|password\|auth\|login"; then
  echo -e "${YELLOW}⚠️ Posible almacenamiento inseguro de datos sensibles en localStorage/sessionStorage.${NC}"
  echo -e "${YELLOW}Recomendación: Considerar encriptar datos sensibles o usar cookies seguras con httpOnly.${NC}"
fi

# 5. Buscar problemas CSRF potenciales (cambiar estado con métodos HTTP inseguros)
echo -e "\n[5/5] Analizando protección CSRF..."
csrf_issues=$(grep -r "post\|put\|delete\|patch" --include="*.ts" --include="*.tsx" src | grep -i "fetch\|axios\|http")
echo "Encontradas $(echo "$csrf_issues" | wc -l | tr -d ' ') peticiones HTTP mutables:"

# Verificar si se están usando tokens CSRF o cabeceras personalizadas
if [ ! -z "$csrf_issues" ] && ! echo "$csrf_issues" | grep -q "X-CSRF-Token\|csrf\|xsrf"; then
  echo -e "${YELLOW}⚠️ ADVERTENCIA: Posible falta de protección CSRF en peticiones mutables.${NC}"
  echo -e "${YELLOW}Recomendación: Implementar tokens CSRF o cabeceras personalizadas.${NC}"
fi

# Limpiar archivos temporales
find src -name "*.xss-fix.bak" -delete

echo -e "\n==============================================="
echo "      Análisis de seguridad completado      "
echo "==============================================="

# Recomendaciones finales
echo -e "\n${GREEN}RECOMENDACIONES DE SEGURIDAD:${NC}"
echo "1. Sanitizar cualquier contenido HTML dinámico con DOMPurify para prevenir XSS."
echo "2. Evitar el uso de eval() o new Function() por completo."
echo "3. No almacenar datos sensibles en localStorage sin encriptación."
echo "4. Implementar protección CSRF para todas las peticiones mutables."
echo "5. Considerar la implementación de Content Security Policy (CSP)."
echo "6. Validar siempre todos los inputs tanto en cliente como en servidor."
echo "7. Usar HTTPS para todas las comunicaciones."
