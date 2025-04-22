import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Inicializar dotenv
dotenv.config();

// Obtener directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const config = {
  owner: 'Maurosg78', // Nombre del propietario del repositorio
  repo: 'MapleAIHealth', // Nombre del repositorio
  token: process.env.GITHUB_TOKEN || fs.readFileSync(path.join(__dirname, '..', '.github_token.txt'), 'utf8').trim()
};

// Inicializar Octokit
const octokit = new Octokit({
  auth: config.token
});

// Definición del proyecto
const proyecto = {
  nombre: 'MapleAI Health MVP',
  descripcion: 'Proyecto para el desarrollo del MVP de MapleAI Health',
  publico: true
};

// Definición de columnas para el tablero Kanban
const columnas = [
  { nombre: 'Backlog', descripcion: 'Tareas pendientes' },
  { nombre: 'To Do', descripcion: 'Tareas por hacer en el sprint actual' },
  { nombre: 'In Progress', descripcion: 'Tareas en progreso' },
  { nombre: 'Review', descripcion: 'Tareas en revisión' },
  { nombre: 'Done', descripcion: 'Tareas completadas' }
];

// Definición de etiquetas
const etiquetas = [
  { nombre: 'core', color: '0366d6', descripcion: 'Funcionalidades principales' },
  { nombre: 'ui', color: 'c5def5', descripcion: 'Interfaz de usuario' },
  { nombre: 'patient-management', color: '45aa88', descripcion: 'Gestión de pacientes' },
  { nombre: 'soap', color: 'd4c5f9', descripcion: 'Notas SOAP' },
  { nombre: 'auth', color: 'ff0000', descripcion: 'Autenticación y seguridad' },
  { nombre: 'ai', color: 'ffff00', descripcion: 'Funcionalidades de IA' },
  { nombre: 'bug', color: 'd73a4a', descripcion: 'Algo no funciona' },
  { nombre: 'enhancement', color: 'a2eeef', descripcion: 'Mejora de una característica existente' },
  { nombre: 'documentation', color: '0075ca', descripcion: 'Documentación' }
];

