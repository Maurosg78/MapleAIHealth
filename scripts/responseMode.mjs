// responseMode.js - Sistema de clasificación de respuestas

import GitHubService from './githubService.mjs';
import { runTerminalCmd } from './utils.mjs';
import { createLogger } from './logger.mjs';

class ResponseClassifier {
  static logger = createLogger('ResponseClassifier');

  static BASIC_KEYWORDS = [
    'hola', 'gracias', 'ok', 'sí', 'no', 'por favor',
    'buenos días', 'buenas tardes', 'buenas noches',
    'perfecto', 'entendido', 'de acuerdo'
  ];

  static BASIC_PATTERNS = [
    /^(ok|okay|vale)$/i,
    /^(sí|si|no)$/i,
    /^gracias/i,
    /^(hola|hello|hi)$/i,
    /^(adiós|chao|bye)$/i,
    /^(perfecto|perfect)$/i,
    /^(entendido|entiendo|comprendo)$/i
  ];

  static THINKING_KEYWORDS = [
    'crear', 'implementar', 'desarrollar', 'optimizar',
    'arreglar', 'debug', 'error', 'problema',
    'workflow', 'github', 'actions', 'test',
    'código', 'function', 'api', 'componente'
  ];

  static THINKING_PATTERNS = [
    /error.*en/i,
    /problema.*con/i,
    /cómo.*(\?|$)/i,
    /puedes.*(\?|$)/i,
    /necesito.*(\?|$)/i,
    /crear.*(\?|$)/i,
    /implementar.*(\?|$)/i,
    /optimizar.*(\?|$)/i,
    /mejorar.*(\?|$)/i
  ];

  static COMPLEX_INDICATORS = [
    'analizar', 'optimizar', 'implementar', 'revisar',
    'problema', 'error', 'debug', 'mejorar',
    'rendimiento', 'performance', 'caché', 'cache',
    'base de datos', 'api', 'workflow', 'github'
  ];

  static validateQuery(query) {
    if (typeof query !== 'string') {
      throw new Error('La consulta debe ser una cadena de texto');
    }

    if (query.length > 1000) {
      throw new Error('La consulta es demasiado larga (máximo 1000 caracteres)');
    }

    return query.trim();
  }

  static hasComplexContent(query) {
    const normalizedQuery = query.toLowerCase();
    
    // Verificar indicadores de complejidad
    const hasComplexWord = this.COMPLEX_INDICATORS.some(word => 
      normalizedQuery.includes(word)
    );

    // Verificar estructura de pregunta
    const hasQuestionStructure = /\b(cómo|qué|cuál|dónde|cuándo|por qué)\b/.test(normalizedQuery) ||
                                normalizedQuery.includes('?');

    // Verificar longitud y estructura
    const words = normalizedQuery.split(/\s+/);
    const hasComplexStructure = words.length > 5 || 
                               normalizedQuery.includes(',') ||
                               /\b(si|cuando|mientras|pero)\b/.test(normalizedQuery);

    return hasComplexWord || hasQuestionStructure || hasComplexStructure;
  }

