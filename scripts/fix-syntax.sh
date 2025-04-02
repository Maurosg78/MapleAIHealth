#!/bin/bash

echo "Iniciando corrección de errores de sintaxis..."

# Crear directorio de backups con timestamp
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)_syntax"
mkdir -p "$BACKUP_DIR"

# Función para procesar cada archivo
process_file() {
    local file="$1"
    echo "Procesando: $file"

    # Crear backup
    local backup_path="$BACKUP_DIR/$(basename "$file")"
    cp "$file" "$backup_path"
    echo "Backup creado: $backup_path"

    # Usar prettier para formatear el código
    npx prettier --write "$file"

    if [ $? -eq 0 ]; then
        echo "Errores de sintaxis corregidos en: $file"
    else
        echo "Error al procesar: $file"
    fi
}

# Encontrar todos los archivos TypeScript/JavaScript
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    process_file "$file"
done

echo "Corrección de errores de sintaxis completada"
echo "Los backups se encuentran en: $BACKUP_DIR"
