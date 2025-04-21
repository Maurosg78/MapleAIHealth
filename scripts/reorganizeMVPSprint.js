import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
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

const owner = 'Maurosg78';
const repo = 'MapleAIHealth';

// Verificar token
if (!GITHUB_TOKEN) {
  console.error('Error: No se encontró GITHUB_TOKEN. Por favor, configúrelo como variable de entorno o cree un archivo .github_token.txt en la raíz del proyecto.');
  console.error('Instrucciones:');
  console.error('1. Cree un archivo .github_token.txt en la raíz del proyecto');
  console.error('2. Pegue su token de GitHub en ese archivo sin espacios ni líneas adicionales');
  console.error('3. Ejecute este script nuevamente');
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

// Definición de sprints
const sprints = [
  {
    title: 'Sprint 1: MVP Core - Infraestructura y Sistema Base',
    description: 'Establecer la infraestructura base y los componentes core del sistema MVP',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 semanas desde ahora
  },
  {
    title: 'Sprint 2: MVP Clínico - Gestión de Evidencia Médica',
    description: 'Implementar las funcionalidades de búsqueda y gestión de evidencia clínica',
    dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 4 semanas desde ahora
  },
  {
    title: 'Sprint 3: MVP Asistente - IA y Experiencia de Usuario',
    description: 'Integrar asistencia por IA y mejorar la experiencia de usuario',
    dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000) // 6 semanas desde ahora
  }
];

// Definición de issues por sprint
const issuesBySprint = {
  'Sprint 1: MVP Core - Infraestructura y Sistema Base': [
    {
      title: 'Sistema de Autenticación y Autorización',
      body: `## Objetivo
Implementar un sistema seguro de autenticación y autorización para médicos y personal administrativo.

### Tareas
- [ ] Configurar autenticación con JWT
- [ ] Implementar roles de usuario (médico, admin)
- [ ] Crear endpoints protegidos
- [ ] Implementar recuperación de contraseña
- [ ] Añadir validación de sesiones

### Criterios de Aceptación
- Sistema de login funcional
- Protección de rutas según rol
- Tokens JWT seguros
- Proceso de recuperación de contraseña operativo`,
      labels: ['security', 'high-priority', 'core']
    },
    {
      title: 'Configuración de APIs Médicas',
      body: `## Objetivo
Configurar la integración con bases de datos médicas (PubMed y Cochrane).

### Tareas
- [ ] Establecer conexión con API PubMed
- [ ] Implementar funciones de búsqueda básicas
- [ ] Configurar manejo de credenciales
- [ ] Validar respuestas API
- [ ] Documentar endpoints disponibles

### Criterios de Aceptación
- Conexión estable con PubMed API
- Búsquedas funcionales
- Manejo adecuado de errores
- Documentación completa`,
      labels: ['core', 'high-priority', 'api']
    },
    {
      title: 'Sistema de Gestión de Pacientes (Base)',
      body: `## Objetivo
Implementar el CRUD básico para gestión de pacientes y sus datos.

### Tareas
- [ ] Crear modelo de paciente
- [ ] Implementar endpoints CRUD
- [ ] Añadir validación de datos
- [ ] Implementar búsqueda de pacientes
- [ ] Crear interfaz básica para gestión

### Criterios de Aceptación
- CRUD completo de pacientes
- Validación de datos del paciente
- Búsqueda funcional
- Interfaz operativa`,
      labels: ['feature', 'core', 'high-priority']
    }
  ],
  'Sprint 2: MVP Clínico - Gestión de Evidencia Médica': [
    {
      title: 'Optimización de Sistema de Caché',
      body: `## Objetivo
Optimizar el sistema de caché para mejorar el rendimiento en búsquedas de evidencia médica.

### Tareas
- [ ] Implementar priorización de caché
- [ ] Desarrollar estrategia de invalidación
- [ ] Optimizar uso de memoria
- [ ] Añadir compresión de datos
- [ ] Implementar métricas de rendimiento

### Criterios de Aceptación
- Hit ratio > 70%
- Reducción de tiempos de carga en 50%
- Uso eficiente de memoria
- Telemetría implementada`,
      labels: ['performance', 'high-priority']
    },
    {
      title: 'Dashboard de Información Clínica',
      body: `## Objetivo
Desarrollar un dashboard principal para visualización y gestión de información clínica.

### Tareas
- [ ] Diseñar interfaz base
- [ ] Implementar componentes de visualización
- [ ] Integrar con sistema de búsqueda
- [ ] Añadir filtros y ordenación
- [ ] Implementar exportación de datos

### Criterios de Aceptación
- Dashboard funcional
- Visualización clara de datos
- Filtros operativos
- Exportación funcional`,
      labels: ['ui/ux', 'high-priority', 'feature']
    },
    {
      title: 'Componente de Visualización de Evidencia',
      body: `## Objetivo
Crear componentes para visualizar y comparar evidencia médica obtenida.

### Tareas
- [ ] Diseñar componente de tarjeta de evidencia
- [ ] Implementar tabla comparativa
- [ ] Añadir indicadores de confiabilidad
- [ ] Crear sistema de favoritos
- [ ] Implementar opciones de filtrado

### Criterios de Aceptación
- Visualización clara de evidencia
- Comparación funcional
- Indicadores de confiabilidad precisos
- Sistema de favoritos funcionando`,
      labels: ['ui/ux', 'feature', 'medium-priority']
    }
  ],
  'Sprint 3: MVP Asistente - IA y Experiencia de Usuario': [
    {
      title: 'Integración de Asistente IA',
      body: `## Objetivo
Integrar el asistente de IA para apoyar la toma de decisiones clínicas.

### Tareas
- [ ] Configurar modelo base (Claude)
- [ ] Implementar procesamiento de consultas
- [ ] Crear sistema de sugerencias contextuales
- [ ] Añadir referencias a evidencias
- [ ] Implementar feedback loop

### Criterios de Aceptación
- Asistente respondiendo consultas médicas
- Respuestas contextuales según paciente
- Referencias a evidencia científica
- Sistema de feedback implementado`,
      labels: ['ai', 'feature', 'high-priority']
    },
    {
      title: 'Sistema de Registro de Interacciones',
      body: `## Objetivo
Implementar registro y análisis de interacciones con el asistente IA.

### Tareas
- [ ] Crear modelo de registro de interacciones
- [ ] Implementar categorización automática
- [ ] Desarrollar métricas de utilidad
- [ ] Crear dashboard de analítica
- [ ] Implementar exportación de datos

### Criterios de Aceptación
- Registro completo de interacciones
- Categorización precisa
- Dashboard analítico funcional
- Exportación de datos operativa`,
      labels: ['ai', 'analytics', 'medium-priority']
    },
    {
      title: 'Mejora de UX/UI General',
      body: `## Objetivo
Optimizar la experiencia de usuario en toda la aplicación.

### Tareas
- [ ] Implementar diseño responsive
- [ ] Optimizar tiempos de carga
- [ ] Mejorar accesibilidad (WCAG)
- [ ] Añadir tema oscuro
- [ ] Implementar tutoriales interactivos

### Criterios de Aceptación
- Aplicación 100% responsive
- Tiempos de carga < 1s
- Conformidad WCAG AA
- Tema oscuro funcional
- Tutoriales implementados`,
      labels: ['ui/ux', 'medium-priority']
    }
  ]
};

