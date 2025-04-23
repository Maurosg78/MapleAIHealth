import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';;;;;
import { useVoiceCommands } from '../hooks/useVoiceCommands';;;;;
import { VoiceCommandsPanel } from '../components/voice/VoiceCommandsPanel';;;;;
import { VoiceCommand, CommandType } from '../services/voice/VoiceCommandService';;;;;

/**
 * Página que muestra todos los comandos de voz disponibles en la aplicación 
 * y proporciona ayuda sobre cómo utilizarlos.
 */
const VoiceCommandsHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  
  // Usar el hook de comandos de voz con todos los contextos disponibles
  const {
    isListening,
    toggleListening,
    registerCommands,
    availableCommands,
    lastTranscript,
    lastCommand,
  } = useVoiceCommands({
    context: ['global', 'help'], // Contexto específico para esta página
    specialistId: 'HELP_PAGE',
  });

  // Registrar comandos específicos para esta página de ayuda
  React.useEffect(() => {
    // Comandos para navegación general
    const navigationCommands: VoiceCommand[] = [
      {
        id: 'back',
        type: 'navigation' as CommandType,
        phrases: ['volver', 'regresar', 'atrás', 'ir atrás'],
        action: () => navigate(-1),
        description: 'Volver a la página anterior',
        context: ['help', 'global']
      },
      {
        id: 'go_home',
        type: 'navigation' as CommandType,
        phrases: ['ir a inicio', 'página principal', 'inicio'],
        action: () => navigate('/'),
        description: 'Ir a la página de inicio',
        context: ['help', 'global']
      },
      {
        id: 'go_clinical',
        type: 'navigation' as CommandType,
        phrases: ['ir a consulta', 'abrir consulta', 'página de consulta'],
        action: () => navigate('/consultas-voz'),
        description: 'Ir a la página de consulta clínica',
        context: ['help', 'global']
      },
    ];

    // Comandos para controlar demostraciones
    const demoCommands: VoiceCommand[] = [
      {
        id: 'show_navigation_demo',
        type: 'action' as CommandType,
        phrases: ['mostrar demo de navegación', 'demo navegación'],
        action: () => setActiveDemo('navigation'),
        description: 'Mostrar demostración de comandos de navegación',
        context: ['help']
      },
      {
        id: 'show_form_demo',
        type: 'action' as CommandType,
        phrases: ['mostrar demo de formularios', 'demo formularios'],
        action: () => setActiveDemo('form'),
        description: 'Mostrar demostración de comandos de formulario',
        context: ['help']
      },
      {
        id: 'close_demo',
        type: 'action' as CommandType,
        phrases: ['cerrar demo', 'ocultar demo', 'finalizar demo'],
        action: () => setActiveDemo(null),
        description: 'Cerrar la demostración activa',
        context: ['help']
      }
    ];

    // Registrar todos los comandos
    registerCommands([...navigationCommands, ...demoCommands]);
  }, [navigate, registerCommands]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Comandos de Voz - Ayuda</h1>
        <p className="text-sm text-gray-600 mt-1">
          Aprenda a usar comandos de voz para navegar y controlar la aplicación
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">¿Cómo usar los comandos de voz?</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p className="font-medium">Active el asistente de voz</p>
                <p className="text-sm text-gray-600">Haga clic en el botón "Iniciar Escucha" para comenzar a usar los comandos de voz.</p>
              </li>
              <li>
                <p className="font-medium">Pronuncie un comando</p>
                <p className="text-sm text-gray-600">Diga claramente uno de los comandos disponibles. Por ejemplo: "Ir a inicio" o "Campo diagnóstico".</p>
              </li>
              <li>
                <p className="font-medium">Observe la acción</p>
                <p className="text-sm text-gray-600">La aplicación ejecutará la acción correspondiente al comando reconocido.</p>
              </li>
            </ol>
          </div>

          {activeDemo === 'navigation' && (
            <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Demostración: Navegación</h2>
                <button 
                  onClick={() => setActiveDemo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="mb-4">
                Los comandos de navegación le permiten moverse entre diferentes páginas o secciones de la aplicación sin usar el ratón.
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Pruebe estos comandos:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">"Ir a inicio"</span>
                    <span className="text-gray-600">Navega a la página principal</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">"Ir a consulta"</span>
                    <span className="text-gray-600">Abre la página de consulta clínica</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">"Volver"</span>
                    <span className="text-gray-600">Regresa a la página anterior</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeDemo === 'form' && (
            <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Demostración: Formularios</h2>
                <button 
                  onClick={() => setActiveDemo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="mb-4">
                Los comandos de formulario le permiten seleccionar campos específicos y dictarles contenido sin usar el teclado.
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Pruebe estos comandos en la página de consulta:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">"Campo queja principal"</span>
                    <span className="text-gray-600">Selecciona el campo de queja principal</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">"Campo diagnóstico"</span>
                    <span className="text-gray-600">Selecciona el campo de diagnóstico</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">"Guardar"</span>
                    <span className="text-gray-600">Guarda el formulario actual</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tipos de Comandos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg text-blue-700">Navegación</h3>
                <p className="text-sm text-gray-600 mb-2">Comandos para moverse entre páginas y secciones.</p>
                <button 
                  onClick={() => setActiveDemo('navigation')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver demostración →
                </button>
              </div>
              <div>
                <h3 className="font-medium text-lg text-green-700">Formularios</h3>
                <p className="text-sm text-gray-600 mb-2">Comandos para interactuar con campos de formulario.</p>
                <button 
                  onClick={() => setActiveDemo('form')}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Ver demostración →
                </button>
              </div>
              <div>
                <h3 className="font-medium text-lg text-purple-700">Acciones</h3>
                <p className="text-sm text-gray-600">Comandos para ejecutar acciones como guardar o cancelar.</p>
              </div>
              <div>
                <h3 className="font-medium text-lg text-yellow-700">Sistema</h3>
                <p className="text-sm text-gray-600">Comandos de sistema como solicitar ayuda.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-4">
            <VoiceCommandsPanel
              commands={availableCommands}
              isListening={isListening}
              onToggleListening={toggleListening}
              lastTranscript={lastTranscript}
              lastCommand={lastCommand}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandsHelpPage; 