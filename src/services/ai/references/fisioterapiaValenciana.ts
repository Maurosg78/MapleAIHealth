/**
 * Referencias específicas de fisioterapia para la Comunidad Valenciana
 * Incluye códigos diagnósticos, protocolos y documentación relevante
 * Adaptado al sistema sanitario valenciano
 */

import { SpanishPhysiotherapyTechnique } from '../types/spanishPhysiotherapyTypes';

/**
 * Códigos CIE-10 más comunes en fisioterapia en la Comunidad Valenciana
 */
export const codigosCIE10Valencianos = {
  columna: {
    'M54.2': 'Cervicalgia',
    'M54.5': 'Lumbalgia',
    'M51.1': 'Trastorno de disco lumbar con radiculopatía',
    'M50.1': 'Trastorno de disco cervical con radiculopatía',
    'M47.2': 'Espondilosis con radiculopatía',
    'M43.1': 'Espondilolistesis',
    'M48.0': 'Estenosis del conducto vertebral'
  },
  extremidadSuperior: {
    'M75.1': 'Síndrome del manguito rotador',
    'M75.0': 'Capsulitis adhesiva del hombro',
    'M77.1': 'Epicondilitis lateral',
    'M77.0': 'Epicondilitis medial',
    'G56.0': 'Síndrome del túnel carpiano',
    'M18.0': 'Artrosis primaria de la primera articulación carpometacarpiana',
    'S52.5': 'Fractura de la epífisis inferior del radio'
  },
  extremidadInferior: {
    'M17.0': 'Gonartrosis primaria bilateral',
    'M23.2': 'Trastorno de menisco debido a desgarro o lesión antigua',
    'M76.5': 'Tendinitis rotuliana',
    'M76.6': 'Tendinitis aquílea',
    'M76.3': 'Síndrome de la cintilla iliotibial',
    'M70.6': 'Bursitis trocantérea',
    'S83.5': 'Esguince del ligamento cruzado de la rodilla'
  },
  neurológico: {
    'G81.9': 'Hemiplejía, no especificada',
    'G82.2': 'Paraplejía, no especificada',
    'G35': 'Esclerosis múltiple',
    'G20': 'Enfermedad de Parkinson',
    'I69.3': 'Secuelas de infarto cerebral',
    'G61.0': 'Síndrome de Guillain-Barré',
    'G71.0': 'Distrofia muscular'
  },
  respiratorio: {
    'J44.9': 'EPOC, no especificada',
    'J45.9': 'Asma, no especificada',
    'J96.0': 'Insuficiencia respiratoria aguda',
    'J98.6': 'Trastornos del diafragma',
    'J47': 'Bronquiectasia'
  },
  pediátrico: {
    'Q65.0': 'Luxación congénita de la cadera, unilateral',
    'G80.1': 'Parálisis cerebral espástica dipléjica',
    'G80.2': 'Parálisis cerebral espástica hemipléjica',
    'M41.1': 'Escoliosis idiopática juvenil',
    'F82': 'Trastorno específico del desarrollo motor'
  }
};

/**
 * Técnicas de fisioterapia más utilizadas en la Comunidad Valenciana
 */
export const tecnicasFisioterapiaValencianas = [
  {
    nombre: SpanishPhysiotherapyTechnique.ARTICULAR_MOBILIZATION,
    descripcion: 'Técnicas de movilización articular para recuperar el rango de movimiento',
    indicaciones: ['Limitación de movilidad articular', 'Rigidez post-traumática', 'Artrosis en fase no aguda']
  },
  {
    nombre: SpanishPhysiotherapyTechnique.MYOFASCIAL,
    descripcion: 'Liberación miofascial para tratar restricciones del tejido conectivo',
    indicaciones: ['Dolor miofascial', 'Puntos gatillo', 'Fibrosis post-quirúrgica']
  },
  {
    nombre: SpanishPhysiotherapyTechnique.DRY_NEEDLING,
    descripcion: 'Técnica invasiva con aguja seca para puntos gatillo miofasciales',
    indicaciones: ['Dolor miofascial crónico', 'Puntos gatillo activos', 'Contracturas persistentes']
  },
  {
    nombre: SpanishPhysiotherapyTechnique.THERAPEUTIC_EXERCISE,
    descripcion: 'Programa de ejercicios terapéuticos individualizados',
    indicaciones: ['Rehabilitación post-lesión', 'Fortalecimiento muscular', 'Mejora de la estabilidad']
  },
  {
    nombre: SpanishPhysiotherapyTechnique.GLOBAL_POSTURAL,
    descripcion: 'Reeducación postural global para corregir desequilibrios musculares',
    indicaciones: ['Alteraciones posturales', 'Escoliosis', 'Desequilibrios musculares']
  },
  {
    nombre: SpanishPhysiotherapyTechnique.RESPIRATORY,
    descripcion: 'Técnicas de fisioterapia respiratoria para mejorar la ventilación',
    indicaciones: ['EPOC', 'Fibrosis quística', 'Post-operatorio torácico', 'Bronquiectasias']
  },
  {
    nombre: SpanishPhysiotherapyTechnique.ELECTROTHERAPY,
    descripcion: 'Aplicación de corrientes eléctricas con fines terapéuticos',
    indicaciones: ['Dolor crónico', 'Estimulación muscular', 'Procesos inflamatorios subagudos']
  },
  {
    nombre: SpanishPhysiotherapyTechnique.PELVIC_FLOOR,
    descripcion: 'Reeducación de la musculatura del suelo pélvico',
    indicaciones: ['Incontinencia urinaria', 'Post-parto', 'Prolapsos']
  }
];