// Tareas completadas (Modelo de Datos de Pacientes)
const tareasCompletadas = [
  {
    titulo: 'Crear modelo de datos unificado para pacientes',
    descripcion: 'Se ha creado un modelo de datos centralizado para pacientes con todas las interfaces necesarias en el archivo `src/models/Patient.ts`. Este modelo incluye:\n\n' +
    '- Datos básicos del paciente (Patient)\n' +
    '- Historia clínica (PatientMedicalHistory)\n' +
    '- Visitas (PatientVisit)\n' +
    '- Progreso (PatientProgress)\n' +
    '- Resumen para listas (PatientSummary)\n\n' +
    'Este modelo unificado reemplaza las múltiples definiciones dispersas en diferentes archivos.',
    columna: 'Done',
    etiquetas: ['patient-management', 'core'],
    asignado: null
  },
  {
    titulo: 'Crear servicio de gestión de pacientes',
    descripcion: 'Se ha implementado un servicio para gestionar pacientes en `src/services/PatientService.ts` con las siguientes funcionalidades:\n\n' +
    '- Obtener lista de pacientes\n' +
    '- Obtener detalles de un paciente\n' +
    '- Crear nuevos pacientes\n' +
    '- Actualizar pacientes existentes\n' +
    '- Programar visitas\n' +
    '- Buscar pacientes\n\n' +
    'Actualmente utiliza datos simulados pero está diseñado para integrarse fácilmente con una API.',
    columna: 'Done',
    etiquetas: ['patient-management', 'core'],
    asignado: null
  },
  {
    titulo: 'Implementar componente de lista de pacientes',
    descripcion: 'Se ha creado un componente de lista de pacientes en `src/components/patients/PatientList.tsx` con las siguientes características:\n\n' +
    '- Visualización de la lista de pacientes con información resumida\n' +
    '- Búsqueda de pacientes por nombre o diagnóstico\n' +
    '- Indicador de estado del paciente\n' +
    '- Botones para ver detalles y editar\n\n' +
    'El componente está integrado con el servicio de pacientes y es reutilizable en diferentes partes de la aplicación.',
    columna: 'Done',
    etiquetas: ['patient-management', 'ui'],
    asignado: null
  },
  {
    titulo: 'Implementar componente de detalles de paciente',
    descripcion: 'Se ha creado un componente de detalles de paciente en `src/components/patients/PatientDetail.tsx` con las siguientes características:\n\n' +
    '- Visualización de información completa del paciente\n' +
    '- Pestañas para información general, visitas y documentos\n' +
    '- Visualización de historial de visitas\n' +
    '- Información de contacto y seguros\n\n' +
    'El componente está integrado con el servicio de pacientes y utiliza Material UI para una interfaz moderna.',
    columna: 'Done',
    etiquetas: ['patient-management', 'ui'],
    asignado: null
  },
  {
    titulo: 'Crear páginas de gestión de pacientes',
    descripcion: 'Se han creado páginas para la gestión de pacientes:\n\n' +
    '- Página de lista de pacientes: `src/pages/PatientsPage.tsx`\n' +
    '- Página de detalles de paciente: `src/pages/PatientDetailPage.tsx`\n\n' +
    'Estas páginas utilizan los componentes de pacientes y están integradas en el sistema de rutas.',
    columna: 'Done',
    etiquetas: ['patient-management', 'ui'],
    asignado: null
  },
  {
    titulo: 'Actualizar sistema de rutas para gestión de pacientes',
    descripcion: 'Se ha actualizado el sistema de rutas en `src/routes.tsx` para incluir las nuevas páginas de gestión de pacientes:\n\n' +
    '- `/pacientes`: Lista de pacientes\n' +
    '- `/pacientes/:id`: Detalles de un paciente específico\n\n' +
    'Las rutas están correctamente configuradas dentro del layout principal de la aplicación.',
    columna: 'Done',
    etiquetas: ['patient-management', 'core'],
    asignado: null
  }
];

// Tareas pendientes para el MVP
const tareasPendientes = [
  {
    titulo: 'Implementar formulario de creación/edición de pacientes',
    descripcion: 'Crear un formulario para añadir nuevos pacientes y editar existentes. El formulario debe:\n\n' +
    '- Validar todos los campos requeridos\n' +
    '- Permitir añadir/editar información de contacto\n' +
    '- Permitir añadir/editar información de seguro\n' +
    '- Integrarse con el servicio de pacientes\n\n' +
    'Debe seguir los estándares de diseño de la aplicación y ser accesible.',
    columna: 'To Do',
    etiquetas: ['patient-management', 'ui'],
    asignado: null
  },
  {
    titulo: 'Implementar sistema de búsqueda avanzada de pacientes',
    descripcion: 'Crear un sistema de búsqueda avanzada que permita filtrar pacientes por:\n\n' +
    '- Diagnóstico\n' +
    '- Rango de edad\n' +
    '- Fecha de última visita\n' +
    '- Estado del paciente\n\n' +
    'La búsqueda debe ser eficiente y ofrecer opciones para ordenar los resultados.',
    columna: 'To Do',
    etiquetas: ['patient-management', 'enhancement'],
    asignado: null
  },
  {
    titulo: 'Integrar gestión de pacientes con el sistema de autenticación',
    descripcion: 'Implementar la integración del sistema de gestión de pacientes con el sistema de autenticación para:\n\n' +
    '- Restringir el acceso a pacientes según rol del usuario\n' +
    '- Registrar qué usuario realiza cambios en los pacientes\n' +
    '- Implementar permisos diferenciados (lectura/escritura)\n\n' +
    'Esto es crucial para cumplir con las normativas de protección de datos médicos.',
    columna: 'To Do',
    etiquetas: ['patient-management', 'auth', 'core'],
    asignado: null
  },
  {
    titulo: 'Implementar sistema de programación de visitas',
    descripcion: 'Crear un sistema completo para programar visitas que incluya:\n\n' +
    '- Calendario de disponibilidad\n' +
    '- Formulario de programación de visita\n' +
    '- Notificaciones de confirmación\n' +
    '- Gestión de cancelaciones y reprogramaciones\n\n' +
    'El sistema debe integrarse con el servicio de pacientes y reflejarse en el perfil del paciente.',
    columna: 'To Do',
    etiquetas: ['patient-management', 'ui', 'enhancement'],
    asignado: null
  }
];

