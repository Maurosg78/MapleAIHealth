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

# Componentes Comunes
create_issue "[Components] Crear componente Button" \
"## Objetivo
Crear un componente Button reutilizable con diferentes variantes y estados.

## Criterios de Aceptación
- [ ] Implementar variantes (primary, secondary, outline)
- [ ] Implementar estados (default, hover, active, disabled)
- [ ] Implementar tamaños (sm, md, lg)
- [ ] Agregar soporte para iconos
- [ ] Implementar loading state
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 3 horas" \
'["components", "high-priority", "sprint-1"]'

create_issue "[Components] Crear componente Input" \
"## Objetivo
Crear un componente Input reutilizable con validación y estados.

## Criterios de Aceptación
- [ ] Implementar tipos (text, number, email, password)
- [ ] Implementar estados (default, focus, error)
- [ ] Agregar soporte para label y error message
- [ ] Implementar validación básica
- [ ] Agregar soporte para iconos
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 3 horas" \
'["components", "high-priority", "sprint-1"]'

create_issue "[Components] Crear componente Card" \
"## Objetivo
Crear un componente Card reutilizable para mostrar contenido.

## Criterios de Aceptación
- [ ] Implementar variantes (default, elevated, bordered)
- [ ] Agregar soporte para header y footer
- [ ] Implementar padding y spacing configurables
- [ ] Agregar soporte para acciones
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Media
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["components", "sprint-1"]'

# Componentes de Layout
create_issue "[Components] Crear componente Header" \
"## Objetivo
Crear un componente Header para la navegación principal.

## Criterios de Aceptación
- [ ] Implementar navegación responsive
- [ ] Agregar soporte para logo
- [ ] Implementar menú de navegación
- [ ] Agregar soporte para acciones (perfil, notificaciones)
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 3 horas" \
'["components", "high-priority", "sprint-1"]'

create_issue "[Components] Crear componente Sidebar" \
"## Objetivo
Crear un componente Sidebar para navegación secundaria.

## Criterios de Aceptación
- [ ] Implementar navegación colapsable
- [ ] Agregar soporte para grupos de menú
- [ ] Implementar estados activos
- [ ] Agregar soporte para iconos
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 3 horas" \
'["components", "high-priority", "sprint-1"]'

create_issue "[Components] Crear componente Footer" \
"## Objetivo
Crear un componente Footer para información adicional.

## Criterios de Aceptación
- [ ] Implementar secciones de información
- [ ] Agregar soporte para enlaces
- [ ] Implementar responsive design
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Baja
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["components", "sprint-1"]'

# Componentes de Formularios
create_issue "[Components] Crear componente Form" \
"## Objetivo
Crear un componente Form para manejo de formularios.

## Criterios de Aceptación
- [ ] Integrar con react-hook-form
- [ ] Implementar validación con yup
- [ ] Agregar soporte para campos dinámicos
- [ ] Implementar manejo de errores
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 4 horas" \
'["components", "high-priority", "sprint-1"]'

create_issue "[Components] Crear componente Field" \
"## Objetivo
Crear un componente Field para campos de formulario.

## Criterios de Aceptación
- [ ] Integrar con react-hook-form
- [ ] Implementar diferentes tipos de campos
- [ ] Agregar validación y mensajes de error
- [ ] Implementar estados de carga
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 3 horas" \
'["components", "high-priority", "sprint-1"]'

# Componentes de Feedback
create_issue "[Components] Crear componente Alert" \
"## Objetivo
Crear un componente Alert para mensajes de feedback.

## Criterios de Aceptación
- [ ] Implementar variantes (success, error, warning, info)
- [ ] Agregar soporte para iconos
- [ ] Implementar cierre automático
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Media
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["components", "sprint-1"]'

create_issue "[Components] Crear componente Toast" \
"## Objetivo
Crear un componente Toast para notificaciones temporales.

## Criterios de Aceptación
- [ ] Implementar variantes (success, error, warning, info)
- [ ] Agregar soporte para iconos
- [ ] Implementar animaciones
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Media
## Epic: EPIC-1
## Sprint: 1
## Estimación: 2 horas" \
'["components", "sprint-1"]'

create_issue "[Components] Crear componente Modal" \
"## Objetivo
Crear un componente Modal para diálogos y contenido modal.

## Criterios de Aceptación
- [ ] Implementar animaciones de entrada/salida
- [ ] Agregar soporte para header y footer
- [ ] Implementar diferentes tamaños
- [ ] Agregar soporte para scroll
- [ ] Crear tests unitarios
- [ ] Documentar uso y props

## Prioridad: Alta
## Epic: EPIC-1
## Sprint: 1
## Estimación: 3 horas" \
'["components", "high-priority", "sprint-1"]' 