/**
 * Protocolos específicos de la Comunidad Valenciana
 */
export const protocolosValencianos = {
  atencionPrimaria: {
    descripcion: 'Protocolos de derivación a fisioterapia desde atención primaria',
    procesoDerivaciónAP: [
      'El médico de atención primaria evalúa al paciente',
      'Realiza derivación mediante interconsulta electrónica (SIA)',
      'El fisioterapeuta valora la prioridad según criterios establecidos',
      'Se asigna cita según disponibilidad y prioridad',
      'Se informa al paciente por vía telefónica o SMS'
    ],
    criterioPriorización: [
      'Alta: procesos agudos con riesgo de secuelas permanentes',
      'Media: procesos subagudos con limitación funcional significativa',
      'Baja: procesos crónicos estables'
    ],
    patologíasIncluidas: [
      'Cervicalgia/cervicobraquialgia mecánica',
      'Lumbalgia/lumbociática mecánica',
      'Hombro doloroso de origen mecánico',
      'Gonartrosis leve-moderada',
      'Esguinces no complicados',
      'EPOC estable para fisioterapia respiratoria'
    ],
    limitacionesSesiones: {
      estandar: 15,
      máximo: 20,
      excepciones: 'Previa valoración del equipo de rehabilitación'
    }
  },
  hospitalario: {
    descripcion: 'Protocolos de fisioterapia hospitalaria',
    áreas: [
      'Rehabilitación neurológica',
      'Rehabilitación cardiorrespiratoria',
      'Rehabilitación traumatológica',
      'Rehabilitación pediátrica',
      'Fisioterapia en UCI'
    ],
    derivación: 'Únicamente a través de médico rehabilitador o especialista',
    priorización: 'Según valoración del servicio de rehabilitación',
    coordinación: 'Sistema HCDSNS (Historia Clínica Digital del Sistema Nacional de Salud)'
  },
  especializado: {
    descripcion: 'Unidades especializadas de fisioterapia',
    unidades: [
      {
        nombre: 'Unidad de Suelo Pélvico',
        centros: ['Hospital La Fe', 'Hospital General de Valencia', 'Hospital de San Juan'],
        acceso: 'Derivación por ginecología, urología o rehabilitación'
      },
      {
        nombre: 'Unidad de Fisioterapia Respiratoria',
        centros: ['Hospital La Fe', 'Hospital Clínico', 'Hospital Doctor Peset'],
        acceso: 'Derivación por neumología o rehabilitación'
      },
      {
        nombre: 'Unidad de Rehabilitación Cardiaca',
        centros: ['Hospital La Fe', 'Hospital General de Alicante'],
        acceso: 'Derivación por cardiología'
      },
      {
        nombre: 'Unidad de Linfedema',
        centros: ['Hospital Clínico de Valencia', 'Hospital General de Castellón'],
        acceso: 'Derivación por oncología, cirugía o rehabilitación'
      }
    ]
  }
};

/**
 * Documentación clínica requerida según normativa valenciana
 */
export const documentaciónClínicaValenciana = {
  documentosObligatorios: [
    'Historia clínica fisioterapéutica',
    'Consentimiento informado (para técnicas invasivas)',
    'Informe de alta',
    'Registro de sesiones'
  ],
  normativaAplicable: [
    'Ley 10/2014, de 29 de diciembre, de Salud de la Comunidad Valenciana',
    'Decreto 56/1988, de 25 de abril, del Consell de la Generalitat Valenciana',
    'Ley 41/2002, de 14 de noviembre, reguladora de la autonomía del paciente'
  ],
  plazoConservación: '5 años mínimo según normativa autonómica',
  formatoDigital: 'Sistema SIA (Sistema de Información Ambulatoria) para centros públicos'
};

/**
 * Escalas validadas de uso común en fisioterapia valenciana
 */
