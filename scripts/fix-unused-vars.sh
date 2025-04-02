#!/bin/bash

echo "Iniciando corrección de variables no utilizadas..."

# Crear directorio de backups con timestamp
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)_unused_vars"
mkdir -p "$BACKUP_DIR"

# Función para procesar cada archivo
process_file() {
    local file="$1"
    echo "Procesando: $file"

    # Crear backup
    local backup_path="$BACKUP_DIR/$(basename "$file")"
    cp "$file" "$backup_path"
    echo "Backup creado: $backup_path"

    # Usar eslint --fix para corregir variables no utilizadas
    npx eslint "$file" --fix --rule "@typescript-eslint/no-unused-vars: error"

    if [ $? -eq 0 ]; then
        echo "Variables no utilizadas corregidas en: $file"
    else
        echo "Error al procesar: $file"
    fi
}

# Encontrar todos los archivos TypeScript/JavaScript
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    process_file "$file"
done

echo "Corrección de variables no utilizadas completada"
echo "Los backups se encuentran en: $BACKUP_DIR"
