/**
 * Ejercicios terapéuticos específicos para fisioterapia
 * Adaptados a la práctica clínica en España
 */

import { SpanishTherapeuticExercise } from '../types/spanishPhysiotherapyTypes';;;;;

/**
 * Ejercicios terapéuticos para región cervical
 */
export const ejerciciosCervicales: SpanishTherapeuticExercise[] = [
  {
    nombre: "Ejercicio de retracción cervical",
    región: "Cervical",
    descripción: "Ejercicio de reeducación postural para corregir la posición adelantada de cabeza",
    ejecución: [
      "Sentado con la espalda apoyada",
      "Llevar la barbilla hacia atrás manteniendo la mirada al frente",
      "Mantener la posición y volver a la posición inicial"
    ],
    dosificación: {
      series: 3,
      repeticiones: 10,
      tiempo: "Mantener 5-10 segundos",
      frecuencia: "2-3 veces al día",
      progresión: "Aumentar tiempo de mantenimiento"
    },
    advertencias: [
      "No llevar la cabeza hacia atrás (extensión)",
      "Evitar tensión excesiva en la zona posterior"
    ],
    objetivos: [
      "Mejorar postura cervical",
      "Reducir tensión muscular en trapecios",
      "Prevenir cefaleas de origen cervical"
    ]
  },
  {
    nombre: "Isométricos cervicales",
    región: "Cervical",
    descripción: "Contracciones isométricas de la musculatura cervical",
    ejecución: [
      "Colocar la mano en la región frontal/lateral/posterior de la cabeza",
      "Hacer fuerza contra la resistencia de la mano sin permitir movimiento",
      "Mantener la contracción y relajar"
    ],
    dosificación: {
      series: 2,
      repeticiones: 5,
      tiempo: "Mantener 5-10 segundos",
      frecuencia: "1-2 veces al día",
      progresión: "Aumentar tiempo de mantenimiento y series"
    },
    advertencias: [
      "No realizar en caso de mareos o vértigos",
      "Intensidad moderada, sin provocar dolor"
    ],
    objetivos: [
      "Fortalecer musculatura cervical",
      "Mejorar estabilidad",
      "Reducir dolor"
    ]
  }
];

/**
 * Ejercicios terapéuticos para columna lumbar
 */
export const ejerciciosLumbares: SpanishTherapeuticExercise[] = [
  {
    nombre: "Báscula pélvica",
    región: "Lumbar",
    descripción: "Movimiento de anteversión y retroversión pélvica para mejorar control motor",
    ejecución: [
      "Acostado boca arriba con rodillas flexionadas",
      "Bascular la pelvis aplanando la zona lumbar contra el suelo",
      "Mantener la posición y volver a la posición inicial"
    ],
    dosificación: {
      series: 3,
      repeticiones: 10,
      tiempo: "Mantener 5 segundos",
      frecuencia: "2-3 veces al día",
      progresión: "Realizar en sedestación y bipedestación"
    },
    advertencias: [
      "No contener la respiración",
      "No forzar el movimiento"
    ],
    mediosMateriales: ["Esterilla o superficie firme"],
    objetivos: [
      "Mejorar control motor lumbo-pélvico",
      "Reducir hiperlordosis",
      "Activar transverso abdominal"
    ]
  },
  {
    nombre: "Puente glúteo",
    región: "Lumbar",
    descripción: "Elevación de pelvis para fortalecer core y glúteos",
    ejecución: [
      "Acostado boca arriba con rodillas flexionadas",
      "Elevar la pelvis manteniendo alineación",
      "Mantener la posición y descender controladamente"
    ],
    dosificación: {
      series: 3,
      repeticiones: 10,
      tiempo: "Mantener 5 segundos",
      frecuencia: "Diaria",
      progresión: "Realizar con una sola pierna"
    },
    advertencias: [
      "No arquear excesivamente la zona lumbar",
      "Mantener control abdominal"
    ],
    objetivos: [
      "Fortalecer glúteos y core",
      "Estabilizar región lumbo-pélvica",
      "Mejorar disociación lumbo-pélvica"
    ],
    variantes: [
      {
        nombre: "Puente con apoyo monopodal",
        descripción: "Elevar una pierna extendida mientras se mantiene el puente",
        indicación: "Aumentar dificultad y trabajo estabilizador"
      }
    ]
  }
];

/**
 * Ejercicios terapéuticos para hombro
 */
