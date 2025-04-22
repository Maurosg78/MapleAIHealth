import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_PAT = process.env.GITHUB_PAT;
const OWNER = 'Maurosg78';
const REPO = 'MapleAIHealth';

const sprintMVPIssues = [
  {
    title: '📋 Sprint MVP: Planificación y Setup Inicial',
    body: '### Objetivo del Sprint\nEstablecer la base técnica y funcional para el MVP de MapleAIHealth.\n\n### Descripción\nEste sprint se enfocará en implementar las funcionalidades core del MVP, estableciendo la infraestructura básica y los componentes esenciales de la aplicación.\n\n### Duración\n2 semanas\n\n### Métricas de Éxito\n- Todas las funcionalidades básicas implementadas\n- Tests pasando\n- No hay errores críticos\n- Documentación actualizada',
    labels: ['sprint-planning', 'high-priority', 'documentation']
  },
  {
    title: '🛠️ Setup: Configuración del Entorno de Desarrollo',
    body: '### Objetivo\nPreparar el entorno de desarrollo con todas las herramientas y configuraciones necesarias.\n\n### Tareas\n- [ ] Configurar ESLint y Prettier\n- [ ] Configurar Jest y Testing Library\n- [ ] Establecer GitHub Actions para CI/CD\n- [ ] Configurar entornos de desarrollo/producción\n- [ ] Documentar proceso de setup\n\n### Criterios de Aceptación\n- Pipeline de CI/CD funcionando\n- Linting y formatting automatizados\n- Tests ejecutándose correctamente\n- Documentación clara del setup',
    labels: ['setup', 'devops', 'documentation']
  },
  {
    title: '🏗️ Arquitectura: Diseño de la Estructura Base',
    body: '### Objetivo\nDiseñar y documentar la arquitectura base del proyecto.\n\n### Tareas\n- [ ] Definir estructura de directorios\n- [ ] Establecer patrones de diseño a utilizar\n- [ ] Diseñar arquitectura de componentes\n- [ ] Documentar decisiones técnicas\n- [ ] Crear diagramas de arquitectura\n\n### Criterios de Aceptación\n- Documentación de arquitectura completa\n- Diagramas claros y actualizados\n- Estructura de proyecto definida\n- Patrones de diseño documentados',
    labels: ['architecture', 'documentation', 'high-priority']
  },
  {
    title: '🔐 Feature: Sistema de Autenticación',
    body: '### Objetivo\nImplementar un sistema robusto de autenticación y autorización.\n\n### Tareas\n- [ ] Implementar registro de usuarios\n- [ ] Desarrollar login/logout\n- [ ] Configurar JWT y manejo de tokens\n- [ ] Implementar recuperación de contraseña\n- [ ] Agregar validación de roles\n\n### Criterios de Aceptación\n- Registro y login funcionando\n- Tokens JWT implementados\n- Rutas protegidas funcionando\n- Tests de autenticación pasando',
    labels: ['feature', 'authentication', 'security']
  },
  {
    title: '🔍 Feature: Motor de Búsqueda Médica',
    body: '### Objetivo\nDesarrollar el motor de búsqueda de evidencia médica con integración a PubMed.\n\n### Tareas\n- [ ] Integrar PubMed API\n- [ ] Implementar búsqueda por términos\n- [ ] Crear filtros de búsqueda\n- [ ] Desarrollar sistema de caché\n- [ ] Implementar paginación\n\n### Criterios de Aceptación\n- Búsquedas funcionando correctamente\n- Resultados relevantes mostrados\n- Caché implementado\n- Performance optimizada',
    labels: ['feature', 'search', 'core-feature']
  },
  {
    title: '📊 Feature: Dashboard de Evidencia Médica',
    body: '### Objetivo\nCrear un dashboard intuitivo para visualizar y gestionar evidencia médica.\n\n### Tareas\n- [ ] Diseñar layout del dashboard\n- [ ] Implementar visualización de resultados\n- [ ] Crear componentes de filtrado\n- [ ] Agregar estadísticas y métricas\n- [ ] Implementar exportación de datos\n\n### Criterios de Aceptación\n- Dashboard responsive\n- Filtros funcionando\n- Visualización clara de datos\n- Exportación funcionando',
    labels: ['feature', 'UI/UX', 'dashboard']
  },
  {
    title: '📱 Feature: Diseño Responsive y UX',
    body: '### Objetivo\nAsegurar una experiencia de usuario óptima en todos los dispositivos.\n\n### Tareas\n- [ ] Implementar diseño mobile-first\n- [ ] Optimizar componentes para móviles\n- [ ] Crear animaciones y transiciones\n- [ ] Realizar pruebas de usabilidad\n- [ ] Implementar feedback visual\n\n### Criterios de Aceptación\n- Diseño responsive completo\n- Experiencia fluida en móviles\n- Feedback visual implementado\n- Tests de usabilidad exitosos',
    labels: ['feature', 'UI/UX', 'responsive']
  },
  {
    title: '📝 Documentación: Guías y Manuales',
    body: '### Objetivo\nCrear documentación completa del proyecto y guías de usuario.\n\n### Tareas\n- [ ] Escribir documentación técnica\n- [ ] Crear guías de usuario\n- [ ] Documentar APIs\n- [ ] Crear ejemplos de uso\n- [ ] Documentar procesos de deployment\n\n### Criterios de Aceptación\n- Documentación completa y clara\n- Guías de usuario actualizadas\n- APIs documentadas\n- Ejemplos funcionales',
    labels: ['documentation', 'high-priority']
  }
];

async function createSprintAndIssues() {
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

    // Crear labels si no existen
    const labels = [
      'sprint-planning',
      'setup',
      'devops',
      'architecture',
      'feature',
      'documentation',
      'dashboard',
      'security'
    ];
    
    for (const label of labels) {
      try {
        await octokit.issues.createLabel({
          owner: OWNER,
          repo: REPO,
          name: label,
          color: Math.floor(Math.random()*16777215).toString(16),
          description: `Etiqueta para issues relacionados con ${label}`
        });
        console.log(`Label "${label}" creada`);
      } catch (error) {
        if (error.status !== 422) {
          console.error(`Error creando label "${label}":`, error.message);
        }
      }
    }

    // Crear milestone para el Sprint MVP
    let milestone;
    try {
      const { data } = await octokit.issues.createMilestone({
        owner: OWNER,
        repo: REPO,
        title: 'Sprint MVP',
        description: 'Sprint enfocado en desarrollar las funcionalidades core del MVP',
        due_on: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 semanas desde ahora
      });
      milestone = data;
      console.log('Milestone "Sprint MVP" creado');
    } catch (error) {
      console.error('Error creando milestone:', error.message);
      return;
    }

    // Crear issues
    for (const issue of sprintMVPIssues) {
      try {
        const response = await octokit.issues.create({
          owner: OWNER,
          repo: REPO,
          title: issue.title,
          body: issue.body,
          labels: issue.labels,
          milestone: milestone.number
        });
        
        console.log(`Issue creado: ${issue.title} (#${response.data.number})`);
      } catch (error) {
        console.error(`Error creando issue "${issue.title}":`, error.message);
      }
    }

    console.log('Proceso de creación del Sprint MVP y sus issues completado');
  } catch (error) {
    console.error('Error en el proceso:', error.message);
    process.exit(1);
  }
}

createSprintAndIssues().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
}); 