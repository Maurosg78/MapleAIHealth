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

async function checkProjects() {
  try {
    const { user } = await graphqlWithAuth(`
      query {
        user(login: "${owner}") {
          projectsV2(first: 10) {
            nodes {
              id
              title
              number
              public
              closed
              url
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

    console.log('Proyectos encontrados:');
    user.projectsV2.nodes.forEach(project => {
      console.log(`\nProyecto: ${project.title}`);
      console.log(`ID: ${project.id}`);
      console.log(`Número: ${project.number}`);
      console.log(`Público: ${project.public}`);
      console.log(`Cerrado: ${project.closed}`);
      console.log(`URL: ${project.url}`);
      console.log(`Número de items: ${project.items.nodes.length}`);
    });

  } catch (error) {
    console.error('Error al verificar proyectos:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Verificando proyectos...');
    await checkProjects();
  } catch (error) {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  }
}

main(); 