// Definición de etiquetas
const labels = [
  { name: 'security', color: 'D93F0B', description: 'Relacionado con seguridad y autenticación' },
  { name: 'core', color: '0E8A16', description: 'Funcionalidad core del MVP' },
  { name: 'feature', color: '1D76DB', description: 'Nueva funcionalidad' },
  { name: 'high-priority', color: 'B60205', description: 'Alta prioridad' },
  { name: 'medium-priority', color: 'FBCA04', description: 'Prioridad media' },
  { name: 'ai', color: '5319E7', description: 'Relacionado con IA' },
  { name: 'ui/ux', color: 'C2E0C6', description: 'Interfaz de usuario y experiencia' },
  { name: 'analytics', color: '0075CA', description: 'Analítica y reportes' },
  { name: 'api', color: '8B4513', description: 'Integración con APIs externas' },
  { name: 'performance', color: '336699', description: 'Optimización de rendimiento' }
];

// Eliminar milestones existentes si es necesario
async function cleanupExistingData() {
  try {
    console.log('Limpiando datos existentes...');
    
    // Obtener milestones existentes
    const { data: milestones } = await octokit.issues.listMilestones({
      owner,
      repo,
      state: 'open'
    });
    
    // Filtrar solo los que coinciden con nuestros nuevos sprints
    const milestonesToDelete = milestones.filter(
      milestone => sprints.some(sprint => sprint.title === milestone.title)
    );
    
    // Eliminar milestones existentes
    for (const milestone of milestonesToDelete) {
      console.log(`Eliminando milestone existente: ${milestone.title}`);
      await octokit.issues.deleteMilestone({
        owner,
        repo,
        milestone_number: milestone.number
      });
    }
    
    // Cerrar issues anteriores del MVP que estén abiertos
    const { data: openIssues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open'
    });
    
    // Filtrar issues que podrían ser duplicados (basado en títulos similares)
    for (const sprintTitle in issuesBySprint) {
      for (const newIssue of issuesBySprint[sprintTitle]) {
        const similarIssues = openIssues.filter(issue => 
          issue.title.toLowerCase().includes(newIssue.title.toLowerCase()) ||
          newIssue.title.toLowerCase().includes(issue.title.toLowerCase())
        );
        
        for (const issue of similarIssues) {
          console.log(`Cerrando issue similar existente: #${issue.number} - ${issue.title}`);
          await octokit.issues.update({
            owner,
            repo,
            issue_number: issue.number,
            state: 'closed',
            state_reason: 'completed'
          });
        }
      }
    }
    
    console.log('Limpieza completada.');
  } catch (error) {
    console.error('Error durante la limpieza:', error);
  }
}