// Tareas en progreso
const tareasEnProgreso = [
  {
    titulo: 'Implementar integración con IA para recomendaciones de pacientes',
    descripcion: 'Integrar el módulo de IA existente con el sistema de gestión de pacientes para:\n\n' +
    '- Generar recomendaciones de tratamiento basadas en el historial del paciente\n' +
    '- Identificar patrones en los datos de progreso del paciente\n' +
    '- Sugerir seguimientos basados en el diagnóstico y progreso\n\n' +
    'La integración debe ser no intrusiva y cumplir con las normativas de privacidad.',
    columna: 'In Progress',
    etiquetas: ['patient-management', 'ai', 'enhancement'],
    asignado: null
  },
  {
    titulo: 'Desarrollar gráficos de progreso de paciente',
    descripcion: 'Crear gráficos interactivos para visualizar el progreso del paciente:\n\n' +
    '- Evolución de mediciones clave a lo largo del tiempo\n' +
    '- Comparación con valores normales/esperados\n' +
    '- Visualización de tendencias\n' +
    '- Exportación de gráficos\n\n' +
    'Los gráficos deben ser responsivos y accesibles.',
    columna: 'In Progress',
    etiquetas: ['patient-management', 'ui', 'enhancement'],
    asignado: null
  }
];

// Función principal
async function actualizarProyecto() {
  try {
    console.log('Iniciando actualización del proyecto...');

    // 1. Crear o actualizar etiquetas
    console.log('Configurando etiquetas...');
    for (const etiqueta of etiquetas) {
      try {
        await octokit.issues.getLabel({
          owner: config.owner,
          repo: config.repo,
          name: etiqueta.nombre
        });
        console.log(`La etiqueta ${etiqueta.nombre} ya existe, actualizando...`);
        await octokit.issues.updateLabel({
          owner: config.owner,
          repo: config.repo,
          name: etiqueta.nombre,
          color: etiqueta.color,
          description: etiqueta.descripcion
        });
      } catch (error) {
        if (error.status === 404) {
          console.log(`Creando etiqueta ${etiqueta.nombre}...`);
          await octokit.issues.createLabel({
            owner: config.owner,
            repo: config.repo,
            name: etiqueta.nombre,
            color: etiqueta.color,
            description: etiqueta.descripcion
          });
        } else {
          throw error;
        }
      }
    }

    // 2. Buscar o crear el proyecto
    console.log('Configurando proyecto...');
    let projectId;
    const projects = await octokit.projects.listForRepo({
      owner: config.owner,
      repo: config.repo
    });

    const existingProject = projects.data.find(p => p.name === proyecto.nombre);
    if (existingProject) {
      console.log(`El proyecto ${proyecto.nombre} ya existe, utilizando el existente.`);
      projectId = existingProject.id;
      
      // Actualizar proyecto
      await octokit.projects.update({
        project_id: projectId,
        name: proyecto.nombre,
        body: proyecto.descripcion,
        state: 'open',
        organization_permission: 'read',
        public: proyecto.publico
      });
    } else {
      console.log(`Creando nuevo proyecto ${proyecto.nombre}...`);
      const newProject = await octokit.projects.createForRepo({
        owner: config.owner,
        repo: config.repo,
        name: proyecto.nombre,
        body: proyecto.descripcion
      });
      projectId = newProject.data.id;
      
      // Hacer el proyecto público si es necesario
      await octokit.projects.update({
        project_id: projectId,
        name: proyecto.nombre,
        body: proyecto.descripcion,
        state: 'open',
        organization_permission: 'read',
        public: proyecto.publico
      });
    }

    // 3. Configurar columnas
    console.log('Configurando columnas...');
    const columnsResponse = await octokit.projects.listColumns({
      project_id: projectId
    });

    const columnMap = {};
    for (const columna of columnas) {
      const existingColumn = columnsResponse.data.find(c => c.name === columna.nombre);
      if (existingColumn) {
        console.log(`La columna ${columna.nombre} ya existe.`);
        columnMap[columna.nombre] = existingColumn.id;
      } else {
        console.log(`Creando columna ${columna.nombre}...`);
        const newColumn = await octokit.projects.createColumn({
          project_id: projectId,
          name: columna.nombre
        });
        columnMap[columna.nombre] = newColumn.data.id;
      }
    }

    // 4. Crear tareas completadas
    console.log('Creando tareas completadas...');
    for (const tarea of tareasCompletadas) {
      // Crear un issue para la tarea
      const issue = await octokit.issues.create({
        owner: config.owner,
        repo: config.repo,
        title: tarea.titulo,
        body: tarea.descripcion,
        labels: tarea.etiquetas,
        assignees: tarea.asignado ? [tarea.asignado] : []
      });

      // Cerrar el issue ya que está completado
      await octokit.issues.update({
        owner: config.owner,
        repo: config.repo,
        issue_number: issue.data.number,
        state: 'closed'
      });

      // Añadir el issue a la columna correspondiente
      const columnId = columnMap[tarea.columna];
      if (columnId) {
        await octokit.projects.createCard({
          column_id: columnId,
          content_id: issue.data.id,
          content_type: 'Issue'
        });
      }

      console.log(`Tarea completada creada: ${tarea.titulo}`);
    }

    // 5. Crear tareas pendientes
    console.log('Creando tareas pendientes...');
    for (const tarea of tareasPendientes) {
      // Crear un issue para la tarea
      const issue = await octokit.issues.create({
        owner: config.owner,
        repo: config.repo,
        title: tarea.titulo,
        body: tarea.descripcion,
        labels: tarea.etiquetas,
        assignees: tarea.asignado ? [tarea.asignado] : []
      });

      // Añadir el issue a la columna correspondiente
      const columnId = columnMap[tarea.columna];
      if (columnId) {
        await octokit.projects.createCard({
          column_id: columnId,
          content_id: issue.data.id,
          content_type: 'Issue'
        });
      }

      console.log(`Tarea pendiente creada: ${tarea.titulo}`);
    }

    // 6. Crear tareas en progreso
    console.log('Creando tareas en progreso...');
    for (const tarea of tareasEnProgreso) {
      // Crear un issue para la tarea
      const issue = await octokit.issues.create({
        owner: config.owner,
        repo: config.repo,
        title: tarea.titulo,
        body: tarea.descripcion,
        labels: tarea.etiquetas,
        assignees: tarea.asignado ? [tarea.asignado] : []
      });

      // Añadir el issue a la columna correspondiente
      const columnId = columnMap[tarea.columna];
      if (columnId) {
        await octokit.projects.createCard({
          column_id: columnId,
          content_id: issue.data.id,
          content_type: 'Issue'
        });
      }

      console.log(`Tarea en progreso creada: ${tarea.titulo}`);
    }

    console.log('¡Proyecto actualizado con éxito!');
    console.log(`Visita https://github.com/${config.owner}/${config.repo}/projects para ver el proyecto.`);

  } catch (error) {
    console.error('Error al actualizar el proyecto:', error);
  }
}

// Ejecutar la función principal
actualizarProyecto(); 