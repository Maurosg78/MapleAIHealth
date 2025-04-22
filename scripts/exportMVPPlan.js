import fs from 'fs';
import path from 'path';

// Definición de sprints
const sprints = [
  {
    title: 'Sprint 1: MVP Core - Infraestructura y Sistema Base',
    description: 'Establecer la infraestructura base y los componentes core del sistema MVP',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 semanas desde ahora
  },
  {
    title: 'Sprint 2: MVP Clínico - Gestión de Evidencia Médica',
    description: 'Implementar las funcionalidades de búsqueda y gestión de evidencia clínica',
    dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString() // 4 semanas desde ahora
  },
  {
    title: 'Sprint 3: MVP Asistente - IA y Experiencia de Usuario',
    description: 'Integrar asistencia por IA y mejorar la experiencia de usuario',
    dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString() // 6 semanas desde ahora
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

// Función para crear el plan MVP
const createMVPPlan = () => {
  // Crear estructura de datos para el plan
  const mvpPlan = {
    name: "MapleAIHealth MVP",
    description: "Plan de desarrollo para el MVP de MapleAIHealth",
    sprints,
    labels,
    issuesBySprint
  };

  // Crear la estructura de issues para la exportación
  const issues = [];
  
  sprints.forEach(sprint => {
    const sprintIssues = issuesBySprint[sprint.title] || [];
    sprintIssues.forEach(issue => {
      issues.push({
        ...issue,
        sprint: sprint.title,
        dueDate: sprint.dueDate
      });
    });
  });
  
  // Añadir issues al plan
  mvpPlan.issues = issues;
  
  // Exportar a JSON
  const filePath = path.join(process.cwd(), 'mvp-plan.json');
  fs.writeFileSync(filePath, JSON.stringify(mvpPlan, null, 2), 'utf8');
  
  console.log(`Plan MVP exportado a: ${filePath}`);
  
  // Exportar también a formato Markdown para fácil lectura
  let markdownContent = `# Plan de Desarrollo MapleAIHealth MVP\n\n`;
  
  // Añadir información sobre etiquetas
  markdownContent += `## Etiquetas\n\n`;
  labels.forEach(label => {
    markdownContent += `- **${label.name}**: ${label.description}\n`;
  });
  
  markdownContent += `\n## Sprints\n\n`;
  
  sprints.forEach(sprint => {
    markdownContent += `### ${sprint.title}\n\n`;
    markdownContent += `${sprint.description}\n\n`;
    markdownContent += `**Fecha límite:** ${new Date(sprint.dueDate).toLocaleDateString()}\n\n`;
    
    const sprintIssues = issuesBySprint[sprint.title] || [];
    sprintIssues.forEach(issue => {
      markdownContent += `#### ${issue.title}\n\n`;
      markdownContent += `${issue.body}\n\n`;
      markdownContent += `**Etiquetas:** ${issue.labels.join(', ')}\n\n`;
      markdownContent += `---\n\n`;
    });
  });
  
  const markdownPath = path.join(process.cwd(), 'mvp-plan.md');
  fs.writeFileSync(markdownPath, markdownContent, 'utf8');
  
  console.log(`Plan MVP exportado a formato Markdown: ${markdownPath}`);
};

// Ejecutar la función
createMVPPlan(); 