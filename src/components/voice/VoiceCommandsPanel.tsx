import React, { useState, useEffect } from 'react';
import { VoiceCommand } from '../../services/voice/VoiceCommandService';
import { Transcript } from '../../types/voice';

interface VoiceCommandsPanelProps {
  commands: VoiceCommand[];
  isListening: boolean;
  onToggleListening: () => void;
  lastTranscript: Transcript | null;
  lastCommand: string | null;
  className?: string;
}

/**
 * Panel para mostrar y gestionar comandos de voz
 */
export const VoiceCommandsPanel: React.FC<VoiceCommandsPanelProps> = ({
  commands,
  isListening,
  onToggleListening,
  lastTranscript,
  lastCommand,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Obtener categorías únicas de comandos
  const categories = ['all', ...new Set(commands.map(cmd => cmd.type))];

  // Filtrar comandos por categoría y búsqueda
  const filteredCommands = commands.filter(cmd => {
    const matchesCategory = selectedCategory === 'all' || cmd.type === selectedCategory;
    const matchesSearch = 
      searchTerm === '' || 
      cmd.phrases.some(phrase => phrase.includes(searchTerm.toLowerCase())) ||
      (cmd.description && cmd.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Agrupar comandos por tipo
  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const type = command.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(command);
    return groups;
  }, {} as Record<string, VoiceCommand[]>);

  // Efecto para mostrar el último comando ejecutado
  useEffect(() => {
    if (lastCommand) {
      const commandElement = document.getElementById(`command-${lastCommand}`);
      if (commandElement) {
        commandElement.classList.add('bg-green-100');
        setTimeout(() => {
          commandElement.classList.remove('bg-green-100');
        }, 2000);
      }
    }
  }, [lastCommand]);

  return (
    <div className={`voice-commands-panel ${className}`}>
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Comandos de Voz</h3>
          <button
            onClick={onToggleListening}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isListening ? 'Detener' : 'Iniciar'} Escucha
          </button>
        </div>

        {isListening && lastTranscript && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-700">Escuchando:</p>
            <p className="text-sm text-blue-600">{lastTranscript.text}</p>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar comandos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Todos' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredCommands.length} {filteredCommands.length === 1 ? 'comando disponible' : 'comandos disponibles'}
          </p>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showHelp ? 'Ocultar ayuda' : 'Mostrar ayuda'}
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {Object.entries(groupedCommands).map(([type, cmds]) => (
            <div key={type} className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </h4>
              <div className="space-y-2">
                {cmds.map(cmd => (
                  <div 
                    key={cmd.id} 
                    id={`command-${cmd.id}`}
                    className="p-2 bg-gray-50 rounded-md border border-gray-200 transition-colors duration-300"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {cmd.description || cmd.id}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Frases: {cmd.phrases.join(', ')}
                    </div>
                    {showHelp && cmd.help && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        {cmd.help}
                      </div>
                    )}
                    {cmd.requiresConfirmation && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Requiere confirmación
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              No se encontraron comandos con estos criterios
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 