export const escalasValidadasValencianas = [
  {
    nombre: 'Escala Visual Analógica (EVA)',
    uso: 'Valoración del dolor',
    rango: '0-10',
    interpretación: '0: sin dolor, 10: máximo dolor imaginable'
  },
  {
    nombre: 'Índice de Discapacidad de Oswestry',
    uso: 'Valoración funcional en lumbalgia',
    rango: '0-100%',
    interpretación: '0-20%: mínima, 21-40%: moderada, 41-60%: intensa, 61-80%: discapacidad, >80%: máxima'
  },
  {
    nombre: 'Índice de Discapacidad Cervical (NDI)',
    uso: 'Valoración funcional en cervicalgia',
    rango: '0-50 puntos',
    interpretación: '0-4: sin discapacidad, 5-14: leve, 15-24: moderada, 25-34: grave, >35: completa'
  },
  {
    nombre: 'Escala de Constant-Murley',
    uso: 'Valoración funcional del hombro',
    rango: '0-100 puntos',
    interpretación: '>90: excelente, 80-89: bueno, 70-79: medio, <70: pobre'
  },
  {
    nombre: 'Escala WOMAC',
    uso: 'Valoración de osteoartritis de rodilla y cadera',
    rango: 'Variable según versión',
    interpretación: 'A mayor puntuación, mayor discapacidad'
  },
  {
    nombre: 'Escala Berg',
    uso: 'Valoración del equilibrio',
    rango: '0-56 puntos',
    interpretación: '<45: riesgo de caídas, <36: riesgo alto de caídas'
  },
  {
    nombre: 'Índice de Barthel',
    uso: 'Valoración de dependencia en AVD',
    rango: '0-100 puntos',
    interpretación: '0-20: dependencia total, 21-60: severa, 61-90: moderada, 91-99: escasa, 100: independencia'
  }
];

/**
 * Sistema de recomendaciones basado en códigos CIE-10
 * Utilizado en el sistema de atención primaria valenciano
 */
export const recomendacionesPorCIE10: Record<string, {
  recomendaciones: string[];
  técnicasRecomendadas: SpanishPhysiotherapyTechnique[];
  precauciones: string;
  tiempoRecuperación: string;
  derivaciónEspecialista: boolean | string;
}> = {
  // Columna cervical
  'M54.2': {
    recomendaciones: [
      'Aplicación de calor local',
      'Evitar posturas mantenidas',
      'Higiene postural',
      'Ejercicios de estiramiento suave'
    ],
    técnicasRecomendadas: [
      SpanishPhysiotherapyTechnique.ARTICULAR_MOBILIZATION,
      SpanishPhysiotherapyTechnique.MYOFASCIAL,
      SpanishPhysiotherapyTechnique.THERAPEUTIC_EXERCISE
    ],
    precauciones: 'Evitar manipulaciones cervicales en casos de vértigo o mareo asociado',
    tiempoRecuperación: '4-6 semanas',
    derivaciónEspecialista: false
  },
  
  // Lumbalgia
  'M54.5': {
    recomendaciones: [
      'Mantener actividad física tolerable',
      'Evitar reposo prolongado en cama',
      'Aplicación de calor local',
      'Posturas de descompresión (Williams)'
    ],
    técnicasRecomendadas: [
      SpanishPhysiotherapyTechnique.MYOFASCIAL,
      SpanishPhysiotherapyTechnique.THERAPEUTIC_EXERCISE,
      SpanishPhysiotherapyTechnique.GLOBAL_POSTURAL
    ],
    precauciones: 'Ante síntomas de cola de caballo (alteraciones esfinterianas), derivar urgentemente',
    tiempoRecuperación: '4-6 semanas',
    derivaciónEspecialista: false
  },
  
  // Síndrome del manguito rotador
  'M75.1': {
    recomendaciones: [
      'Evitar actividades por encima de la cabeza',
      'Aplicación de frío en fase aguda',
      'Ejercicios pendulares (Codman)',
      'Programa progresivo de fortalecimiento'
    ],
    técnicasRecomendadas: [
      SpanishPhysiotherapyTechnique.ARTICULAR_MOBILIZATION,
      SpanishPhysiotherapyTechnique.THERAPEUTIC_EXERCISE,
      SpanishPhysiotherapyTechnique.ULTRASOUND
    ],
    precauciones: 'Evitar estiramiento excesivo en fase aguda',
    tiempoRecuperación: '8-12 semanas',
    derivaciónEspecialista: 'Valorar si no hay mejoría en 6 semanas'
  },
  
  // Gonartrosis
  'M17.0': {
    recomendaciones: [
      'Control de peso',
      'Actividad física de bajo impacto (natación, bicicleta)',
      'Fortalecimiento muscular isométrico',
      'Evitar sobrecargas'
    ],
    técnicasRecomendadas: [
      SpanishPhysiotherapyTechnique.THERAPEUTIC_EXERCISE,
      SpanishPhysiotherapyTechnique.ELECTROTHERAPY,
      SpanishPhysiotherapyTechnique.ULTRASOUND
    ],
    precauciones: 'Evitar ejercicios de alto impacto y sobrecarga articular',
    tiempoRecuperación: 'Patología crónica, manejo continuado',
    derivaciónEspecialista: 'Valorar en casos de dolor intenso no controlado o limitación funcional severa'
  },
  
  // EPOC
  'J44.9': {
    recomendaciones: [
      'Técnicas de ahorro energético',
      'Ejercicio físico adaptado diario',
      'Técnicas de respiración diafragmática',
      'Técnicas de drenaje bronquial si hay secreciones'
    ],
    técnicasRecomendadas: [
      SpanishPhysiotherapyTechnique.RESPIRATORY,
      SpanishPhysiotherapyTechnique.THERAPEUTIC_EXERCISE
    ],
    precauciones: 'No realizar en fase de exacerbación aguda',
    tiempoRecuperación: 'Patología crónica, manejo continuado',
    derivaciónEspecialista: 'Derivar a neumología ante exacerbaciones frecuentes'
  },
  
  // Esguince de tobillo
  'S93.4': {
    recomendaciones: [
      'Protocolo RICE (reposo, hielo, compresión, elevación) inicial',
      'Movilización precoz controlada',
      'Ejercicios propioceptivos progresivos',
      'Vendaje funcional en fases iniciales'
    ],
    técnicasRecomendadas: [
      SpanishPhysiotherapyTechnique.ARTICULAR_MOBILIZATION,
      SpanishPhysiotherapyTechnique.THERAPEUTIC_EXERCISE,
      SpanishPhysiotherapyTechnique.PROPRIOCEPTIVE
    ],
    precauciones: 'Evitar apoyo completo en fases iniciales según gravedad',
    tiempoRecuperación: 'Grado I: 1-3 semanas, Grado II: 3-6 semanas, Grado III: 6-12 semanas',
    derivaciónEspecialista: 'En caso de sospecha de lesiones asociadas o no evolución favorable'
  }
};

