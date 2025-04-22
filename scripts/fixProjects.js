import { graphql } from '@octokit/graphql';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Intentar leer el token desde múltiples fuentes
let GITHUB_TOKEN;

// 1. Intentar leer desde variables de entorno
GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.MAPLE_HEALTH_TOKEN;

// 2. Si no está en variables de entorno, intentar leer desde archivo
if (!GITHUB_TOKEN) {
  try {
    const tokenPath = path.join(process.cwd(), '.github_token.txt');
    if (fs.existsSync(tokenPath)) {
      GITHUB_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
      console.log('Token leído desde archivo .github_token.txt');
    }
  } catch (error) {
    console.error('Error al leer el archivo de token:', error.message);
  }
}

if (!GITHUB_TOKEN) {
  console.error('Error: No se encontró GITHUB_TOKEN');
  process.exit(1);
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});

async function deleteProject(projectId) {
  try {
    await graphqlWithAuth(`
      mutation {
        deleteProjectV2(
          input: {
            projectId: "${projectId}"
          }
        ) {
          projectV2 {
            id
          }
        }
      }
    `);
    console.log(`Proyecto eliminado: ${projectId}`);
  } catch (error) {
    console.error(`Error al eliminar proyecto ${projectId}:`, error);
  }
}

async function makeProjectPublic(projectId) {
  try {
    await graphqlWithAuth(`
      mutation {
        updateProjectV2(
          input: {
            projectId: "${projectId}"
            public: true
          }
        ) {
          projectV2 {
            id
            public
          }
        }
      }
    `);
    console.log(`Proyecto hecho público: ${projectId}`);
  } catch (error) {
    console.error(`Error al hacer público el proyecto ${projectId}:`, error);
  }
}

async function main() {
  try {
    // Obtener todos los proyectos
    const { user } = await graphqlWithAuth(`
      query {
        user(login: "mauriciosobarzo") {
          projectsV2(first: 10) {
            nodes {
              id
              title
              number
              public
              items(first: 10) {
                nodes {
                  id
                }
              }
            }
          }
        }
      }
    `);

    const projects = user.projectsV2.nodes;
    
    // Encontrar proyectos MVP
    const mvpProjects = projects.filter(p => p.title === "MapleAI Health MVP");
    
    // Encontrar el proyecto principal (el que tiene items)
    const mainProject = mvpProjects.find(p => p.items.nodes.length > 0);
    
    if (!mainProject) {
      console.error('No se encontró el proyecto principal con items');
      return;
    }

    // Hacer público el proyecto principal
    console.log('Haciendo público el proyecto principal...');
    await makeProjectPublic(mainProject.id);

    // Eliminar los proyectos duplicados
    console.log('Eliminando proyectos duplicados...');
    for (const project of mvpProjects) {
      if (project.id !== mainProject.id) {
        await deleteProject(project.id);
      }
    }

    console.log('¡Correcciones completadas!');
  } catch (error) {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  }
}

main(); 