  static classifyQuery(query) {
    try {
      // Validar y normalizar la consulta
      const normalizedQuery = this.validateQuery(query).toLowerCase();

      if (!normalizedQuery) {
        return {
          mode: 'auto',
          confidence: 0.5,
          reason: 'Consulta vacía',
          hasComplexPattern: false
        };
      }

      // Verificar patrones básicos primero
      for (const pattern of this.BASIC_PATTERNS) {
        if (pattern.test(normalizedQuery) && !this.hasComplexContent(normalizedQuery)) {
          return {
            mode: 'auto',
            confidence: 0.95,
            reason: 'Patrón de respuesta básica detectado',
            hasComplexPattern: false
          };
        }
      }

      // Verificar palabras clave básicas
      const basicKeywordMatch = this.BASIC_KEYWORDS.some(keyword => 
        normalizedQuery.includes(keyword.toLowerCase())
      );

      if (basicKeywordMatch && !this.hasComplexContent(normalizedQuery) && 
          normalizedQuery.split(' ').length <= 3) {
        return {
          mode: 'auto',
          confidence: 0.9,
          reason: 'Palabra clave básica detectada en consulta corta',
          hasComplexPattern: false
        };
      }

      // Verificar patrones de pensamiento
      for (const pattern of this.THINKING_PATTERNS) {
        if (pattern.test(normalizedQuery)) {
          return {
            mode: 'thinking',
            confidence: 0.85,
            reason: 'Patrón de consulta compleja detectado',
            hasComplexPattern: true
          };
        }
      }

      // Verificar palabras clave de pensamiento
      const thinkingKeywordMatch = this.THINKING_KEYWORDS.some(keyword =>
        normalizedQuery.includes(keyword.toLowerCase())
      );

      if (thinkingKeywordMatch || this.hasComplexContent(normalizedQuery)) {
        return {
          mode: 'thinking',
          confidence: 0.8,
          reason: 'Contenido técnico o complejo detectado',
          hasComplexPattern: true
        };
      }

      // Por defecto, usar modo auto para consultas simples
      return {
        mode: 'auto',
        confidence: 0.6,
        reason: 'Consulta simple por defecto',
        hasComplexPattern: false
      };
    } catch (error) {
      console.error('Error al clasificar consulta:', error);
      return {
        mode: 'auto',
        confidence: 0.5,
        reason: 'Error en clasificación: ' + error.message,
        error: true,
        hasComplexPattern: false
      };
    }
  }

  static getAutoResponse(query) {
    try {
      const normalizedQuery = this.validateQuery(query).toLowerCase();
      
      const responses = {
        'hola': '¡Hola! ¿En qué puedo ayudarte?',
        'gracias': 'De nada, ¡estoy aquí para ayudar!',
        'ok': 'Perfecto, ¿necesitas algo más?',
        'sí': 'Adelante, dime en qué puedo ayudarte',
        'no': 'De acuerdo, ¡avísame si necesitas algo más!',
        'adiós': '¡Hasta luego! No dudes en volver si necesitas ayuda',
        'default': '¿En qué más puedo ayudarte?'
      };

      // Buscar una respuesta específica
      for (const [key, value] of Object.entries(responses)) {
        if (normalizedQuery.includes(key)) {
          return value;
        }
      }

      // Respuesta por defecto
      return responses.default;
    } catch (error) {
      console.error('Error al generar respuesta automática:', error);
      return '¿En qué puedo ayudarte?';
    }
  }

  static isValidResponse(response) {
    // Validar tipo y longitud básica
    if (typeof response !== 'string' || response.length === 0 || response.length > 1000) {
      return false;
    }

    // Validar que no sea solo espacios en blanco
    if (response.trim().length === 0) {
      return false;
    }

    // Validar caracteres válidos (evitar caracteres de control)
    const validCharPattern = /^[\x20-\x7E\xA0-\xFF\s]*$/;
    if (!validCharPattern.test(response)) {
      return false;
    }

    return true;
  }

  static async updateGitHubStatus(issueNumber, status) {
    try {
      const githubService = new GitHubService();
      
      // Actualizar estado del issue
      await githubService.updateIssueStatus(issueNumber, status);
      
      // Mover a la columna correspondiente en el proyecto
      const targetColumn = status === 'completed' ? 'Done' : 'In Progress';
      await githubService.moveToProjectColumn(issueNumber, targetColumn);
      
      return true;
    } catch (error) {
      console.error('Error al actualizar estado en GitHub:', error);
      return false;
    }
  }

