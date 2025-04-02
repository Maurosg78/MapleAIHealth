#!/bin/bash

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando corrección de errores de ESLint...${NC}"

# Crear directorio de respaldo si no existe
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Función para hacer backup de un archivo
backup_file() {
    local file=$1
    local backup_path="$BACKUP_DIR/$(basename $file)"
    cp "$file" "$backup_path"
    echo -e "${GREEN}Backup creado: $backup_path${NC}"
}

# Función para corregir errores de ESLint en un archivo
fix_eslint() {
    local file=$1
    echo -e "${YELLOW}Procesando: $file${NC}"

    # Hacer backup
    backup_file "$file"

    # Eliminar variables no utilizadas
    sed -i '' 's/const [^=]*= [^;]*;//g' "$file"

    # Eliminar puntos y coma extra
    sed -i '' 's/;;/;/g' "$file"

    # Corregir espacios mixtos
    expand -t 2 "$file" > "$file.tmp"
    mv "$file.tmp" "$file"

    # Eliminar espacios en blanco al final de las líneas
    sed -i '' 's/[[:space:]]*$//' "$file"

    echo -e "${GREEN}Errores corregidos en: $file${NC}"
}

# Encontrar todos los archivos TypeScript y corregir sus errores
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    fix_eslint "$file"
done

echo -e "${GREEN}Corrección de errores de ESLint completada${NC}"
echo -e "${YELLOW}Los backups se encuentran en: $BACKUP_DIR${NC}"
