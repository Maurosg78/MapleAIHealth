// response.config.js - Configuración del sistema de respuestas

const config = {
  // Umbral de confianza para respuestas automáticas
  autoThreshold: 0.8,

  // Máximo número de consultas thinking consecutivas permitidas
  maxConsecutiveThinking: 3,

  // Configuración de modos
  modes: {
    auto: {
      maxQueryLength: 1000,
      maxResponseTime: 5000, // ms
      minConfidence: 0.6
    },
    thinking: {
      maxConsecutive: 3
    }
  },

  // Patrones personalizables
  patterns: {
    // Puedes añadir o modificar patrones aquí
    basic: [
      /^(gracias|thanks)/i,
      /^(ok|okay|vale)$/i,
      /^(sí|si|no)$/i
    ],
    technical: [
      /error.*en/i,
      /problema.*con/i,
      /cómo.*(\?|$)/i
    ]
  },

  // Configuración de logging
  logging: {
    enabled: true,
    level: 'info',
    includeTimestamp: true
  },

  // Respuestas predefinidas
  responses: {
    greetings: {
      morning: '¡Buenos días! ¿En qué puedo ayudarte?',
      afternoon: '¡Buenas tardes! ¿En qué puedo ayudarte?',
      evening: '¡Buenas noches! ¿En qué puedo ayudarte?'
    },
    farewell: {
      default: '¡Hasta luego! No dudes en volver si necesitas ayuda',
      success: '¡Me alegro de haber podido ayudarte! ¡Hasta pronto!'
    },
    error: {
      default: 'Lo siento, no pude procesar tu solicitud. ¿Podrías reformularla?',
      technical: 'Parece que necesitas ayuda técnica. Permíteme analizar tu consulta con más detalle.'
    }
  },

  github: {
    owner: 'Maurosg78',
    repo: 'MapleAIHealth',
    token: process.env.GITHUB_TOKEN || '',
    baseUrl: 'https://api.github.com',
    priorityIssues: ['179'], // Añadir prioridad para el issue del Dashboard
    labels: {
      pending: '⚪ Pendiente',
      inProgress: '🔄 En Progreso',
      completed: '✅ Completado'
    }
  }
};

export default config; 