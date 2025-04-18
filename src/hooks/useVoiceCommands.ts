import { useEffect, useState, useCallback, useRef } from 'react';
import { VoiceCommandService, VoiceCommand } from '../services/voice/VoiceCommandService';
import { MedicalVoiceAssistant } from '../services/voice/MedicalVoiceAssistant';
import { Transcript } from '../types/voice';

interface UseVoiceCommandsOptions {
  context?: string | string[];
  enabled?: boolean;
  onCommandExecuted?: (commandId: string) => void;
  onCommandNotFound?: (text: string) => void;
  specialistId?: string;
  autoStart?: boolean;
}

interface VoiceCommandResult {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  registerCommand: (command: VoiceCommand) => void;
  registerCommands: (commands: VoiceCommand[]) => void;
  unregisterCommand: (commandId: string) => void;
  clearCommands: () => void;
  availableCommands: VoiceCommand[];
  lastTranscript: Transcript | null;
  lastCommand: string | null;
  setContext: (context: string | string[]) => void;
  addContext: (context: string) => void;
  removeContext: (context: string) => void;
  currentContext: string[];
}

/**
 * Hook personalizado para usar comandos de voz en componentes
 */
export function useVoiceCommands(options: UseVoiceCommandsOptions = {}): VoiceCommandResult {
  const {
    context = 'global',
    enabled = true,
    onCommandExecuted,
    onCommandNotFound,
    specialistId,
    autoStart = false,
  } = options;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [availableCommands, setAvailableCommands] = useState<VoiceCommand[]>([]);
  const [lastTranscript, setLastTranscript] = useState<Transcript | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [currentContext, setCurrentContextState] = useState<string[]>(
    Array.isArray(context) ? [...context, 'global'] : [context, 'global']
  );

  // Referencias a los servicios
  const commandServiceRef = useRef<VoiceCommandService>(VoiceCommandService.getInstance());
  const voiceAssistantRef = useRef<MedicalVoiceAssistant | null>(null);

  // Inicializar el asistente de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      voiceAssistantRef.current = new MedicalVoiceAssistant({
        continuous: true,
        interimResults: true,
        lang: 'es-ES'
      });

      if (specialistId) {
        voiceAssistantRef.current.setSpecialist(specialistId);
      }

      if (autoStart) {
        startListening();
      }

      return () => {
        if (voiceAssistantRef.current) {
          voiceAssistantRef.current.stop();
        }
      };
    }
  }, [specialistId]);

  // Configurar el contexto inicial
  useEffect(() => {
    const commandService = commandServiceRef.current;
    commandService.setContext(context);
    updateAvailableCommands();

    // Establecer event listeners
    const handleCommandExecuted = (commandId: string) => {
      setLastCommand(commandId);
      if (onCommandExecuted) {
        onCommandExecuted(commandId);
      }
    };

    const handleCommandNotFound = (text: string) => {
      if (onCommandNotFound) {
        onCommandNotFound(text);
      }
    };

    const handleContextChanged = () => {
      updateAvailableCommands();
      setCurrentContextState(commandService.getAvailableCommands()
        .flatMap(cmd => cmd.context || [])
        .filter((ctx, index, array) => array.indexOf(ctx) === index)
      );
    };

    commandService.on('commandExecuted', handleCommandExecuted);
    commandService.on('commandNotFound', handleCommandNotFound);
    commandService.on('contextChanged', handleContextChanged);
    commandService.on('commandsRegistered', updateAvailableCommands);
    commandService.on('commandsCleared', updateAvailableCommands);

    return () => {
      commandService.removeAllListeners();
    };
  }, [context, onCommandExecuted, onCommandNotFound]);

  // Establecer/actualizar estado de habilitado
  useEffect(() => {
    commandServiceRef.current.setEnabled(enabled);
  }, [enabled]);

  // Actualizar la lista de comandos disponibles
  const updateAvailableCommands = useCallback(() => {
    setAvailableCommands(commandServiceRef.current.getAvailableCommands());
  }, []);

  // Iniciar la escucha de voz
  const startListening = useCallback(() => {
    if (voiceAssistantRef.current && !isListening) {
      voiceAssistantRef.current.on('transcript', handleTranscript);
      voiceAssistantRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // Detener la escucha de voz
  const stopListening = useCallback(() => {
    if (voiceAssistantRef.current && isListening) {
      voiceAssistantRef.current.off('transcript', handleTranscript);
      voiceAssistantRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Alternar estado de escucha
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Manejar las transcripciones recibidas
  const handleTranscript = useCallback((transcript: Transcript) => {
    if (!transcript.text || transcript.text.trim() === '') return;
    
    setLastTranscript(transcript);
    
    // Procesar el texto para detectar comandos
    commandServiceRef.current.processText(transcript.text);
  }, []);

  // Registrar un comando
  const registerCommand = useCallback((command: VoiceCommand) => {
    commandServiceRef.current.registerCommand(command);
    updateAvailableCommands();
  }, [updateAvailableCommands]);

  // Registrar múltiples comandos
  const registerCommands = useCallback((commands: VoiceCommand[]) => {
    commandServiceRef.current.registerCommands(commands);
    updateAvailableCommands();
  }, [updateAvailableCommands]);

  // Eliminar un comando
  const unregisterCommand = useCallback((commandId: string) => {
    commandServiceRef.current.unregisterCommand(commandId);
    updateAvailableCommands();
  }, [updateAvailableCommands]);

  // Limpiar todos los comandos excepto los del sistema
  const clearCommands = useCallback(() => {
    commandServiceRef.current.clearCommands();
    updateAvailableCommands();
  }, [updateAvailableCommands]);

  // Establecer el contexto
  const setContext = useCallback((newContext: string | string[]) => {
    commandServiceRef.current.setContext(newContext);
  }, []);

  // Añadir un contexto
  const addContext = useCallback((newContext: string) => {
    commandServiceRef.current.addContext(newContext);
  }, []);

  // Eliminar un contexto
  const removeContext = useCallback((contextToRemove: string) => {
    commandServiceRef.current.removeContext(contextToRemove);
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    toggleListening,
    registerCommand,
    registerCommands,
    unregisterCommand,
    clearCommands,
    availableCommands,
    lastTranscript,
    lastCommand,
    setContext,
    addContext,
    removeContext,
    currentContext
  };
} 