import { Octokit } from '@octokit/rest';
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

const owner = 'Maurosg78';
const repo = 'MapleAIHealth';

async function getRepositoryInfo() {
  try {
    const { repository } = await graphqlWithAuth(`
      query {
        repository(owner: "${owner}", name: "${repo}") {
          id
          owner {
            id
          }
        }
      }
    `);
    return repository;
  } catch (error) {
    console.error('Error al obtener información del repositorio:', error);
    throw error;
  }
}

async function createProject(ownerId, repoId) {
  try {
    const result = await graphqlWithAuth(`
      mutation {
        createProjectV2(
          input: {
            ownerId: "${ownerId}"
            title: "MapleAI Health MVP"
            repositoryId: "${repoId}"
          }
        ) {
          projectV2 {
            id
            number
          }
        }
      }
    `);

    return result.createProjectV2.projectV2;
  } catch (error) {
    console.error('Error al crear el proyecto:', error);
    throw error;
  }
}

async function configureProjectFields(projectId) {
  try {
    // Crear campo de estado personalizado
    const statusField = await graphqlWithAuth(`
      mutation {
        createProjectV2Field(
          input: {
            projectId: "${projectId}"
            dataType: SINGLE_SELECT
            name: "Estado"
            singleSelectOptions: [
              { name: "Por hacer", description: "Tarea pendiente de iniciar", color: PINK },
              { name: "En progreso", description: "Tarea en desarrollo", color: ORANGE },
              { name: "En revisión", description: "Tarea en proceso de revisión", color: PURPLE },
              { name: "Completado", description: "Tarea finalizada", color: GREEN }
            ]
          }
        ) {
          projectV2Field {
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
    `);

    // Crear campo de prioridad
    const priorityField = await graphqlWithAuth(`
      mutation {
        createProjectV2Field(
          input: {
            projectId: "${projectId}"
            dataType: SINGLE_SELECT
            name: "Prioridad"
            singleSelectOptions: [
              { name: "Alta", description: "Prioridad máxima", color: RED },
              { name: "Media", description: "Prioridad normal", color: ORANGE },
              { name: "Baja", description: "Prioridad mínima", color: BLUE }
            ]
          }
        ) {
          projectV2Field {
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
    `);

    return {
      statusFieldId: statusField.createProjectV2Field.projectV2Field.id,
      priorityFieldId: priorityField.createProjectV2Field.projectV2Field.id
    };
  } catch (error) {
    console.error('Error al configurar campos del proyecto:', error);
    throw error;
  }
}

async function addIssuesToProject(projectId, issues) {
  try {
    for (const issue of issues) {
      await graphqlWithAuth(`
        mutation {
          addProjectV2ItemById(
            input: {
              projectId: "${projectId}"
              contentId: "${issue.id}"
            }
          ) {
            item {
              id
            }
          }
        }
      `);
    }
  } catch (error) {
    console.error('Error al añadir issues al proyecto:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Obteniendo información del repositorio...');
    const repoInfo = await getRepositoryInfo();
    console.log('Información del repositorio obtenida:', repoInfo);

    console.log('Creando proyecto MVP...');
    const project = await createProject(repoInfo.owner.id, repoInfo.id);
    console.log('Proyecto creado con ID:', project.id);

    console.log('Configurando campos del proyecto...');
    const fields = await configureProjectFields(project.id);
    console.log('Campos configurados:', fields);

    // Obtener los issues existentes
    const { repository } = await graphqlWithAuth(`
      query {
        repository(owner: "${owner}", name: "${repo}") {
          issues(first: 100, states: OPEN) {
            nodes {
              id
              title
            }
          }
        }
      }
    `);

    console.log('Añadiendo issues al proyecto...');
    await addIssuesToProject(project.id, repository.issues.nodes);
    
    console.log('¡Proyecto MVP configurado exitosamente!');
  } catch (error) {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  }
}

main(); 