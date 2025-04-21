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

// Cargar el plan MVP
const loadMvpPlan = () => {
  try {
    const filePath = path.join(process.cwd(), 'mvp-plan.json');
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData);
    } else {
      console.log('No se encontró el archivo mvp-plan.json, generándolo...');
      // Si no existe, ejecutar el script que lo genera
      require('./exportMVPPlan');
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Error al cargar el plan MVP:', error);
    process.exit(1);
  }
};

// Obtener issues existentes
const getExistingIssues = async () => {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });
    
    return issues;
  } catch (error) {
    console.error('Error al obtener issues existentes:', error.message);
    return [];
  }
};

// Obtener proyectos existentes
const getProjects = async () => {
  try {
    const { data: projects } = await octokit.projects.listForRepo({
      owner,
      repo
    });
    
    return projects;
  } catch (error) {
    console.error('Error al obtener proyectos:', error.message);
    return [];
  }
};

// Crear o actualizar proyecto
const getOrCreateProject = async () => {
  try {
    const projects = await getProjects();
    let mvpProject = projects.find(p => p.name === 'MapleAI Health MVP');
    
    if (!mvpProject) {
      console.log('Creando nuevo proyecto MVP...');
      const { data: newProject } = await octokit.projects.createForRepo({
        owner,
        repo,
        name: 'MapleAI Health MVP',
        body: 'Proyecto para el desarrollo del MVP de MapleAI Health'
      });
      
      mvpProject = newProject;
      console.log(`Proyecto creado: ${mvpProject.name} (ID: ${mvpProject.id})`);
    } else {
      console.log(`Proyecto existente encontrado: ${mvpProject.name} (ID: ${mvpProject.id})`);
    }
    
    return mvpProject;
  } catch (error) {
    console.error('Error al crear/obtener proyecto:', error.message);
    throw error;
  }
};

// Obtener columnas de proyecto
const getProjectColumns = async (projectId) => {
  try {
    const { data: columns } = await octokit.projects.listColumns({
      project_id: projectId
    });
    
    return columns;
  } catch (error) {
    console.error('Error al obtener columnas del proyecto:', error.message);
    return [];
  }
};

// Crear columnas de proyecto
const setupProjectColumns = async (projectId) => {
  try {
    let columns = await getProjectColumns(projectId);
    
    if (columns.length === 0) {
      const columnNames = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
      
      for (const name of columnNames) {
        const { data: column } = await octokit.projects.createColumn({
          project_id: projectId,
          name
        });
        
        columns.push(column);
        console.log(`Columna creada: ${column.name} (ID: ${column.id})`);
      }
    } else {
      console.log('Las columnas ya existen en el proyecto');
    }
    
    return columns;
  } catch (error) {
    console.error('Error al configurar columnas del proyecto:', error.message);
    throw error;
  }
};

// Crear etiquetas
const createLabels = async (labels) => {
  console.log('Creando etiquetas...');
  
  for (const label of labels) {
    try {
      await octokit.issues.createLabel({
        owner,
        repo,
        ...label
      });
      console.log(`Etiqueta creada: ${label.name}`);
    } catch (error) {
      if (error.status !== 422) { // Ignorar error si la etiqueta ya existe
        console.error(`Error creando etiqueta ${label.name}:`, error.message);
      } else {
        console.log(`Etiqueta ya existe: ${label.name}`);
      }
    }
  }
};

// Crear o actualizar milestones
const createOrUpdateMilestones = async (sprints) => {
  console.log('Creando/actualizando milestones para los sprints...');
  
  try {
    // Obtener milestones existentes
    const { data: existingMilestones } = await octokit.issues.listMilestones({
      owner,
      repo,
      state: 'all'
    });
    
    const milestoneNumbers = {};
    
    for (const sprint of sprints) {
      // Buscar si ya existe un milestone para este sprint
      const existingMilestone = existingMilestones.find(m => m.title === sprint.title);
      
      if (existingMilestone) {
        console.log(`Milestone ya existe: ${sprint.title} (${existingMilestone.number})`);
        milestoneNumbers[sprint.title] = existingMilestone.number;
        
        // Actualizar milestone si está cerrado
        if (existingMilestone.state === 'closed') {
          await octokit.issues.updateMilestone({
            owner,
            repo,
            milestone_number: existingMilestone.number,
            state: 'open',
            due_on: sprint.dueDate
          });
          console.log(`Milestone reabierto: ${sprint.title}`);
        }
      } else {
        // Crear nuevo milestone
        const { data: newMilestone } = await octokit.issues.createMilestone({
          owner,
          repo,
          title: sprint.title,
          description: sprint.description,
          due_on: sprint.dueDate
        });
        
        milestoneNumbers[sprint.title] = newMilestone.number;
        console.log(`Milestone creado: ${sprint.title} (${newMilestone.number})`);
      }
    }
    
    return milestoneNumbers;
  } catch (error) {
    console.error('Error al crear/actualizar milestones:', error.message);
    throw error;
  }
};