export const ejerciciosHombro: SpanishTherapeuticExercise[] = [
  {
    nombre: "Ejercicios pendulares de Codman",
    región: "Hombro",
    descripción: "Movimientos pendulares para descomprimir el espacio subacromial",
    ejecución: [
      "De pie con ligera flexión de tronco y apoyo en una mesa",
      "Dejar colgar el brazo afectado",
      "Realizar movimientos circulares, hacia delante-atrás y laterales"
    ],
    dosificación: {
      series: 1,
      repeticiones: 20,
      tiempo: "1-2 minutos por movimiento",
      frecuencia: "3-4 veces al día",
      progresión: "Añadir peso ligero en la mano"
    },
    advertencias: [
      "Movimientos suaves y sin dolor",
      "No forzar amplitud"
    ],
    mediosMateriales: ["Peso ligero opcional (0.5-1kg)"],
    objetivos: [
      "Reducir dolor",
      "Mantener movilidad pasiva",
      "Descomprimir articulación"
    ]
  },
  {
    nombre: "Escalera de dedos",
    región: "Hombro",
    descripción: "Ejercicio para ganar amplitud de movimiento en flexión y abducción",
    ejecución: [
      "De pie frente a una pared",
      "Caminar con los dedos hacia arriba por la pared",
      "Llegar hasta el punto de inicio de dolor y mantener"
    ],
    dosificación: {
      series: 3,
      repeticiones: 5,
      tiempo: "Mantener 10 segundos",
      frecuencia: "2 veces al día",
      progresión: "Aumentar altura alcanzada"
    },
    advertencias: [
      "No superar el umbral de dolor",
      "Evitar compensaciones con tronco"
    ],
    objetivos: [
      "Aumentar rango articular",
      "Estiramiento controlado",
      "Mejorar funcionalidad"
    ]
  }
];

/**
 * Ejercicios terapéuticos para rodilla
 */
export const ejerciciosRodilla: SpanishTherapeuticExercise[] = [
  {
    nombre: "Isométricos de cuádriceps",
    región: "Rodilla",
    descripción: "Contracción estática del cuádriceps para fortalecer sin carga articular",
    ejecución: [
      "Sentado con la pierna extendida",
      "Contraer el cuádriceps presionando la rodilla contra la camilla",
      "Mantener contracción y relajar"
    ],
    dosificación: {
      series: 3,
      repeticiones: 10,
      tiempo: "Mantener 5-10 segundos",
      frecuencia: "3 veces al día",
      progresión: "Añadir resistencia con banda elástica"
    },
    advertencias: [
      "No contener la respiración",
      "Evitar hiperextensión de rodilla"
    ],
    objetivos: [
      "Fortalecer cuádriceps sin carga",
      "Activar vasto interno",
      "Reducir atrofia post-lesión"
    ]
  },
  {
    nombre: "Sentadilla parcial controlada",
    región: "Rodilla",
    descripción: "Flexo-extensión parcial de rodilla en carga",
    ejecución: [
      "De pie, con pies separados a la anchura de caderas",
      "Flexionar rodillas hasta 30-45° máximo",
      "Volver a la posición inicial controladamente"
    ],
    dosificación: {
      series: 3,
      repeticiones: 10,
      tiempo: "Movimiento controlado",
      frecuencia: "Días alternos",
      progresión: "Aumentar flexión hasta 60-90°"
    },
    advertencias: [
      "Rodillas no deben sobrepasar la punta de los pies",
      "Mantener espalda recta",
      "No realizar en fase aguda de lesión"
    ],
    mediosMateriales: ["Apoyo en pared o silla opcional"],
    objetivos: [
      "Fortalecer musculatura de miembro inferior",
      "Mejorar control propioceptivo",
      "Aumentar resistencia muscular"
    ]
  }
];

/**
 * Ejercicios terapéuticos para tobillo
 */
export const ejerciciosTobillo: SpanishTherapeuticExercise[] = [
  {
    nombre: "Círculos de tobillo",
    región: "Tobillo",
    descripción: "Movilización activa en circunducción del tobillo",
    ejecución: [
      "Sentado con la pierna elevada",
      "Realizar movimientos circulares con el pie",
      "Cambiar dirección tras completar las repeticiones"
    ],
    dosificación: {
      series: 2,
      repeticiones: 10,
      tiempo: "Movimiento lento y controlado",
      frecuencia: "3-4 veces al día",
      progresión: "Aumentar amplitud del movimiento"
    },
    advertencias: [
      "No forzar si produce dolor agudo",
      "Evitar movimientos bruscos"
    ],
    objetivos: [
      "Mejorar movilidad articular",
      "Reducir edema",
      "Activar bomba muscular"
    ]
  },
  {
    nombre: "Ejercicio propioceptivo unipodal",
    región: "Tobillo",
    descripción: "Entrenamiento de equilibrio sobre una pierna",
    ejecución: [
      "Mantener equilibrio sobre un pie",
      "Intentar minimizar las oscilaciones",
      "Mantener posición con pequeñas correcciones"
    ],
    dosificación: {
      series: 3,
      repeticiones: 1,
      tiempo: "Mantener 30 segundos",
      frecuencia: "Diaria",
      progresión: "Cerrar ojos o superficie inestable"
    },
    advertencias: [
      "Tener punto de apoyo cercano por seguridad",
      "Evitar en fase aguda de lesión"
    ],
    mediosMateriales: ["Opcional: bosu, disco propioceptivo"],
    objetivos: [
      "Mejorar propiocepción",
      "Prevenir esguinces recidivantes",
      "Aumentar estabilidad articular"
    ],
    variantes: [
      {
        nombre: "Propioceptivo dinámico",
        descripción: "Realizar pequeños movimientos controlados mientras se mantiene el equilibrio",
        indicación: "Fase avanzada de rehabilitación"
      }
    ]
  }
];

