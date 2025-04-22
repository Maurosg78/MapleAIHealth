import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_PAT = process.env.GITHUB_PAT;
const OWNER = 'Maurosg78';
const REPO = 'MapleAIHealth';

const mvpIssues = [
  {
    title: '🎯 Implementar Autenticación de Usuarios',
    body: '### Objetivo\nImplementar un sistema de autenticación seguro para los usuarios de la aplicación.\n\n### Tareas\n- [ ] Configurar autenticación con JWT\n- [ ] Implementar registro de usuarios\n- [ ] Implementar login/logout\n- [ ] Agregar validación de roles\n- [ ] Implementar recuperación de contraseña\n\n### Criterios de Aceptación\n- Sistema de autenticación funcionando\n- Tokens JWT implementados\n- Rutas protegidas funcionando\n- Manejo de sesiones implementado',
    labels: ['MVP', 'authentication', 'high-priority']
  },
  {
    title: '🔍 Implementar Búsqueda Básica de Evidencia Médica',
    body: '### Objetivo\nDesarrollar la funcionalidad básica de búsqueda de evidencia médica.\n\n### Tareas\n- [ ] Implementar búsqueda por términos clave\n- [ ] Integrar con PubMed API\n- [ ] Crear interfaz de búsqueda\n- [ ] Implementar filtros básicos\n\n### Criterios de Aceptación\n- Búsqueda funcional\n- Resultados relevantes mostrados\n- Interfaz intuitiva',
    labels: ['MVP', 'search', 'core-feature']
  },
  {
    title: '📊 Desarrollar Dashboard Principal',
    body: '### Objetivo\nCrear el dashboard principal con las funcionalidades esenciales del MVP.\n\n### Tareas\n- [ ] Diseñar layout principal\n- [ ] Implementar widgets de estadísticas\n- [ ] Crear sección de búsquedas recientes\n- [ ] Agregar accesos rápidos\n\n### Criterios de Aceptación\n- Dashboard responsive\n- Información relevante visible\n- Navegación intuitiva',
    labels: ['MVP', 'UI/UX', 'core-feature']
  },
  {
    title: '📱 Implementar Diseño Responsive',
    body: '### Objetivo\nAsegurar que la aplicación sea completamente responsive y funcione en todos los dispositivos.\n\n### Tareas\n- [ ] Implementar diseño mobile-first\n- [ ] Optimizar componentes para diferentes tamaños de pantalla\n- [ ] Realizar pruebas en diferentes dispositivos\n\n### Criterios de Aceptación\n- Funciona en móviles y tablets\n- No hay problemas de visualización\n- Experiencia consistente en todos los dispositivos',
    labels: ['MVP', 'UI/UX', 'responsive']
  },
  {
    title: '🔒 Implementar Gestión de Datos Médicos Seguros',
    body: '### Objetivo\nImplementar el sistema de almacenamiento y gestión segura de datos médicos.\n\n### Tareas\n- [ ] Diseñar estructura de base de datos\n- [ ] Implementar encriptación de datos sensibles\n- [ ] Crear API para gestión de datos\n- [ ] Implementar logging y auditoría\n\n### Criterios de Aceptación\n- Datos almacenados de forma segura\n- Cumplimiento con estándares de seguridad\n- Sistema de auditoría funcionando',
    labels: ['MVP', 'security', 'high-priority']
  }
];

async function createMVPIssues() {
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
    const labels = ['MVP', 'authentication', 'high-priority', 'search', 'core-feature', 'UI/UX', 'responsive', 'security'];
    
    for (const label of labels) {
      try {
        await octokit.issues.createLabel({
          owner: OWNER,
          repo: REPO,
          name: label,
          color: Math.floor(Math.random()*16777215).toString(16), // Color aleatorio
          description: `Etiqueta para issues relacionados con ${label}`
        });
        console.log(`Label "${label}" creada`);
      } catch (error) {
        if (error.status !== 422) { // 422 significa que la label ya existe
          console.error(`Error creando label "${label}":`, error.message);
        }
      }
    }

    // Crear issues
    for (const issue of mvpIssues) {
      try {
        const response = await octokit.issues.create({
          owner: OWNER,
          repo: REPO,
          title: issue.title,
          body: issue.body,
          labels: issue.labels
        });
        
        console.log(`Issue creado: ${issue.title} (#${response.data.number})`);
      } catch (error) {
        console.error(`Error creando issue "${issue.title}":`, error.message);
      }
    }

    console.log('Proceso de creación de issues MVP completado');
  } catch (error) {
    console.error('Error en el proceso:', error.message);
    process.exit(1);
  }
}

createMVPIssues().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
}); 