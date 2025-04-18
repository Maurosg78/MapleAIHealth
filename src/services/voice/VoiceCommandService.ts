import { EventEmitter } from 'events';

/**
 * Tipos de comandos de voz soportados por el sistema
 */
export type CommandType = 
  | 'navigation'      // Navegación entre rutas o secciones
  | 'action'          // Acciones como guardar, cancelar, etc.
  | 'form'            // Interacción con formularios
  | 'field'           // Selección de campos específicos
  | 'dictation'       // Dictado de texto
  | 'system'          // Comandos del sistema como ayuda, etc.
  | 'custom';         // Comandos personalizados

/**
 * Interfaz para un comando de voz
 */
export interface VoiceCommand {
  id: string;
  type: CommandType;
  phrases: string[];  // Frases que activan el comando (en minúsculas)
  action: (...args: unknown[]) => void;
  context?: string[]; // Contextos donde el comando está disponible
  description?: string;
  help?: string;
  requiresConfirmation?: boolean;
}

/**
 * Interfaz para los eventos del servicio de comandos de voz
 */
interface VoiceCommandEvents {
  commandExecuted: (commandId: string) => void;
  commandNotFound: (text: string) => void;
  contextChanged: (context: string) => void;
  commandsRegistered: (commands: VoiceCommand[]) => void;
  commandsCleared: () => void;
  helpRequested: (commands: VoiceCommand[]) => void;
}

/**
 * Servicio para gestionar comandos de voz en la aplicación
 */
export class VoiceCommandService extends EventEmitter {
  private static instance: VoiceCommandService;
  private commands: Map<string, VoiceCommand> = new Map();
  private currentContext: string[] = ['global'];
  private isEnabled: boolean = true;
  private sensitivityThreshold: number = 0.7; // Umbral de sensibilidad para coincidencia de comandos

  private constructor() {
    super();
    this.registerSystemCommands();
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): VoiceCommandService {
    if (!VoiceCommandService.instance) {
      VoiceCommandService.instance = new VoiceCommandService();
    }
    return VoiceCommandService.instance;
  }

  /**
   * Registra comandos del sistema que siempre están disponibles
   */
  private registerSystemCommands(): void {
    this.registerCommand({
      id: 'help',
      type: 'system',
      phrases: ['ayuda', 'comandos disponibles', 'qué puedo decir', 'mostrar comandos'],
      action: () => {
        const availableCommands = this.getAvailableCommands();
        this.emit('helpRequested', availableCommands);
      },
      description: 'Muestra la lista de comandos disponibles',
      context: ['global']
    });
  }

  /**
   * Registra un nuevo comando de voz
   */
  public registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
  }

  /**
   * Registra múltiples comandos de voz
   */
  public registerCommands(commands: VoiceCommand[]): void {
    commands.forEach(command => this.registerCommand(command));
    this.emit('commandsRegistered', commands);
  }

  /**
   * Elimina un comando registrado
   */
  public unregisterCommand(commandId: string): void {
    this.commands.delete(commandId);
  }

  /**
   * Elimina todos los comandos excepto los del sistema
   */
  public clearCommands(): void {
    // Guardar comandos del sistema
    const systemCommands = Array.from(this.commands.values())
      .filter(command => command.type === 'system');
    
    this.commands.clear();
    
    // Restaurar comandos del sistema
    systemCommands.forEach(command => this.registerCommand(command));
    
    this.emit('commandsCleared');
  }

  /**
   * Procesa el texto para identificar y ejecutar comandos
   */
  public processText(text: string): boolean {
    if (!this.isEnabled || !text) return false;
    
    const normalizedText = text.toLowerCase().trim();
    
    // Obtener los comandos disponibles en el contexto actual
    const availableCommands = this.getAvailableCommands();
    
    // Buscar coincidencias
    for (const command of availableCommands) {
      for (const phrase of command.phrases) {
        if (this.matchPhrase(normalizedText, phrase)) {
          command.action();
          this.emit('commandExecuted', command.id);
          return true;
        }
      }
    }
    
    this.emit('commandNotFound', normalizedText);
    return false;
  }

  /**
   * Verifica si un texto coincide con una frase de comando
   */
  private matchPhrase(text: string, phrase: string): boolean {
    // Coincidencia exacta
    if (text === phrase) return true;
    
    // Coincidencia por inclusión
    if (text.includes(phrase)) return true;
    
    // Coincidencia por similitud (podría implementarse con algoritmos como Levenshtein)
    // Por ahora, solo usamos coincidencias exactas o por inclusión
    
    return false;
  }

  /**
   * Establece el contexto actual para filtrar comandos
   */
  public setContext(context: string | string[]): void {
    this.currentContext = Array.isArray(context) 
      ? [...context, 'global'] 
      : [context, 'global'];
    
    this.emit('contextChanged', this.currentContext.join(', '));
  }

  /**
   * Añade un contexto a los contextos actuales
   */
  public addContext(context: string): void {
    if (!this.currentContext.includes(context)) {
      this.currentContext.push(context);
      this.emit('contextChanged', this.currentContext.join(', '));
    }
  }

  /**
   * Elimina un contexto de los contextos actuales
   */
  public removeContext(context: string): void {
    if (context === 'global') return; // No se puede eliminar el contexto global
    
    this.currentContext = this.currentContext.filter(c => c !== context);
    this.emit('contextChanged', this.currentContext.join(', '));
  }

  /**
   * Obtiene todos los comandos disponibles en el contexto actual
   */
  public getAvailableCommands(): VoiceCommand[] {
    return Array.from(this.commands.values())
      .filter(command => {
        // Si el comando no tiene contexto específico o está en el contexto actual
        return !command.context || 
               command.context.some(ctx => this.currentContext.includes(ctx));
      });
  }

  /**
   * Habilita o deshabilita el procesamiento de comandos
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Indica si el procesamiento de comandos está habilitado
   */
  public isCommandProcessingEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Establece el umbral de sensibilidad para coincidencia de comandos
   */
  public setSensitivityThreshold(threshold: number): void {
    this.sensitivityThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Sobreescribe el método on para proporcionar autocompletado de tipos
   */
  public override on<K extends keyof VoiceCommandEvents>(
    event: K, 
    listener: VoiceCommandEvents[K]
  ): this {
    return super.on(event, listener);
  }

  /**
   * Sobreescribe el método emit para proporcionar autocompletado de tipos
   */
  public override emit<K extends keyof VoiceCommandEvents>(
    event: K,
    ...args: Parameters<VoiceCommandEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
} 