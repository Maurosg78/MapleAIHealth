import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Obtener el token de GitHub
let githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  try {
    githubToken = fs.readFileSync('.github_token.txt', 'utf8').trim();
  } catch (error) {
    console.error('Error: No se encontró el token de GitHub');
    process.exit(1);
  }
}

const octokit = new Octokit({ auth: githubToken });

async function checkIssueInProject(projectId, nodeId) {
  try {
    const query = `
    query($projectId: ID!, $nodeId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100) {
            nodes {
              content {
                ... on Issue {
                  id
                }
              }
            }
          }
        }
      }
      issue: node(id: $nodeId) {
        ... on Issue {
          id
        }
      }
    }
  `;
    const result = await octokit.graphql(query, {
      projectId,
      nodeId,
    });
    
    const issueId = result.issue?.id;
    const projectItems = result.node.items.nodes;
    return projectItems.some(item => item.content?.id === issueId);
  } catch (error) {
    console.error('Error al verificar issue en proyecto:', error);
    return false;
  }
}

async function addIssueToProject(projectId, contentId) {
  try {
    const mutation = `
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
        item {
          id
        }
      }
    }
  `;
    const result = await octokit.graphql(mutation, {
      projectId,
      contentId,
    });
    return result.addProjectV2ItemById.item.id;
  } catch (error) {
    console.error('Error al añadir issue al proyecto:', error);
    return null;
  }
}

async function getStatusFieldId(projectId) {
  try {
    const query = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          field(name: "Status") {
            ... on ProjectV2SingleSelectField {
              id
              options {
                id
                name
              }
            }
          }
        }
      }
    }
  `;
    const result = await octokit.graphql(query, { projectId });
    return {
      fieldId: result.node.field.id,
      options: result.node.field.options
    };
  } catch (error) {
    console.error('Error al obtener ID del campo de estado:', error);
    return null;
  }
}

async function updateIssueStatus(projectId, itemId, fieldId, optionId) {
  try {
    const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;
    await octokit.graphql(mutation, {
      projectId,
      itemId,
      fieldId,
      optionId,
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar estado del issue:', error);
    return false;
  }
}

async function main() {
  const projectId = 'PVT_kwHOCIy6ZM4A3Boe';
  const owner = 'Maurosg78';
  const repo = 'MapleAIHealth';

  try {
    // Obtener todos los issues del repositorio
    const issues = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'open'
    });

    for (const issue of issues.data) {
      // Verificar si el issue ya está en el proyecto
      const isInProject = await checkIssueInProject(projectId, issue.node_id);
      
      if (!isInProject) {
        // Añadir el issue al proyecto
        const itemId = await addIssueToProject(projectId, issue.node_id);
        
        if (itemId) {
          // Obtener el campo de estado y sus opciones
          const statusField = await getStatusFieldId(projectId);
          
          if (statusField) {
            // Encontrar la opción "To Do"
            const todoOption = statusField.options.find(opt => opt.name === 'To Do');
            
            if (todoOption) {
              // Actualizar el estado del issue a "To Do"
              await updateIssueStatus(projectId, itemId, statusField.fieldId, todoOption.id);
              console.log(`Issue #${issue.number} añadido al proyecto y marcado como "To Do"`);
            }
          }
        }
      }
    }
    
    console.log('Proceso completado exitosamente');
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

main(); 