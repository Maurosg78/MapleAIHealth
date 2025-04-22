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

- `/documentacion`: Contiene toda la documentación organizada del proyecto.
  - El archivo principal es `/documentacion/readme_master_data.md`.
- `/src`: Código fuente de la aplicación.
- `/scripts`: Scripts de automatización y utilidades.

## Pasos Post-Migración

1. Ejecutar `npm install` para instalar dependencias.
2. Revisar que los scripts de GitHub Actions estén correctamente configurados.
3. Verificar que las rutas en los archivos de configuración apunten correctamente.
4. Actualizar las URL del repositorio en la documentación.

---
