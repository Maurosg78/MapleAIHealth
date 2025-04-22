import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_PAT = process.env.GITHUB_PAT;
const OWNER = 'Maurosg78';
const REPO = 'MapleAIHealth';

async function checkAndUpdateRepo() {
  if (!GITHUB_PAT) {
    throw new Error('GITHUB_PAT no está configurado en el archivo .env');
  }

  const octokit = new Octokit({
    auth: GITHUB_PAT,
    baseUrl: 'https://api.github.com'
  });

  try {
    // Verificar autenticación
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('Autenticado como:', user.login);

    // Obtener información del repositorio
    const { data: repo } = await octokit.repos.get({
      owner: OWNER,
      repo: REPO
    });

    console.log('\nInformación del Repositorio:');
    console.log('----------------------------');
    console.log(`Nombre: ${repo.name}`);
    console.log(`Visibilidad: ${repo.visibility}`);
    console.log(`URL: ${repo.html_url}`);
    console.log(`Issues URL: ${repo.html_url}/issues`);
    console.log(`Projects URL: ${repo.html_url}/projects`);
    
    // Si el repositorio no es público, hacerlo público
    if (repo.private) {
      console.log('\nHaciendo el repositorio público...');
      await octokit.repos.update({
        owner: OWNER,
        repo: REPO,
        private: false,
        has_issues: true,
        has_projects: true
      });
      console.log('Repositorio actualizado a público');
    }

    // Verificar si los issues están habilitados
    if (!repo.has_issues) {
      console.log('\nHabilitando issues en el repositorio...');
      await octokit.repos.update({
        owner: OWNER,
        repo: REPO,
        has_issues: true
      });
      console.log('Issues habilitados');
    }

    // Verificar si los proyectos están habilitados
    if (!repo.has_projects) {
      console.log('\nHabilitando proyectos en el repositorio...');
      await octokit.repos.update({
        owner: OWNER,
        repo: REPO,
        has_projects: true
      });
      console.log('Proyectos habilitados');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAndUpdateRepo().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
}); 