import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Obtener token desde variables de entorno o archivo
const getGithubToken = () => {
  let token = process.env.GITHUB_TOKEN || process.env.MAPLE_HEALTH_TOKEN;
  
  if (!token) {
    try {
      const tokenPath = path.join(process.cwd(), '.github_token.txt');
      if (fs.existsSync(tokenPath)) {
        token = fs.readFileSync(tokenPath, 'utf8').trim();
        console.log('Token leído desde archivo .github_token.txt');
      }
    } catch (error) {
      console.error('Error al leer el archivo de token:', error.message);
    }
  }
  
  if (!token) {
    console.error('No se encontró token de GitHub. Establezca GITHUB_TOKEN o cree .github_token.txt');
    process.exit(1);
  }
  
  return token;
};

// Configuración del repositorio
const owner = 'Maurosg78';
const repo = 'MapleAIHealth';
const token = getGithubToken();

const octokit = new Octokit({
  auth: token
});

// Método principal para añadir manualmente los issues al proyecto
async function addIssuesManuallyViaWeb() {
  try {
    // Obtener milestones
    const { data: milestones } = await octokit.issues.listMilestones({
      owner,
      repo,
      state: 'open'
    });
    
    // Imprimir información útil
    console.log('\n=== INFORMACIÓN PARA AÑADIR ISSUES AL PROYECTO ===\n');
    console.log('Accede a: https://github.com/Maurosg78/MapleAIHealth/projects/11');
    console.log('\nMilestones del MVP:');
    
    // Filtrar solo milestones del MVP
    const mvpMilestones = milestones.filter(milestone => 
      milestone.title.includes('MVP Core') || 
      milestone.title.includes('MVP Clínico') || 
      milestone.title.includes('MVP Asistente')
    );
    
    for (const milestone of mvpMilestones) {
      console.log(`- ${milestone.title} (${milestone.number})`);
      
      // Obtener issues para cada milestone
      const { data: milestoneIssues } = await octokit.issues.listForRepo({
        owner,
        repo,
        milestone: milestone.number,
        state: 'open'
      });
      
      console.log('  Issues:');
      for (const issue of milestoneIssues) {
        console.log(`  - #${issue.number}: ${issue.title}`);
      }
      console.log();
    }
    
    console.log('\n===== PRÓXIMOS PASOS =====');
    console.log('1. Accede al proyecto "MapleAI Health Development" en GitHub');
    console.log('2. Haz clic en "+ Add items"');
    console.log('3. Selecciona los issues listados arriba para agregarlos al proyecto');
    console.log('4. Organiza los issues en las columnas correspondientes (Backlog/Todo)');
    console.log('\nALTERNATIVAMENTE:');
    console.log('Para cada issue, puedes ir a su página y hacer clic en "Projects" a la derecha');
    console.log('para agregarlo manualmente al proyecto "MapleAI Health Development"');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Actualizar descripciones de los issues con información del sprint
async function updateIssueDescriptions() {
  try {
    // Obtener milestones
    const { data: milestones } = await octokit.issues.listMilestones({
      owner,
      repo,
      state: 'open'
    });
    
    // Filtrar solo milestones del MVP
    const mvpMilestones = milestones.filter(milestone => 
      milestone.title.includes('MVP Core') || 
      milestone.title.includes('MVP Clínico') || 
      milestone.title.includes('MVP Asistente')
    );
    
    let updatedCount = 0;
    
    // Para cada milestone, actualizar sus issues
    for (const milestone of mvpMilestones) {
      console.log(`Procesando milestone: ${milestone.title}`);
      
      // Obtener issues para este milestone
      const { data: issues } = await octokit.issues.listForRepo({
        owner,
        repo,
        milestone: milestone.number,
        state: 'open'
      });
      
      // Actualizar cada issue con una nota sobre el sprint al que pertenece
      for (const issue of issues) {
        // Solo actualizar si no contiene ya la información del sprint
        if (!issue.body.includes('**Sprint:**')) {
          const sprintInfo = `\n\n---\n**Sprint:** ${milestone.title}\n**Fecha de vencimiento:** ${new Date(milestone.due_on).toLocaleDateString()}\n**Milestone:** ${milestone.number}`;
          
          const updatedBody = issue.body + sprintInfo;
          
          await octokit.issues.update({
            owner,
            repo,
            issue_number: issue.number,
            body: updatedBody
          });
          
          console.log(`Issue #${issue.number} actualizado con información del sprint`);
          updatedCount++;
        } else {
          console.log(`Issue #${issue.number} ya contiene información del sprint`);
        }
      }
    }
    
    console.log(`\nTotal de issues actualizados: ${updatedCount}`);
  } catch (error) {
    console.error('Error al actualizar descripciones:', error);
  }
}

// Función principal
async function main() {
  console.log('Iniciando proceso de mantenimiento de issues del MVP...');
  
  // Actualizar descripciones
  await updateIssueDescriptions();
  
  // Mostrar información para añadir issues manualmente
  await addIssuesManuallyViaWeb();
  
  console.log('\nProceso completado.');
}

// Ejecutar
main(); 