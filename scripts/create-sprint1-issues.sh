#!/bin/bash

# Token de GitHub necesario para la API
# Asegúrate de tener configurada la variable de entorno GITHUB_TOKEN

REPO="Maurosg78/MapleAIHealth"
GITHUB_API="https://api.github.com/repos/$REPO/issues"

# Función para crear un issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"

    curl -X POST $GITHUB_API \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -d "{
            \"title\": \"$title\",
            \"body\": \"$body\",
            \"labels\": $labels
        }"
}

# Setup Inicial del Proyecto
create_issue "[Setup] Configuración de ESLint y Prettier" \
"## Objetivo
Configurar ESLint y Prettier para mantener un código consistente y de alta calidad.

## Criterios de Aceptación
- [ ] Instalar dependencias necesarias
- [ ] Configurar reglas de ESLint
- [ ] Configurar reglas de Prettier
- [ ] Integrar ESLint con Prettier
- [ ] Verificar que el formateo automático funcione
- [ ] Documentar configuración en README

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["setup", "high-priority", "sprint-1"]'

create_issue "[Setup] Configuración de TypeScript" \
"## Objetivo
Configurar TypeScript para el proyecto con las mejores prácticas.

## Criterios de Aceptación
- [ ] Configurar tsconfig.json
- [ ] Establecer reglas estrictas de TypeScript
- [ ] Configurar paths y aliases
- [ ] Verificar compilación correcta
- [ ] Documentar configuración en README

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["setup", "high-priority", "sprint-1"]'

create_issue "[Setup] Configuración de Tailwind CSS" \
"## Objetivo
Configurar Tailwind CSS para el diseño de la interfaz.

## Criterios de Aceptación
- [ ] Instalar y configurar Tailwind CSS
- [ ] Configurar PostCSS
- [ ] Crear tema personalizado
- [ ] Verificar que los estilos funcionen
- [ ] Documentar configuración en README

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["setup", "high-priority", "sprint-1"]'

create_issue "[Setup] Configuración de React Router" \
"## Objetivo
Configurar el sistema de enrutamiento con React Router.

## Criterios de Aceptación
- [ ] Instalar React Router
- [ ] Configurar rutas principales
- [ ] Implementar layout base
- [ ] Configurar navegación
- [ ] Documentar estructura de rutas

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 3 horas" \
'["setup", "high-priority", "sprint-1"]'

create_issue "[Setup] Configuración de React Query" \
"## Objetivo
Configurar React Query para el manejo de estado y caché.

## Criterios de Aceptación
- [ ] Instalar React Query
- [ ] Configurar cliente
- [ ] Implementar hooks base
- [ ] Configurar devtools
- [ ] Documentar uso básico

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["setup", "high-priority", "sprint-1"]' 