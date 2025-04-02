#!/bin/bash

echo "Iniciando corrección de imports (v2)..."

# Crear directorio de backups con timestamp
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)_imports_v2"
mkdir -p "$BACKUP_DIR"

# Función para procesar cada archivo
process_file() {
    local file="$1"
    echo "Procesando: $file"

    # Crear backup
    local backup_path="$BACKUP_DIR/$(basename "$file")"
    cp "$file" "$backup_path"
    echo "Backup creado: $backup_path"

    # Leer el contenido del archivo
    content=$(cat "$file")

    # Corregir los imports concatenados
    corrected_content=$(echo "$content" | awk '
        BEGIN {
            in_import = 0
            import_block = ""
            rest = ""
        }
        /^import/ {
            in_import = 1
            if (import_block == "") {
                import_block = $0
            } else {
                import_block = import_block "\n" $0
            }
            next
        }
        in_import && /^}/ {
            import_block = import_block "\n" $0
            in_import = 0
            next
        }
        in_import {
            import_block = import_block "\n" $0
            next
        }
        {
            if (rest == "") {
                rest = $0
            } else {
                rest = rest "\n" $0
            }
        }
        END {
            # Procesar el bloque de imports
            split(import_block, imports, ";")
            for (i in imports) {
                if (imports[i] ~ /^[[:space:]]*$/) continue
                gsub(/import[[:space:]]*\{[[:space:]]*/, "import { ", imports[i])
                gsub(/[[:space:]]*\}[[:space:]]*from/, " } from", imports[i])
                print imports[i]
            }
            print rest
        }
    ')

    # Guardar el contenido corregido
    echo "$corrected_content" > "$file"

    echo "Imports corregidos en: $file"
}

# Encontrar todos los archivos TypeScript/JavaScript
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    process_file "$file"
done

echo "Corrección de imports completada"
echo "Los backups se encuentran en: $BACKUP_DIR"
