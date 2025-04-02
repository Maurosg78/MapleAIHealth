#!/bin/bash

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando corrección de imports...${NC}"

# Crear directorio de backups con timestamp
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)_imports"
mkdir -p "$BACKUP_DIR"

# Función para procesar cada archivo
process_file() {
    local file="$1"
    echo -e "${YELLOW}Procesando: $file${NC}"

    # Crear backup
    local backup_path="$BACKUP_DIR/$(basename "$file")"
    cp "$file" "$backup_path"
    echo -e "${GREEN}Backup creado: $backup_path${NC}"

    # Leer el contenido del archivo
    content=$(cat "$file")

    # Corregir los imports concatenados
    corrected_content=$(echo "$content" | sed -E '
        # Eliminar "import" duplicados
        s/import.*import/import/g

        # Separar imports en líneas diferentes
        s/;import/;\
import/g

        # Corregir imports con llaves
        s/import \{([^}]*)\}/import {\
  \1\
}/g
    ')

    # Guardar el contenido corregido
    echo "$corrected_content" > "$file"

    echo -e "${GREEN}Imports corregidos en: $file${NC}"
}

# Encontrar todos los archivos TypeScript/JavaScript
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    process_file "$file"
done

echo -e "${GREEN}Corrección de imports completada${NC}"
echo -e "${YELLOW}Los backups se encuentran en: $BACKUP_DIR${NC}"