// Encontrar o crear issues
const createOrUpdateIssues = async (issuesBySprintTitle, milestoneNumbers, existingIssues) => {
  console.log('Creando/actualizando issues...');
  
  const result = {
    created: [],
    updated: [],
    unchanged: []
  };
  
  for (const sprintTitle in issuesBySprintTitle) {
    const milestoneNumber = milestoneNumbers[sprintTitle];
    
    if (!milestoneNumber) {
      console.error(`No se encontró número de milestone para ${sprintTitle}`);
      continue;
    }
    
    for (const issue of issuesBySprintTitle[sprintTitle]) {
      // Buscar si ya existe un issue con este título
      const existingIssue = existingIssues.find(i => 
        i.title.toLowerCase() === issue.title.toLowerCase() || 
        (i.title.toLowerCase().includes(issue.title.toLowerCase()) && 
         issue.title.toLowerCase().includes(i.title.toLowerCase().split(':')[0]))
      );
      
      if (existingIssue) {
        // Actualizar issue existente
        try {
          await octokit.issues.update({
            owner,
            repo,
            issue_number: existingIssue.number,
            title: issue.title,
            body: issue.body,
            milestone: milestoneNumber,
            state: 'open'
          });
          
          console.log(`Issue actualizado: ${issue.title} (#${existingIssue.number})`);
          result.updated.push({
            number: existingIssue.number,
            title: issue.title,
            sprint: sprintTitle
          });
          
          // Añadir etiquetas si no las tiene
          for (const label of issue.labels) {
            if (!existingIssue.labels.some(l => l.name === label)) {
              try {
                await octokit.issues.addLabels({
                  owner,
                  repo,
                  issue_number: existingIssue.number,
                  labels: [label]
                });
              } catch (error) {
                console.warn(`Error al añadir etiqueta ${label} al issue #${existingIssue.number}:`, error.message);
              }
            }
          }
        } catch (error) {
          console.error(`Error al actualizar issue ${issue.title}:`, error.message);
        }
      } else {
        // Crear nuevo issue
        try {
          const { data: newIssue } = await octokit.issues.create({
            owner,
            repo,
            title: issue.title,
            body: issue.body,
            milestone: milestoneNumber,
            labels: issue.labels
          });
          
          console.log(`Issue creado: ${issue.title} (#${newIssue.number})`);
          result.created.push({
            number: newIssue.number,
            title: issue.title,
            sprint: sprintTitle
          });
        } catch (error) {
          console.error(`Error al crear issue ${issue.title}:`, error.message);
        }
      }
    }
  }
  
  return result;
};

// Añadir issues a proyecto
const addIssuesToProject = async (issues, columns) => {
  console.log('Añadiendo issues al proyecto...');
  
  const backlogColumn = columns.find(c => c.name === 'Backlog');
  const todoColumn = columns.find(c => c.name === 'To Do');
  const inProgressColumn = columns.find(c => c.name === 'In Progress');
  
  if (!backlogColumn) {
    console.error('No se encontró la columna Backlog');
    return;
  }
  
  // Obtener cards actuales
  const getColumnCards = async (columnId) => {
    try {
      const { data: cards } = await octokit.projects.listCards({
        column_id: columnId
      });
      return cards;
    } catch (error) {
      console.error(`Error al obtener cards de la columna ${columnId}:`, error.message);
      return [];
    }
  };
  
  // Backlog cards (Sprint 2 y 3)
  const backlogCards = await getColumnCards(backlogColumn.id);
  
  // To Do cards (Sprint 1)
  let todoCards = [];
  if (todoColumn) {
    todoCards = await getColumnCards(todoColumn.id);
  }
  
  // In Progress cards
  let inProgressCards = [];
  if (inProgressColumn) {
    inProgressCards = await getColumnCards(inProgressColumn.id);
  }
  
  // Añadir issues nuevos según el sprint
  for (const issue of [...issues.created, ...issues.updated]) {
    const issueUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}`;
    
    // Verificar si ya está en alguna columna
    const isInBacklog = backlogCards.some(card => card.content_url === issueUrl);
    const isInTodo = todoCards.some(card => card.content_url === issueUrl);
    const isInProgress = inProgressCards.some(card => card.content_url === issueUrl);
    
    if (!isInBacklog && !isInTodo && !isInProgress) {
      try {
        // Sprint 1 va a To Do, los demás a Backlog
        const targetColumn = issue.sprint.includes('Sprint 1') && todoColumn 
          ? todoColumn 
          : backlogColumn;
        
        await octokit.projects.createCard({
          column_id: targetColumn.id,
          content_id: issue.number,
          content_type: 'Issue'
        });
        
        console.log(`Issue #${issue.number} añadido a la columna ${targetColumn.name}`);
      } catch (error) {
        console.error(`Error al añadir issue #${issue.number} al proyecto:`, error.message);
      }
    }
  }
};

// Flujo de trabajo principal
const syncWithGitHub = async () => {
  try {
    console.log('Sincronizando plan MVP con GitHub...');
    
    // Cargar plan MVP
    const mvpPlan = loadMvpPlan();
    console.log(`Plan MVP cargado: ${mvpPlan.name}`);
    
    // Obtener issues existentes
    const existingIssues = await getExistingIssues();
    console.log(`Issues existentes: ${existingIssues.length}`);
    
    // Crear etiquetas
    await createLabels(mvpPlan.labels);
    
    // Crear/actualizar milestones
    const milestoneNumbers = await createOrUpdateMilestones(mvpPlan.sprints);
    
    // Crear/actualizar issues
    const issueResults = await createOrUpdateIssues(
      mvpPlan.issuesBySprint, 
      milestoneNumbers,
      existingIssues
    );
    
    // Configurar proyecto
    const project = await getOrCreateProject();
    const columns = await setupProjectColumns(project.id);
    
    // Añadir issues a proyecto
    await addIssuesToProject(issueResults, columns);
    
    // Generar informe
    console.log('\nInforme de sincronización:');
    console.log(`- Issues creados: ${issueResults.created.length}`);
    console.log(`- Issues actualizados: ${issueResults.updated.length}`);
    
    console.log('\nSincronización completada con éxito');
  } catch (error) {
    console.error('Error durante la sincronización:', error);
    process.exit(1);
  }
};

// Ejecutar sincronización
syncWithGitHub(); 