/**
 * Tipo para la respuesta de las recomendaciones
 */
type RespuestaRecomendaciones = 
  | { encontrado: true; recomendaciones: typeof recomendacionesPorCIE10[keyof typeof recomendacionesPorCIE10] }
  | { encontrado: false; mensaje: string; categoría: string; descripción: string; recomendaciónGeneral: string };

/**
 * Obtiene recomendaciones específicas basadas en un código CIE-10
 * @param codigoCIE10 - Código CIE-10 según clasificación española
 * @returns Recomendaciones detalladas si existe el código, o información básica si no está registrado
 */
export function obtenerRecomendacionesCIE10(codigoCIE10: string): RespuestaRecomendaciones {
  if (codigoCIE10 in recomendacionesPorCIE10) {
    return {
      encontrado: true,
      recomendaciones: recomendacionesPorCIE10[codigoCIE10]
    };
  }
  
  // Buscar en qué categoría está el código
  let categoria = '';
  let descripcion = 'Desconocida';
  
  // Comprobar cada categoría
  for (const [cat, codigos] of Object.entries(codigosCIE10Valencianos)) {
    if (codigoCIE10 in codigos) {
      categoria = cat;
      descripcion = codigos[codigoCIE10 as keyof typeof codigos] || 'Desconocida';
      break;
    }
  }
  
  return {
    encontrado: false,
    mensaje: `No existen recomendaciones específicas para el código ${codigoCIE10}`,
    categoría: categoria || 'No encontrada',
    descripción: descripcion,
    recomendaciónGeneral: 'Consultar con el servicio de rehabilitación para valoración individualizada'
  };
}

/**
 * Centros de fisioterapia de la red pública valenciana
 */
export const centrosFisioterapiaValencianos = {
  Valencia: [
    'Hospital Universitario y Politécnico La Fe',
    'Hospital Clínico Universitario de Valencia',
    'Hospital General Universitario de Valencia',
    'Hospital Doctor Peset',
    'Centro de Salud Serrería I',
    'Centro de Salud Benimaclet',
    'Centro de Salud Salvador Pau',
    'Centro de Especialidades Juan Llorens'
  ],
  Alicante: [
    'Hospital General Universitario de Alicante',
    'Hospital Universitario de San Juan',
    'Hospital Marina Baixa de Villajoyosa',
    'Centro de Salud Cabo Huertas',
    'Centro de Salud San Blas',
    'Centro de Especialidades Babel'
  ],
  Castellón: [
    'Hospital General Universitario de Castellón',
    'Hospital Provincial de Castellón',
    'Hospital de Vinaròs',
    'Centro de Salud Rafalafena',
    'Centro de Salud Gran Vía',
    'Centro de Especialidades Jaime I'
  ]
}; 