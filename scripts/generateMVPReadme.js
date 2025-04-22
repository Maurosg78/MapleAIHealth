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

// Función para obtener la información actualizada del MVP
async function getMVPInfo() {
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
    ).sort((a, b) => new Date(a.due_on) - new Date(b.due_on));
    
    // Estructura para almacenar la información completa
    const mvpInfo = {
      milestones: [],
      totalIssues: 0,
      openIssues: 0,
      closedIssues: 0
    };
    
    // Para cada milestone, obtener sus issues
    for (const milestone of mvpMilestones) {
      const milestoneInfo = {
        title: milestone.title,
        description: milestone.description,
        dueDate: new Date(milestone.due_on).toLocaleDateString(),
        number: milestone.number,
        issues: [],
        openIssues: 0,
        closedIssues: 0
      };
      
      // Obtener todos los issues (abiertos y cerrados) para este milestone
      const { data: allIssues } = await octokit.issues.listForRepo({
        owner,
        repo,
        milestone: milestone.number,
        state: 'all'
      });
      
      // Filtrar por estado y añadir a la estructura
      for (const issue of allIssues) {
        milestoneInfo.issues.push({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          labels: issue.labels.map(label => label.name),
          assignee: issue.assignee ? issue.assignee.login : null,
          createdAt: new Date(issue.created_at).toLocaleDateString(),
          updatedAt: new Date(issue.updated_at).toLocaleDateString(),
          closedAt: issue.closed_at ? new Date(issue.closed_at).toLocaleDateString() : null
        });
        
        if (issue.state === 'open') {
          milestoneInfo.openIssues++;
          mvpInfo.openIssues++;
        } else {
          milestoneInfo.closedIssues++;
          mvpInfo.closedIssues++;
        }
      }
      
      milestoneInfo.progress = milestoneInfo.issues.length > 0 
        ? Math.round((milestoneInfo.closedIssues / milestoneInfo.issues.length) * 100) 
        : 0;
      
      mvpInfo.milestones.push(milestoneInfo);
      mvpInfo.totalIssues += milestoneInfo.issues.length;
    }
    
    mvpInfo.progress = mvpInfo.totalIssues > 0 
      ? Math.round((mvpInfo.closedIssues / mvpInfo.totalIssues) * 100) 
      : 0;
    
    return mvpInfo;
  } catch (error) {
    console.error('Error al obtener información del MVP:', error);
    throw error;
  }
}

