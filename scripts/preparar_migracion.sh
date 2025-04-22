#!/bin/bash

# Script para preparar la migración de MapleAI Health a un nuevo repositorio
# Este script organiza la documentación, crea archivos necesarios y limpia el proyecto

echo "🍁 Preparando MapleAI Health para migración a nuevo repositorio..."

# 1. Organizar la documentación (ya hecho previamente)
if [ ! -d "documentacion" ]; then
  echo "❌ Error: Primero ejecuta ./scripts/organizar_documentacion.sh"
  exit 1
fi

# 2. Crear un archivo de token de ejemplo para el nuevo repositorio
cat > .github_token.example.txt << EOF
# Archivo de ejemplo para configurar tu token de GitHub
# Renombra este archivo a .github_token.txt y añade tu token personal de GitHub

# Token de GitHub con permisos 'repo' completos
GITHUB_TOKEN=tu_token_aqui

# No compartas este archivo ni lo subas al repositorio
EOF

# 3. Crear un archivo de instrucciones para la migración
cat > INSTRUCCIONES_MIGRACION.md << EOF
# Instrucciones para Migrar MapleAI Health

## Preparación del Nuevo Repositorio

1. Crear un nuevo repositorio en GitHub.
2. Clonar el nuevo repositorio localmente.
3. Copiar los archivos de este proyecto al nuevo repositorio.

## Configuración del Token de GitHub

1. Crear un token de acceso personal en GitHub con permisos 'repo'.
2. Renombrar el archivo '.github_token.example.txt' a '.github_token.txt'.
3. Reemplazar 'tu_token_aqui' con el token generado.

## Estructura de Carpetas Importante

- \`/documentacion\`: Contiene toda la documentación organizada del proyecto.
  - El archivo principal es \`/documentacion/readme_master_data.md\`.
- \`/src\`: Código fuente de la aplicación.
- \`/scripts\`: Scripts de automatización y utilidades.

## Pasos Post-Migración

1. Ejecutar \`npm install\` para instalar dependencias.
2. Revisar que los scripts de GitHub Actions estén correctamente configurados.
3. Verificar que las rutas en los archivos de configuración apunten correctamente.
4. Actualizar las URL del repositorio en la documentación.

---
EOF

# 4. Crear archivo .gitignore para el nuevo repositorio (si no existe)
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << EOF
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.vscode
.github_token.txt

npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
fi

echo "✅ Preparación completada con éxito"
echo "📋 Por favor, lee INSTRUCCIONES_MIGRACION.md para los próximos pasos" 