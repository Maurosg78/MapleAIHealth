import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Verificar token
const MAPLE_HEALTH_TOKEN = process.env.MAPLE_HEALTH_TOKEN;
if (!MAPLE_HEALTH_TOKEN) {
  console.error('Error: No se encontró MAPLE_HEALTH_TOKEN. Por favor, configúrelo como variable de entorno.');
  process.exit(1);
}

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

// Generar archivos para GitHub Actions Issue Creator
function generateActionIssueFiles() {
  // Crear directorio si no existe
  const outputDir = path.join(process.cwd(), '.github', 'ISSUE_TEMPLATE');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generar archivos de issues
  let issueCount = 0;
  
  sprints.forEach((sprint, sprintIndex) => {
    const sprintIssues = issuesBySprint[sprint.title];
    
    sprintIssues.forEach((issue, issueIndex) => {
      issueCount++;
      const filename = `issue-${sprintIndex+1}-${issueIndex+1}-${issue.title.toLowerCase().replace(/\s+/g, '-')}.yml`;
      const filePath = path.join(outputDir, filename);
      
      // Generar contenido en formato YAML para GitHub Actions
      let content = `---\ntitle: "[Sprint ${sprintIndex+1}] ${issue.title}"\n`;
      content += `labels: ${JSON.stringify(issue.labels)}\n`;
      content += `milestone: "${sprint.title}"\n`;
      content += `assignees: []\n`;
      content += `---\n\n`;
      content += `# ${issue.title}\n\n`;
      content += `${issue.body}\n\n`;
      content += `_Sprint: ${sprint.title}_\n`;
      content += `_Fecha estimada: ${sprint.dueDate.toLocaleDateString()}_\n`;
      
      // Escribir archivo
      fs.writeFileSync(filePath, content);
      console.log(`Plantilla de issue generada: ${filePath}`);
    });
  });
  
  console.log(`Total de plantillas de issues generadas: ${issueCount}`);
}

