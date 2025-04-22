#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para sincronizar tareas con GitHub Projects
Requiere Python 3.6+ y las dependencias instaladas

Uso: GITHUB_TOKEN=tu_token_aqui python sync_github_projects.py
"""

import os
import sys
import requests
import json
from typing import List, Dict, Any, Optional

# Verificar token
token = os.environ.get("GITHUB_TOKEN")
if not token:
    print("Error: GITHUB_TOKEN no está definido. Usa: GITHUB_TOKEN=tu_token python sync_github_projects.py")
    sys.exit(1)

# Configuración
owner = "mauriciosobarzo"
repo = "MapleAIHealth"
project_number = 2

# Headers para API REST
headers = {
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github.v3+json"
}

# Headers para API GraphQL
graphql_headers = {
    "Authorization": f"bearer {token}",
    "Content-Type": "application/json"
}

def get_project_id() -> str:
    """Obtener el ID del proyecto usando GraphQL"""
    query = """
    query {
        user(login: "%s") {
            projectV2(number: %d) {
                id
                fields(first: 20) {
                    nodes {
                        ... on ProjectV2SingleSelectField {
                            id
                            name
                            options {
                                id
                                name
                            }
                        }
                    }
                }
            }
        }
    }
    """ % (owner, project_number)
    
    response = requests.post(
        "https://api.github.com/graphql",
        headers=graphql_headers,
        json={"query": query}
    )
    
    if response.status_code != 200:
        print(f"Error al obtener el proyecto: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    project_id = data["data"]["user"]["projectV2"]["id"]
    print(f"Proyecto encontrado con ID: {project_id}")
    
    # Buscar el campo de estado y sus opciones
    status_field = None
    for field in data["data"]["user"]["projectV2"]["fields"]["nodes"]:
        if field.get("name") == "Status":
            status_field = field
            break
    
    if not status_field:
        print("No se encontró el campo 'Status' en el proyecto")
        sys.exit(1)
    
    status_field_id = status_field["id"]
    
    status_options = {}
    for option in status_field["options"]:
        status_options[option["name"]] = option["id"]
    
    return project_id, status_field_id, status_options

def create_issue(title: str, body: str, labels: List[str]) -> Dict[str, Any]:
    """Crear un issue en el repositorio"""
    url = f"https://api.github.com/repos/{owner}/{repo}/issues"
    payload = {
        "title": title,
        "body": body,
        "labels": labels
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 201:
        print(f"Error al crear el issue '{title}': {response.status_code}")
        print(response.text)
        return None
    
    issue_data = response.json()
    print(f"Issue creado: #{issue_data['number']} - {title}")
    
    return issue_data

def add_issue_to_project(project_id: str, issue_node_id: str, status_field_id: str, 
                         status_option_id: str) -> bool:
    """Añadir un issue al proyecto y establecer su estado"""
    # Añadir el issue al proyecto
    add_mutation = """
    mutation {
        addProjectV2ItemById(input: {
            projectId: "%s"
            contentId: "%s"
        }) {
            item {
                id
            }
        }
    }
    """ % (project_id, issue_node_id)
    
    response = requests.post(
        "https://api.github.com/graphql",
        headers=graphql_headers,
        json={"query": add_mutation}
    )
    
    if response.status_code != 200:
        print(f"Error al añadir el issue al proyecto: {response.status_code}")
        print(response.text)
        return False
    
    try:
        item_id = response.json()["data"]["addProjectV2ItemById"]["item"]["id"]
    except:
        print(f"Error al obtener el ID del item: {response.text}")
        return False
    
    # Establecer el estado del issue
    status_mutation = """
    mutation {
        updateProjectV2ItemFieldValue(input: {
            projectId: "%s"
            itemId: "%s"
            fieldId: "%s"
            value: { 
                singleSelectOptionId: "%s"
            }
        }) {
            projectV2Item {
                id
            }
        }
    }
    """ % (project_id, item_id, status_field_id, status_option_id)
    
    response = requests.post(
        "https://api.github.com/graphql",
        headers=graphql_headers,
        json={"query": status_mutation}
    )
    
    if response.status_code != 200:
        print(f"Error al establecer el estado del issue: {response.status_code}")
        print(response.text)
        return False
    
    return True

def create_issue_and_add_to_project(title: str, body: str, labels: List[str], status: str,
                                    project_id: str, status_field_id: str, status_options: Dict[str, str]) -> bool:
    """Crear un issue y añadirlo al proyecto"""
    try:
        # Crear el issue
        issue_data = create_issue(title, body, labels)
        if not issue_data:
            return False
        
        # Obtener el ID de la opción de estado
        if status not in status_options:
            print(f"Error: El estado '{status}' no es válido. Opciones disponibles: {list(status_options.keys())}")
            return False
        
        status_option_id = status_options[status]
        
        # Añadir el issue al proyecto y establecer su estado
        success = add_issue_to_project(
            project_id, 
            issue_data["node_id"], 
            status_field_id, 
            status_option_id
        )
        
        if success:
            print(f"Issue añadido al proyecto en columna {status}")
        
        return success
    except Exception as e:
        print(f"Error al procesar issue '{title}': {str(e)}")
        return False

def main():
    # Obtener el ID del proyecto y la información de los campos
    project_id, status_field_id, status_options = get_project_id()
    
    # Crear issues para Sprint 1 (completado)
    print("Creando issues para Sprint 1 (completado)...")
    
    create_issue_and_add_to_project(
        "[Sprint 1] Sistema de Autenticación y Autorización",
        "- Implementado sistema de login/registro con JWT\n- Configurado sistema de roles (médico, admin)\n- Implementada recuperación de contraseña\n- Añadida validación de sesiones\n- Creadas rutas protegidas por roles",
        ["core", "high-priority", "auth"],
        "Done",
        project_id, status_field_id, status_options
    )
    
    create_issue_and_add_to_project(
        "[Sprint 1] Configuración de APIs Médicas",
        "- Integrada API de PubMed\n- Implementadas funciones de búsqueda básicas\n- Configurado manejo de credenciales\n- Creada documentación completa de endpoints\n- Implementado manejo de errores y gestión de límites de velocidad",
        ["core", "high-priority", "api"],
        "Done",
        project_id, status_field_id, status_options
    )
    
    create_issue_and_add_to_project(
        "[Sprint 1] Sistema de Gestión de Pacientes (Base)",
        "- Creado modelo detallado de pacientes\n- Implementados endpoints CRUD\n- Desarrollada validación de datos\n- Implementada búsqueda avanzada\n- Creada interfaz responsive de gestión",
        ["core", "high-priority", "patients"],
        "Done",
        project_id, status_field_id, status_options
    )
    
    # Crear issues para Sprint 2 (planificado)
    print("Creando issues para Sprint 2 (planificado)...")
    
    create_issue_and_add_to_project(
        "[Sprint 2] Optimización de Sistema de Caché",
        "Implementar sistema de caché para mejorar el rendimiento de la aplicación, especialmente en las consultas a APIs externas.",
        ["enhancement", "performance"],
        "Todo",
        project_id, status_field_id, status_options
    )
    
    create_issue_and_add_to_project(
        "[Sprint 2] Dashboard de Información Clínica",
        "Desarrollar un dashboard interactivo que muestre información clínica relevante para el profesional de salud.",
        ["feature", "ui"],
        "Todo",
        project_id, status_field_id, status_options
    )
    
    create_issue_and_add_to_project(
        "[Sprint 2] Componente de Visualización de Evidencia",
        "Crear componentes para visualizar evidencia médica obtenida de PubMed y otras fuentes.",
        ["feature", "ui"],
        "Todo",
        project_id, status_field_id, status_options
    )
    
    # Crear issues para Sprint 3 (planificado)
    print("Creando issues para Sprint 3 (planificado)...")
    
    create_issue_and_add_to_project(
        "[Sprint 3] Integración de Asistente IA",
        "Implementar un asistente basado en IA para apoyar en decisiones clínicas.",
        ["feature", "ai"],
        "Todo",
        project_id, status_field_id, status_options
    )
    
    create_issue_and_add_to_project(
        "[Sprint 3] Sistema de Registro de Interacciones",
        "Desarrollar un sistema para registrar y analizar las interacciones de los usuarios con la plataforma.",
        ["feature", "analytics"],
        "Todo",
        project_id, status_field_id, status_options
    )
    
    print("Sincronización completada.")

if __name__ == "__main__":
    main() 