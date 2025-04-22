#!/usr/bin/env node

/**
 * Script para sincronizar tareas con GitHub Projects v2
 * Requiere Node.js y las dependencias instaladas
 * 
 * Uso: GITHUB_TOKEN=tu_token_aqui node sync_github_projects_v2.js
 */

const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');

// Verificar token
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Error: GITHUB_TOKEN no está definido. Usa: GITHUB_TOKEN=tu_token node sync_github_projects_v2.js');
  process.exit(1);
}

// Configuración
const owner = 'Maurosg78';
const repo = 'MapleAIHealth';
const projectNumber = 2;

// Inicializar Octokit para la API REST
const octokit = new Octokit({
  auth: token
});

// Inicializar GraphQL para la API de Projects v2
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`
  }
});

async function run() {
  try {
    // Paso 1: Obtener el ID del proyecto usando GraphQL
    const projectData = await graphqlWithAuth(`
      query {
        user(login: "${owner}") {
          projectV2(number: ${projectNumber}) {
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
    `);

    const projectId = projectData.user.projectV2.id;
    console.log(`Proyecto encontrado con ID: ${projectId}`);

    // Buscar el campo de estado y sus opciones
    const statusField = projectData.user.projectV2.fields.nodes.find(
      field => field.name === 'Status'
    );

    if (!statusField) {
      console.error('No se encontró el campo "Status" en el proyecto');
      process.exit(1);
    }

    const todoOption = statusField.options.find(option => option.name === 'Todo');
    const inProgressOption = statusField.options.find(option => option.name === 'In Progress');
    const doneOption = statusField.options.find(option => option.name === 'Done');

    // Función para crear un issue y añadirlo al proyecto
    async function createIssueAndAddToProject(title, body, labels, status) {
      try {
        // Crear el issue
        const issueResponse = await octokit.issues.create({
          owner,
          repo,
          title,
          body,
          labels
        });

        console.log(`Issue creado: #${issueResponse.data.number} - ${title}`);

        // Añadir el issue al proyecto
        const addToProjectResponse = await graphqlWithAuth(`
          mutation {
            addProjectV2ItemById(input: {
              projectId: "${projectId}"
              contentId: "${issueResponse.data.node_id}"
            }) {
              item {
                id
              }
            }
          }
        `);

        const itemId = addToProjectResponse.addProjectV2ItemById.item.id;

        // Determinar el valor del estado basado en el parámetro
        let statusOptionId;
        if (status === 'Todo') {
          statusOptionId = todoOption.id;
        } else if (status === 'In Progress') {
          statusOptionId = inProgressOption.id;
        } else if (status === 'Done') {
          statusOptionId = doneOption.id;
        }

        // Establecer el estado del item
        await graphqlWithAuth(`
          mutation {
            updateProjectV2ItemFieldValue(input: {
              projectId: "${projectId}"
              itemId: "${itemId}"
              fieldId: "${statusField.id}"
              value: { 
                singleSelectOptionId: "${statusOptionId}"
              }
            }) {
              projectV2Item {
                id
              }
            }
          }
        `);

        console.log(`Issue añadido al proyecto en columna ${status}`);
      } catch (error) {
        console.error(`Error al procesar issue "${title}":`, error.message);
      }
    }

    // Crear issues para Sprint 1 (completado)
    console.log("Creando issues para Sprint 1 (completado)...");
    
    await createIssueAndAddToProject(
      "[Sprint 1] Sistema de Autenticación y Autorización",
      "- Implementado sistema de login/registro con JWT\n- Configurado sistema de roles (médico, admin)\n- Implementada recuperación de contraseña\n- Añadida validación de sesiones\n- Creadas rutas protegidas por roles",
      ["core", "high-priority", "auth"],
      "Done"
    );
    
    await createIssueAndAddToProject(
      "[Sprint 1] Configuración de APIs Médicas",
      "- Integrada API de PubMed\n- Implementadas funciones de búsqueda básicas\n- Configurado manejo de credenciales\n- Creada documentación completa de endpoints\n- Implementado manejo de errores y gestión de límites de velocidad",
      ["core", "high-priority", "api"],
      "Done"
    );
    
    await createIssueAndAddToProject(
      "[Sprint 1] Sistema de Gestión de Pacientes (Base)",
      "- Creado modelo detallado de pacientes\n- Implementados endpoints CRUD\n- Desarrollada validación de datos\n- Implementada búsqueda avanzada\n- Creada interfaz responsive de gestión",
      ["core", "high-priority", "patients"],
      "Done"
    );
    
    // Crear issues para Sprint 2 (planificado)
    console.log("Creando issues para Sprint 2 (planificado)...");
    
    await createIssueAndAddToProject(
      "[Sprint 2] Optimización de Sistema de Caché",
      "Implementar sistema de caché para mejorar el rendimiento de la aplicación, especialmente en las consultas a APIs externas.",
      ["enhancement", "performance"],
      "Todo"
    );
    
    await createIssueAndAddToProject(
      "[Sprint 2] Dashboard de Información Clínica",
      "Desarrollar un dashboard interactivo que muestre información clínica relevante para el profesional de salud.",
      ["feature", "ui"],
      "Todo"
    );
    
    await createIssueAndAddToProject(
      "[Sprint 2] Componente de Visualización de Evidencia",
      "Crear componentes para visualizar evidencia médica obtenida de PubMed y otras fuentes.",
      ["feature", "ui"],
      "Todo"
    );
    
    // Crear issues para Sprint 3 (planificado)
    console.log("Creando issues para Sprint 3 (planificado)...");
    
    await createIssueAndAddToProject(
      "[Sprint 3] Integración de Asistente IA",
      "Implementar un asistente basado en IA para apoyar en decisiones clínicas.",
      ["feature", "ai"],
      "Todo"
    );
    
    await createIssueAndAddToProject(
      "[Sprint 3] Sistema de Registro de Interacciones",
      "Desarrollar un sistema para registrar y analizar las interacciones de los usuarios con la plataforma.",
      ["feature", "analytics"],
      "Todo"
    );
    
    console.log("Sincronización completada.");
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run(); 