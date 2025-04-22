import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_PAT = process.env.GITHUB_PAT;
const OWNER = 'mauriciosobarzo';
const REPO = 'MapleAIHealth';

async function updateIssueStatus() {
  if (!GITHUB_PAT) {
    throw new Error('GITHUB_PAT no está configurado en el archivo .env');
  }

  const octokit = new Octokit({
    auth: GITHUB_PAT,
    baseUrl: 'https://api.github.com'
  });

  // Issues que necesitan ser marcados como completados (los que no están en "Done")
  const issueNumbers = [43, 47, 48];

  try {
    // Verificar el token PAT
    try {
      const { data: user } = await octokit.users.getAuthenticated();
      console.log('Autenticado como:', user.login);
    } catch (error) {
      throw new Error('Error de autenticación con el PAT. Por favor, verifica tu token.');
    }

    // Actualizar cada issue
    for (const issueNumber of issueNumbers) {
      try {
        console.log(`Actualizando issue #${issueNumber}...`);
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: issueNumber,
          state: 'closed'
        });
        
        console.log(`Issue #${issueNumber} marcado como completado`);
      } catch (error) {
        console.error(`Error al actualizar issue #${issueNumber}:`, error.message);
      }
    }

    console.log('Proceso de actualización completado');
  } catch (error) {
    console.error('Error en el proceso:', error.message);
    process.exit(1);
  }
}

updateIssueStatus().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
}); 