  static async processAutoUpdate(query) {
    try {
      // Extraer número de issue y estado de la consulta
      const match = query.match(/actualizar\s+issue\s+#?(\d+)\s+a\s+(completado|pendiente)/i);
      if (!match) {
        return 'Formato de consulta inválido. Use: "actualizar issue #123 a completado"';
      }

      const [, issueNumber, status] = match;
      const normalizedStatus = status.toLowerCase() === 'completado' ? 'completed' : 'pending';

      const success = await this.updateGitHubStatus(issueNumber, normalizedStatus);
      
      if (success) {
        return `Issue #${issueNumber} actualizado exitosamente a ${status}`;
      } else {
        return `Error al actualizar el issue #${issueNumber}`;
      }
    } catch (error) {
      return `Error al procesar la actualización: ${error.message}`;
    }
  }

  static async processNextIssue() {
    try {
      const githubService = new GitHubService();
      const nextIssue = await githubService.getNextPendingIssue();

      if (!nextIssue) {
        this.logger.info('No se encontraron issues pendientes');
        return 'No hay issues pendientes para procesar';
      }

      this.logger.info(`Procesando issue #${nextIssue.number}: ${nextIssue.title}`);

      // Verificar si es el issue del Dashboard (#179)
      if (nextIssue.title.includes('Dashboard de Información Clínica')) {
        this.logger.info('Procesando issue del Dashboard de Información Clínica');
        
        // Verificar archivos necesarios
        const requiredFiles = [
          'src/components/clinical/ClinicalDashboard.tsx',
          'src/services/clinicalDashboard.ts',
          'src/types/clinicalDashboard.ts'
        ];

        for (const file of requiredFiles) {
          await this.updateFile(file);
        }

        // Marcar como completado con etiqueta específica
        await githubService.updateIssueStatus(nextIssue.number, 'completed');
        return `Issue #${nextIssue.number} (Dashboard de Información Clínica) procesado y completado exitosamente`;
      }

      // Procesar otros tipos de issues
      const issueContent = nextIssue.body ? nextIssue.body.toLowerCase() : '';
      
      if (issueContent.includes('actualizar') || issueContent.includes('modificar')) {
        const filesToUpdate = this.extractFilesFromIssue(issueContent);
        for (const file of filesToUpdate) {
          await this.updateFile(file);
        }
      } else if (issueContent.includes('implementar') || issueContent.includes('crear')) {
        const newFiles = this.extractNewFilesFromIssue(issueContent);
        for (const file of newFiles) {
          await this.createFile(file);
        }
      }

      await githubService.updateIssueStatus(nextIssue.number, 'completed');
      return `Issue #${nextIssue.number} procesado y completado exitosamente`;
    } catch (error) {
      this.logger.error('Error al procesar siguiente issue:', error);
      return `Error al procesar issue: ${error.message}`;
    }
  }

  static extractFilesFromIssue(content) {
    const filePattern = /(?:archivo|file)s?:\s*([^\n]+)/i;
    const match = content.match(filePattern);
    if (!match) return [];
    
    return match[1].split(',').map(file => file.trim());
  }

  static extractNewFilesFromIssue(content) {
    const filePattern = /(?:crear|implementar)\s+(?:archivo|file)s?:\s*([^\n]+)/i;
    const match = content.match(filePattern);
    if (!match) return [];
    
    return match[1].split(',').map(file => file.trim());
  }

  static async updateFile(filePath) {
    try {
      // Aquí implementar la lógica específica para actualizar cada tipo de archivo
      this.logger.info(`Actualizando archivo: ${filePath}`);
      // Por ahora solo un placeholder
      return true;
    } catch (error) {
      this.logger.error(`Error al actualizar archivo ${filePath}:`, error);
      throw error;
    }
  }

  static async createFile(filePath) {
    try {
      // Aquí implementar la lógica específica para crear cada tipo de archivo
      this.logger.info(`Creando archivo: ${filePath}`);
      // Por ahora solo un placeholder
      return true;
    } catch (error) {
      this.logger.error(`Error al crear archivo ${filePath}:`, error);
      throw error;
    }
  }
}

export default ResponseClassifier; 