// Generar archivo para cada sprint (formato markdown)
function generateSprintFiles() {
  // Crear directorio si no existe
  const outputDir = path.join(process.cwd(), 'docs', 'mvp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generar archivo para cada sprint
  sprints.forEach((sprint, index) => {
    const sprintNumber = index + 1;
    const issues = issuesBySprint[sprint.title];
    const sprintFileName = `Sprint_${sprintNumber}_MVP.md`;
    const sprintFilePath = path.join(outputDir, sprintFileName);

    // Generar contenido del archivo
    let content = `---\ntitle: "${sprint.title}"\n`;
    content += `labels: ["sprint${sprintNumber}", "mvp"]\n`;
    content += `milestone: "${sprint.title}"\n`;
    content += `---\n\n`;
    
    content += `# ${sprint.title}\n\n`;
    content += `**Fecha de inicio**: ${new Date().toLocaleDateString()}\n`;
    content += `**Fecha estimada de finalización**: ${sprint.dueDate.toLocaleDateString()}\n\n`;
    content += `## Descripción\n${sprint.description}\n\n`;
    content += '## Issues\n\n';

    // Añadir issues
    issues.forEach((issue, issueIndex) => {
      content += `### ${issueIndex + 1}. ${issue.title}\n\n`;
      content += `${issue.body}\n\n`;
      content += `**Etiquetas**: ${issue.labels.join(', ')}\n\n`;
      
      // Añadir issue reference marker para GitHub Actions
      content += `<!-- issue_${sprintNumber}_${issueIndex + 1} -->\n\n`;
    });

    // Añadir sección de seguimiento
    content += `## Seguimiento\n\n`;
    content += `| Issue | Estado | Responsable | Fecha de Inicio | Fecha de Fin |\n`;
    content += `|-------|--------|-------------|----------------|-------------|\n`;

    issues.forEach((issue, issueIndex) => {
      content += `| ${issueIndex + 1}. ${issue.title} | Pendiente | | | |\n`;
    });

    // Escribir archivo
    fs.writeFileSync(sprintFilePath, content);
    console.log(`Archivo de sprint generado: ${sprintFilePath}`);
  });

  // Generar archivo de resumen
  const summaryFilePath = path.join(outputDir, 'MVP_Summary.md');
  let summaryContent = `# Resumen del MVP\n\n`;
  summaryContent += `## Sprints\n\n`;
  
  sprints.forEach((sprint, index) => {
    const sprintNumber = index + 1;
    summaryContent += `### Sprint ${sprintNumber}: ${sprint.title}\n`;
    summaryContent += `**Descripción**: ${sprint.description}\n`;
    summaryContent += `**Fecha estimada**: ${sprint.dueDate.toLocaleDateString()}\n\n`;
    summaryContent += `#### Issues\n\n`;
    
    const issues = issuesBySprint[sprint.title];
    issues.forEach((issue) => {
      summaryContent += `- ${issue.title} [${issue.labels.join(', ')}]\n`;
    });
    
    summaryContent += '\n';
  });
  
  fs.writeFileSync(summaryFilePath, summaryContent);
  console.log(`Archivo de resumen generado: ${summaryFilePath}`);
}

// Generar archivo Kanban
function generateKanbanFile() {
  const kanbanFilePath = path.join(process.cwd(), 'docs', 'mvp', 'Kanban.md');
  
  let content = `# MapleAI Health - Tablero Kanban MVP\n\n`;
  
  // Backlog
  content += `## 📋 Backlog\n\n`;
  
  sprints.forEach((sprint) => {
    content += `### ${sprint.title}\n`;
    
    const issues = issuesBySprint[sprint.title];
    issues.forEach((issue) => {
      content += `- [ ] ${issue.title}\n`;
    });
    
    content += '\n';
  });
  
  // En Progreso
  content += `## 🚀 En Progreso\n\n`;
  content += `_No hay tareas en progreso actualmente._\n\n`;
  
  // Completado
  content += `## ✅ Completado\n\n`;
  content += `_No hay tareas completadas._\n\n`;
  
  // Métricas
  content += `## 📊 Métricas del Proyecto\n\n`;
  content += `### Progreso General MVP\n\n`;
  
  sprints.forEach((sprint, index) => {
    content += `- **Sprint ${index + 1}**: 0% completado\n`;
  });
  
  content += '\n### Próximos Hitos\n\n';
  content += '1. Completar Sprint 1 (2 semanas)\n';
  content += '2. Iniciar Sprint 2 (semana 3)\n';
  content += '3. Completar Sprint 2 (4 semanas)\n';
  content += '4. Iniciar Sprint 3 (semana 5)\n';
  content += '5. MVP Completado (6 semanas)\n';
  
  fs.writeFileSync(kanbanFilePath, content);
  console.log(`Archivo Kanban generado: ${kanbanFilePath}`);
}

// Crear archivos para el proyecto GitHub
function generateGitHubProjectFiles() {
  // Crear directorio si no existe
  const outputDir = path.join(process.cwd(), '.github', 'project');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generar archivo de configuración del proyecto
  const projectConfigPath = path.join(outputDir, 'config.yml');
  
  let content = `# Configuración del proyecto GitHub para MapleAI Health MVP\n\n`;
  content += `name: MapleAI Health MVP\n`;
  content += `description: Tablero de seguimiento para el MVP de MapleAI Health\n\n`;
  content += `# Columnas del proyecto\n`;
  content += `columns:\n`;
  content += `  - name: Backlog\n`;
  content += `    description: Issues pendientes de planificación\n`;
  content += `  - name: To Do\n`;
  content += `    description: Issues planificados para el sprint actual\n`;
  content += `  - name: In Progress\n`;
  content += `    description: Issues en los que se está trabajando actualmente\n`;
  content += `  - name: Review\n`;
  content += `    description: Issues completados que requieren revisión\n`;
  content += `  - name: Done\n`;
  content += `    description: Issues completados y verificados\n\n`;
  
  // Configuraciones automáticas
  content += `# Configuraciones automáticas\n`;
  content += `config:\n`;
  content += `  # Issues nuevos van a Backlog\n`;
  content += `  new_issue_column: Backlog\n`;
  content += `  # Issues cerrados van a Done\n`;
  content += `  closed_issue_column: Done\n`;
  content += `  # PRs nuevos van a Review\n`;
  content += `  new_pr_column: Review\n`;
  content += `  # PRs mergeados van a Done\n`;
  content += `  merged_pr_column: Done\n`;
  
  fs.writeFileSync(projectConfigPath, content);
  console.log(`Archivo de configuración del proyecto generado: ${projectConfigPath}`);
}

// Función principal
function main() {
  try {
    console.log('Generando archivos de planificación del MVP...');
    generateSprintFiles();
    generateKanbanFile();
    generateActionIssueFiles();
    generateGitHubProjectFiles();
    console.log('¡Generación completada!');
  } catch (error) {
    console.error('Error generando archivos:', error);
    process.exit(1);
  }
}

// Ejecutar script
main(); 