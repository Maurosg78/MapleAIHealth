#!/bin/bash

# Script para sincronizar tareas con GitHub Projects
# Necesitarás un token de acceso personal con permisos 'repo' y 'project'
# Uso: GITHUB_TOKEN=tu_token_aqui ./sync_github_project.sh

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN no está definido. Usa: GITHUB_TOKEN=tu_token ./sync_github_project.sh"
  exit 1
fi

# Configuración
OWNER="Maurosg78"
REPO="MapleAIHealth"
PROJECT_NUMBER=2  # El número de tu proyecto (visible en la URL)

# Obtener el ID del proyecto
PROJECT_ID=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/users/$OWNER/projects" | \
  jq ".[] | select(.number == $PROJECT_NUMBER) | .id")

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No se pudo encontrar el proyecto con número $PROJECT_NUMBER"
  exit 1
fi

echo "Proyecto encontrado con ID: $PROJECT_ID"

# Función para crear un issue y añadirlo al proyecto
create_issue_and_add_to_project() {
  local title="$1"
  local body="$2"
  local labels="$3"
  local status="$4"  # Todo, In Progress, Done

  # Crear el issue
  response=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"title\":\"$title\",\"body\":\"$body\",\"labels\":$labels}" \
    "https://api.github.com/repos/$OWNER/$REPO/issues")
  
  issue_number=$(echo $response | jq '.number')
  
  if [ -z "$issue_number" ] || [ "$issue_number" = "null" ]; then
    echo "Error al crear el issue: $title"
    echo $response
    return
  fi
  
  echo "Issue creado: #$issue_number - $title"
  
  # Añadir el issue al proyecto
  issue_id=$(echo $response | jq '.id')
  
  card_response=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"content_id\":$issue_id,\"content_type\":\"Issue\"}" \
    "https://api.github.com/projects/$PROJECT_ID/columns/$status/cards")
  
  echo "Issue añadido al proyecto en columna $status"
}

# Crear issues para Sprint 1 (completado)
echo "Creando issues para Sprint 1 (completado)..."

create_issue_and_add_to_project \
  "[Sprint 1] Sistema de Autenticación y Autorización" \
  "- Implementado sistema de login/registro con JWT\n- Configurado sistema de roles (médico, admin)\n- Implementada recuperación de contraseña\n- Añadida validación de sesiones\n- Creadas rutas protegidas por roles" \
  "[\"core\",\"high-priority\",\"auth\"]" \
  "Done"

create_issue_and_add_to_project \
  "[Sprint 1] Configuración de APIs Médicas" \
  "- Integrada API de PubMed\n- Implementadas funciones de búsqueda básicas\n- Configurado manejo de credenciales\n- Creada documentación completa de endpoints\n- Implementado manejo de errores y gestión de límites de velocidad" \
  "[\"core\",\"high-priority\",\"api\"]" \
  "Done"

create_issue_and_add_to_project \
  "[Sprint 1] Sistema de Gestión de Pacientes (Base)" \
  "- Creado modelo detallado de pacientes\n- Implementados endpoints CRUD\n- Desarrollada validación de datos\n- Implementada búsqueda avanzada\n- Creada interfaz responsive de gestión" \
  "[\"core\",\"high-priority\",\"patients\"]" \
  "Done"

# Crear issues para Sprint 2 (planificado)
echo "Creando issues para Sprint 2 (planificado)..."

create_issue_and_add_to_project \
  "[Sprint 2] Optimización de Sistema de Caché" \
  "Implementar sistema de caché para mejorar el rendimiento de la aplicación, especialmente en las consultas a APIs externas." \
  "[\"enhancement\",\"performance\"]" \
  "Todo"

create_issue_and_add_to_project \
  "[Sprint 2] Dashboard de Información Clínica" \
  "Desarrollar un dashboard interactivo que muestre información clínica relevante para el profesional de salud." \
  "[\"feature\",\"ui\"]" \
  "Todo"

create_issue_and_add_to_project \
  "[Sprint 2] Componente de Visualización de Evidencia" \
  "Crear componentes para visualizar evidencia médica obtenida de PubMed y otras fuentes." \
  "[\"feature\",\"ui\"]" \
  "Todo"

# Crear issues para Sprint 3 (planificado)
echo "Creando issues para Sprint 3 (planificado)..."

create_issue_and_add_to_project \
  "[Sprint 3] Integración de Asistente IA" \
  "Implementar un asistente basado en IA para apoyar en decisiones clínicas." \
  "[\"feature\",\"ai\"]" \
  "Todo"

create_issue_and_add_to_project \
  "[Sprint 3] Sistema de Registro de Interacciones" \
  "Desarrollar un sistema para registrar y analizar las interacciones de los usuarios con la plataforma." \
  "[\"feature\",\"analytics\"]" \
  "Todo"

echo "Sincronización completada." 