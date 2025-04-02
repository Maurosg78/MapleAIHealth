#!/bin/bash

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando corrección de espacios mixtos...${NC}"

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

# Función para corregir espacios en un archivo
fix_spaces() {
    local file=$1
    echo -e "${YELLOW}Procesando: $file${NC}"

    # Hacer backup
    backup_file "$file"

    # Reemplazar tabs por espacios
    expand -t 2 "$file" > "$file.tmp"
    mv "$file.tmp" "$file"

    # Eliminar espacios en blanco al final de las líneas
    sed -i '' 's/[[:space:]]*$//' "$file"

    echo -e "${GREEN}Espacios corregidos en: $file${NC}"
}

# Encontrar todos los archivos TypeScript y corregir sus espacios
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    fix_spaces "$file"
done

echo -e "${GREEN}Corrección de espacios completada${NC}"
echo -e "${YELLOW}Los backups se encuentran en: $BACKUP_DIR${NC}"