// Generar archivo README del MVP
async function generateMVPReadme() {
  try {
    // Obtener información del MVP
    const mvpInfo = await getMVPInfo();
    
    // Crear contenido del README
    let content = `# MapleAI Health - MVP\n\n`;
    
    // Agregar insignias de estado
    content += `![Progreso](https://progress-bar.dev/${mvpInfo.progress}/?width=400&title=Progreso%20Total) `;
    content += `![Issues Abiertos](https://img.shields.io/badge/Issues%20Abiertos-${mvpInfo.openIssues}-yellow) `;
    content += `![Issues Cerrados](https://img.shields.io/badge/Issues%20Cerrados-${mvpInfo.closedIssues}-green)\n\n`;
    
    // Añadir descripción
    content += `## Descripción\n\n`;
    content += `MapleAI Health es un sistema de registros médicos electrónicos (EMR) con asistencia `;
    content += `de inteligencia artificial integrada para apoyar la toma de decisiones clínicas. `;
    content += `Este MVP se enfoca en proporcionar las funcionalidades básicas de gestión de pacientes, `;
    content += `búsqueda de evidencia clínica y asistencia IA para fisioterapeutas.\n\n`;
    
    // Agregar tabla de contenidos
    content += `## Tabla de Contenidos\n\n`;
    content += `- [Progreso General](#progreso-general)\n`;
    content += `- [Sprints](#sprints)\n`;
    
    for (const milestone of mvpInfo.milestones) {
      const anchor = milestone.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
      content += `  - [${milestone.title}](#${anchor})\n`;
    }
    
    content += `- [Próximos Pasos](#próximos-pasos)\n`;
    content += `- [Enlaces Útiles](#enlaces-útiles)\n\n`;
    
    // Añadir progreso general
    content += `## Progreso General\n\n`;
    content += `- **Issues Totales:** ${mvpInfo.totalIssues}\n`;
    content += `- **Issues Abiertos:** ${mvpInfo.openIssues}\n`;
    content += `- **Issues Cerrados:** ${mvpInfo.closedIssues}\n`;
    content += `- **Progreso Total:** ${mvpInfo.progress}%\n\n`;
    
    // Añadir gráfico de progreso con caracteres ASCII
    content += `\`\`\`\n[`;
    const completedBlocks = Math.round(mvpInfo.progress / 5);
    content += '█'.repeat(completedBlocks);
    content += ' '.repeat(20 - completedBlocks);
    content += `] ${mvpInfo.progress}%\n\`\`\`\n\n`;
    
    // Añadir sección de sprints
    content += `## Sprints\n\n`;
    
    for (const milestone of mvpInfo.milestones) {
      content += `### ${milestone.title}\n\n`;
      content += `**Fecha de vencimiento:** ${milestone.dueDate}\n\n`;
      content += `**Descripción:** ${milestone.description}\n\n`;
      content += `**Progreso:** ${milestone.progress}%\n\n`;
      
      // Añadir gráfico de progreso con caracteres ASCII
      content += `\`\`\`\n[`;
      const completedBlocks = Math.round(milestone.progress / 5);
      content += '█'.repeat(completedBlocks);
      content += ' '.repeat(20 - completedBlocks);
      content += `] ${milestone.progress}%\n\`\`\`\n\n`;
      
      // Tabla de issues
      content += `| # | Issue | Estado | Etiquetas | Asignado |\n`;
      content += `|---|-------|--------|-----------|----------|\n`;
      
      for (const issue of milestone.issues) {
        const state = issue.state === 'open' ? '🔴 Abierto' : '✅ Cerrado';
        const labels = issue.labels.join(', ');
        const assignee = issue.assignee || '-';
        
        content += `| [#${issue.number}](https://github.com/${owner}/${repo}/issues/${issue.number}) | ${issue.title} | ${state} | ${labels} | ${assignee} |\n`;
      }
      
      content += `\n`;
    }
    
    // Añadir próximos pasos
    content += `## Próximos Pasos\n\n`;
    content += `1. Completar todas las tareas del Sprint 1\n`;
    content += `2. Preparar la demostración del MVP Core\n`;
    content += `3. Iniciar el Sprint 2 con foco en la gestión de evidencia clínica\n`;
    content += `4. Desarrollar los componentes de visualización de evidencia\n`;
    content += `5. Implementar el asistente IA en el Sprint 3\n\n`;
    
    // Añadir enlaces útiles
    content += `## Enlaces Útiles\n\n`;
    content += `- [Repositorio del Proyecto](https://github.com/${owner}/${repo})\n`;
    content += `- [Tablero Kanban](https://github.com/${owner}/${repo}/projects/11)\n`;
    content += `- [Milestones](https://github.com/${owner}/${repo}/milestones)\n`;
    content += `- [Documentación en docs/mvp/](./docs/mvp/)\n\n`;
    
    // Añadir pie de página
    content += `---\n\n`;
    content += `Última actualización: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    
    // Escribir el archivo README
    const readmePath = path.join(process.cwd(), 'MVP_README.md');
    fs.writeFileSync(readmePath, content);
    
    console.log(`README del MVP generado en: ${readmePath}`);
    return readmePath;
  } catch (error) {
    console.error('Error al generar README del MVP:', error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('Generando documentación actualizada del MVP...');
    const readmePath = await generateMVPReadme();
    console.log(`\nDocumentación generada con éxito en: ${readmePath}`);
    console.log('\nProceso completado.');
  } catch (error) {
    console.error('Error en el proceso principal:', error);
    process.exit(1);
  }
}

// Ejecutar
main(); 