// Crear etiquetas para los issues
async function createLabels() {
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
        console.error(`Error creando etiqueta ${label.name}:`, error);
      } else {
        console.log(`Etiqueta ya existe: ${label.name}`);
      }
    }
  }
}

// Crear milestones para los sprints
async function createMilestones() {
  console.log('Creando milestones para los sprints...');
  
  const milestoneNumbers = {};
  
  for (const sprint of sprints) {
    try {
      const milestone = await octokit.issues.createMilestone({
        owner,
        repo,
        title: sprint.title,
        description: sprint.description,
        due_on: sprint.dueDate.toISOString()
      });
      
      milestoneNumbers[sprint.title] = milestone.data.number;
      console.log(`Milestone creado: ${sprint.title} (${milestone.data.number})`);
    } catch (error) {
      console.error(`Error creando milestone ${sprint.title}:`, error);
      throw error;
    }
  }
  
  return milestoneNumbers;
}

// Crear issues para cada sprint
async function createIssues(milestoneNumbers) {
  console.log('Creando issues...');
  
  for (const sprintTitle in issuesBySprint) {
    const milestoneNumber = milestoneNumbers[sprintTitle];
    
    if (!milestoneNumber) {
      console.error(`No se encontró número de milestone para ${sprintTitle}`);
      continue;
    }
    
    for (const issue of issuesBySprint[sprintTitle]) {
      try {
        const createdIssue = await octokit.issues.create({
          owner,
          repo,
          ...issue,
          milestone: milestoneNumber
        });
        
        console.log(`Issue creado: ${issue.title} (#${createdIssue.data.number})`);
      } catch (error) {
        console.error(`Error creando issue ${issue.title}:`, error);
      }
    }
  }
}

// Crear proyecto para el MVP
async function createMVPProject() {
  try {
    console.log('Creando proyecto para el MVP...');
    
    // Crear el proyecto
    const { data: project } = await octokit.projects.createForRepo({
      owner,
      repo,
      name: 'MapleAI Health MVP',
      body: 'Proyecto para el desarrollo del MVP de MapleAI Health'
    });
    
    console.log(`Proyecto creado: ${project.name} (ID: ${project.id})`);
    
    // Crear columnas
    const columns = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    
    for (const columnName of columns) {
      const { data: column } = await octokit.projects.createColumn({
        project_id: project.id,
        name: columnName
      });
      
      console.log(`Columna creada: ${column.name} (ID: ${column.id})`);
    }
    
    console.log('Proyecto MVP configurado con éxito');
    return project;
  } catch (error) {
    console.error('Error creando proyecto MVP:', error);
  }
}

// Función principal
async function main() {
  try {
    console.log('Iniciando reorganización de sprints para MapleAI Health MVP...');
    
    // Limpiar datos existentes si es necesario
    await cleanupExistingData();
    
    // Crear etiquetas
    await createLabels();
    
    // Crear milestones
    const milestoneNumbers = await createMilestones();
    
    // Crear issues
    await createIssues(milestoneNumbers);
    
    // Crear proyecto
    await createMVPProject();
    
    console.log('¡Reorganización del MVP completada con éxito!');
  } catch (error) {
    console.error('Error en la reorganización del MVP:', error);
    process.exit(1);
  }
}

// Ejecutar script
main(); 