/**
 * Ejercicios de suelo pélvico
 */
export const ejerciciosSueloPelvico: SpanishTherapeuticExercise[] = [
  {
    nombre: "Ejercicios de Kegel",
    región: "Suelo pélvico",
    descripción: "Contracciones de la musculatura del suelo pélvico",
    ejecución: [
      "Acostado boca arriba con piernas flexionadas",
      "Contraer la musculatura como si quisiera retener la orina",
      "Mantener la contracción y relajar completamente"
    ],
    dosificación: {
      series: 3,
      repeticiones: 10,
      tiempo: "Mantener 5 segundos",
      frecuencia: "2-3 veces al día",
      progresión: "Aumentar tiempo de contracción a 10 segundos"
    },
    advertencias: [
      "No contraer abdomen, glúteos o aductores",
      "No contener la respiración",
      "Asegurar relajación completa entre repeticiones"
    ],
    objetivos: [
      "Fortalecer musculatura del suelo pélvico",
      "Prevenir incontinencia",
      "Mejorar control muscular"
    ]
  }
];

/**
 * Ejercicios de fisioterapia respiratoria
 */
export const ejerciciosRespiratorios: SpanishTherapeuticExercise[] = [
  {
    nombre: "Respiración diafragmática",
    región: "Tórax/Abdomen",
    descripción: "Técnica de respiración para potenciar el diafragma",
    ejecución: [
      "Acostado boca arriba con rodillas flexionadas",
      "Colocar una mano en el pecho y otra en el abdomen",
      "Inspirar lentamente por la nariz elevando el abdomen",
      "Espirar lentamente por la boca hundiendo el abdomen"
    ],
    dosificación: {
      series: 2,
      repeticiones: 10,
      tiempo: "Respiraciones lentas (3-4 segundos cada fase)",
      frecuencia: "3 veces al día",
      progresión: "Realizar en sedestación y bipedestación"
    },
    advertencias: [
      "No elevar el pecho durante la inspiración",
      "No forzar la capacidad pulmonar"
    ],
    objetivos: [
      "Mejorar ventilación pulmonar",
      "Reducir frecuencia respiratoria",
      "Potenciar uso del diafragma"
    ]
  },
  {
    nombre: "Expansiones costales selectivas",
    región: "Tórax",
    descripción: "Técnica para mejorar la expansión torácica localizada",
    ejecución: [
      "Sentado con espalda recta",
      "Colocar las manos en la zona costal a trabajar",
      "Inspirar dirigiendo el aire hacia las manos",
      "Espirar lentamente"
    ],
    dosificación: {
      series: 2,
      repeticiones: 5,
      tiempo: "Respiraciones lentas y profundas",
      frecuencia: "2 veces al día",
      progresión: "Añadir resistencia manual ligera"
    },
    objetivos: [
      "Mejorar expansión torácica",
      "Prevenir adherencias pleurales",
      "Favorecer ventilación de zonas específicas"
    ]
  }
];

/**
 * Mapa de códigos CIE-10 a ejercicios terapéuticos
 */
type CIE10ExerciseMap = Record<string, SpanishTherapeuticExercise[]>;

/**
 * Obtiene ejercicios recomendados según patología
 * @param codigoCIE10 Código diagnóstico CIE-10
 * @returns Ejercicios recomendados para la patología
 */
export function obtenerEjerciciosPorPatologia(codigoCIE10: string): SpanishTherapeuticExercise[] {
  const mapaCIE10Ejercicios: CIE10ExerciseMap = {
    // Códigos cervicales
    'M54.2': ejerciciosCervicales,
    'M50.1': ejerciciosCervicales,
    
    // Códigos lumbares
    'M54.5': ejerciciosLumbares,
    'M51.1': ejerciciosLumbares,
    
    // Códigos de hombro
    'M75.1': ejerciciosHombro,
    'M75.0': ejerciciosHombro,
    
    // Códigos de rodilla
    'M17.0': ejerciciosRodilla,
    'M23.2': ejerciciosRodilla,
    
    // Códigos de tobillo
    'S93.4': ejerciciosTobillo,
    
    // Códigos de suelo pélvico
    'N39.3': ejerciciosSueloPelvico,
    'N81.8': ejerciciosSueloPelvico,
    
    // Códigos respiratorios
    'J44.9': ejerciciosRespiratorios,
    'J45.9': ejerciciosRespiratorios
  };
  
  const ejercicios = mapaCIE10Ejercicios[codigoCIE10 as keyof typeof mapaCIE10Ejercicios];
  
  if (ejercicios) {
    return ejercicios;
  }
  
  return [];
} 