/**
 * Referencia para fisioterapia en España - Comunidad Valenciana
 * Incluye códigos diagnósticos, técnicas, protocolos y documentación
 * relevante para el sistema sanitario español
 */

import { SpanishMedicalSpecialist } from '../types/spanishPhysiotherapyTypes';

/**
 * Códigos CIE-10 comunes en fisioterapia española
 */
export const commonICD10Codes = {
  columna: {
    'M54.5': 'Lumbalgia',
    'M54.4': 'Lumbociática',
    'M54.2': 'Cervicalgia',
    'M54.1': 'Radiculopatía cervical',
    'M51.1': 'Trastorno de disco lumbar con radiculopatía',
    'M50.1': 'Trastorno de disco cervical con radiculopatía',
    'M48.0': 'Estenosis del canal vertebral',
    'M47.2': 'Espondilosis con radiculopatía',
    'M43.1': 'Espondilolistesis',
    'M47.8': 'Artrosis de columna vertebral'
  },
  extremidadSuperior: {
    'M75.1': 'Síndrome del manguito rotador',
    'M75.4': 'Síndrome de pinzamiento del hombro',
    'M77.1': 'Epicondilitis lateral (codo de tenista)',
    'M77.0': 'Epicondilitis medial (codo de golfista)',
    'M70.0': 'Tenosinovitis de mano y muñeca',
    'G56.0': 'Síndrome del túnel carpiano',
    'M19.0': 'Artrosis primaria de otras articulaciones',
    'M18.0': 'Artrosis primaria de la primera articulación carpometacarpiana',
    'S42.0': 'Fractura de clavícula',
    'S43.0': 'Luxación de la articulación del hombro'
  },
  extremidadInferior: {
    'M17.0': 'Gonartrosis primaria bilateral',
    'M23.2': 'Trastorno de menisco debido a desgarro o lesión antigua',
    'M24.2': 'Trastorno ligamentoso',
    'M25.5': 'Dolor articular',
    'M76.5': 'Tendinitis rotuliana',
    'M76.6': 'Tendinitis aquileana',
    'M76.3': 'Síndrome de la cintilla iliotibial',
    'S83.5': 'Esguince/torcedura de ligamentos cruzados de la rodilla',
    'S93.4': 'Esguince/torcedura de tobillo',
    'M20.1': 'Hallux valgus'
  },
  neurológico: {
    'G81.9': 'Hemiplejía, no especificada',
    'G82.2': 'Paraplejía, no especificada',
    'G82.5': 'Tetraplejía, no especificada',
    'I69.3': 'Secuelas de infarto cerebral',
    'G35': 'Esclerosis múltiple',
    'G20': 'Enfermedad de Parkinson',
    'G71.0': 'Distrofias musculares',
    'G61.0': 'Síndrome de Guillain-Barré',
    'G62.9': 'Polineuropatía, no especificada',
    'I63.9': 'Infarto cerebral, no especificado'
  }
};

/**
 * Técnicas de fisioterapia utilizadas en España
 */
export const physiotherapyTechniques = {
  terapiaManual: {
    'Terapia manual ortopédica': 'Técnicas de movilización y manipulación articular según los conceptos Kaltenborn-Evjenth, Maitland, Mulligan y otras escuelas europeas.',
    'Masoterapia': 'Diferentes técnicas de masaje terapéutico incluyendo masaje funcional, transverso profundo de Cyriax, drenaje linfático manual método Leduc y Vodder.',
    'Técnicas neuromusculares': 'Técnicas de energía muscular, liberación por presión, técnicas de Jones, facilitación neuromuscular propioceptiva (Kabat).',
    'Inducción miofascial': 'Técnicas de tratamiento del sistema fascial según el concepto desarrollado por Pilat.'
  },
  agentesPhysical: {
    'Electroterapia': 'TENS, corrientes interferenciales, corrientes diadinámicas, microondas, onda corta.',
    'Ultrasonoterapia': 'Aplicación de ultrasonidos terapéuticos en diferentes modalidades (pulsátil o continuo).',
    'Termoterapia': 'Aplicación de calor mediante infrarrojo, parafina, parafango o hot packs.',
    'Crioterapia': 'Aplicación de frío mediante cold packs, baños de hielo o gases vaporizados.',
    'Hidroterapia': 'Tratamiento en medio acuático, especialmente desarrollado en balnearios valencianos y en unidades hospitalarias.'
  },
  ejercicioTerapéutico: {
    'Método Pilates Terapéutico': 'Adaptación del método Pilates al ámbito clínico, ampliamente utilizado en centros privados valencianos.',
    'Ejercicio terapéutico cognoscitivo (Perfetti)': 'Enfoque para pacientes neurológicos basado en el aprendizaje motor.',
    'Reeducación postural global (RPG)': 'Método desarrollado por Philippe Souchard, con gran implantación en España.',
    'Ejercicios de control motor': 'Programa de ejercicios específicos para reeducación propioceptiva y estabilización segmentaria.',
    'Escuela de espalda': 'Programa educativo y de ejercicio preventivo para patologías de columna vertebral.'
  },
  técnicasEspecializadas: {
    'Punción seca': 'Técnica invasiva para el tratamiento de puntos gatillo miofasciales, regulada específicamente en la Comunidad Valenciana.',
    'Neurodinamia': 'Evaluación y tratamiento del sistema nervioso y su movilidad en relación con el sistema músculo-esquelético.',
    'Kinesiotaping': 'Aplicación de vendaje neuromuscular con fines terapéuticos.',
    'EPI® (Electrólisis Percutánea Intratisular)': 'Técnica invasiva para el tratamiento de tendinopatías, desarrollada en España.',
    'Terapia Vojta': 'Método neuromotor utilizado principalmente en pediatría.'
  }
};

/**
 * Protocolos de fisioterapia en la Comunidad Valenciana
 */
export const valencianPhysiotherapyProtocols = {
  atenciónPrimaria: {
    procesoDerivación: 'Derivación desde médico de familia mediante interconsulta electrónica en sistema Abucasis o equivalente.',
    criterioPriorización: 'Prioridad alta para pacientes con dolor agudo, post-quirúrgicos recientes y pacientes con deterioro funcional significativo.',
    limitacionesSesiones: 'Generalmente 15-20 sesiones por proceso, con posibilidad de ampliación bajo justificación clínica.',
    patologíasIncluidas: [
      'Patología cervical y lumbar sin compromiso neurológico',
      'Hombro doloroso no quirúrgico',
      'Gonartrosis leve-moderada',
      'Esguinces grado I-II',
      'Algias vertebrales mecánicas'
    ],
    contraindicaciones: [
      'Procesos infecciosos activos',
      'Patología tumoral en fase aguda',
      'Fracturas no consolidadas',
      'Procesos que requieran atención hospitalaria'
    ]
  },
  hospitalario: {
    unidadesEspecializadas: [
      'Unidad de rehabilitación neurológica (Hospital La Fe, Valencia)',
      'Unidad de rehabilitación cardiorrespiratoria (Hospital General, Valencia)',
      'Unidad de suelo pélvico (Hospital Dr. Peset, Valencia)',
      'Unidad de vestibular y equilibrio (Hospital Clínico, Valencia)',
      'Unidad de rehabilitación infantil (Hospital La Fe, Valencia)'
    ],
    protocolosEspecíficos: {
      ictus: 'Protocolo de neurorrehabilitación intensiva con inicio en fase aguda, continuidad en fase subaguda y seguimiento ambulatorio.',
      traumatológico: 'Protocolos específicos posquirúrgicos para prótesis de rodilla y cadera con inicio en 24-48h tras cirugía.',
      respiratorio: 'Protocolo de fisioterapia respiratoria para EPOC, fibrosis quística y pacientes COVID persistente.'
    },
    equiposMultidisciplinares: 'Coordinación con equipos de rehabilitación, neurología, traumatología, neumología y medicina física según la unidad específica.'
  },
  privada: {
    convenciones: 'Protocolos específicos según convenios con mutuas laborales (Unión de Mutuas, Fremap, Asepeyo) y aseguradoras (Adeslas, DKV, Sanitas).',
    técnicasEspecíficas: 'Mayor disponibilidad de técnicas como punción seca, EPI, ecografía intervencionista y terapias invasivas específicas.',
    ratiosFisioterapeuta: 'Atención generalmente individualizada (1:1) o en grupos reducidos para ejercicio terapéutico (1:3-5).',
    coordinaciónDeportiva: 'Protocolos específicos de colaboración con clubes deportivos valencianos (Valencia CF, Levante UD, Valencia Basket).'
  }
};

/**
 * Documentación clínica obligatoria según normativa española
 */
export const clinicalDocumentation = {
  documentosObligatorios: [
    'Historia clínica completa (Ley 41/2002)',
    'Consentimiento informado para técnicas invasivas',
    'Informe de alta con recomendaciones (Real Decreto 1093/2010)',
    'Registro de sesiones realizadas',
    'Escalas validadas de valoración inicial y final'
  ],
  normativaAplicable: [
    'Ley 41/2002 de autonomía del paciente',
    'Ley Orgánica 3/2018 de Protección de Datos Personales',
    'Real Decreto 1093/2010 sobre conjunto mínimo de datos de informes clínicos',
    'Normativa específica de la Conselleria de Sanitat Universal i Salut Pública'
  ],
  tiempoConservación: 'Mínimo de 5 años desde la fecha de alta de cada proceso asistencial (ampliable según comunidad autónoma).',
  formatoAceptado: 'Tanto formato papel como electrónico, siempre que cumpla requisitos de seguridad y confidencialidad.',
  informeAlta: 'Debe incluir diagnóstico fisioterapéutico, tratamiento realizado, evolución y recomendaciones específicas.'
};

/**
 * Escalas validadas utilizadas en España
 */
export const validatedAssessmentScales = {
  dolorFuncionalidad: [
    'Escala Visual Analógica (EVA)',
    'Cuestionario de dolor McGill adaptado al español',
    'Índice de Discapacidad de Oswestry (versión española)',
    'Neck Disability Index (NDI) validado en español',
    'Cuestionario DASH para miembro superior (versión española)',
    'Escala WOMAC para artrosis (versión española)'
  ],
  neurológicas: [
    'Escala Ashworth modificada',
    'Índice de Barthel',
    'Escala Tinetti',
    'Test de control de tronco (TCT)',
    'Escala de Berg',
    'Functional Ambulation Categories (FAC)'
  ],
  específicas: [
    'Escala VISA-P para tendinopatía rotuliana (versión española)',
    'Cuestionario CAIT para inestabilidad de tobillo (adaptación española)',
    'Test de Constant-Murley para hombro (validación española)',
    'Escala Tampa de kinesiofobia (versión española)',
    'Escala PEDro para valorar calidad metodológica de estudios'
  ],
  calidadVida: [
    'Cuestionario SF-36 (versión española)',
    'EuroQol-5D (versión española)',
    'Cuestionario WHOQOL-BREF (adaptación española)'
  ]
};

/**
 * Interfaz para las recomendaciones médicas
 */
interface MedicalRecommendations {
  recomendaciones: string[];
  técnicasRecomendadas: string[];
  precauciones: string[];
  tiempoRecuperaciónEstimado: string;
  derivaciónRecomendada: boolean;
  especialistaRecomendado?: SpanishMedicalSpecialist;
}

/**
 * Función para obtener recomendaciones específicas basadas en código CIE-10
 * Enfocado en el sistema sanitario español, especialmente Comunidad Valenciana
 * @param icd10Code Código CIE-10 para buscar recomendaciones
 * @returns Objeto con recomendaciones y precauciones específicas
 */
export function getRecommendationsByICD10(icd10Code: string): MedicalRecommendations {
  // Lumbalgia
  if (icd10Code === 'M54.5') {
    return {
      recomendaciones: [
        'Evitar reposo prolongado en cama, mantener actividad física adaptada',
        'Aplicar calor local durante 15-20 minutos cada 2-3 horas',
        'Realizar ejercicios específicos de estabilización lumbar',
        'Mantener higiene postural en actividades cotidianas',
        'Evitar cargas superiores a 5kg durante fase aguda'
      ],
      técnicasRecomendadas: [
        'Terapia manual para movilización articular suave',
        'TENS en fase aguda para control del dolor',
        'Ejercicios de control motor y estabilización core',
        'Escuela de espalda para educación postural',
        'Punción seca en puntos gatillo asociados (si disponible)'
      ],
      precauciones: [
        'Suspender ejercicio si aumenta el dolor irradiado',
        'Vigilar aparición de síntomas neurológicos (déficit motor, alteración esfínteres)',
        'Evitar manipulaciones vertebrales en fase aguda'
      ],
      tiempoRecuperaciónEstimado: '4-6 semanas para fase aguda; 2-3 meses para recuperación completa',
      derivaciónRecomendada: false
    };
  }
  
  // Síndrome del manguito rotador
  if (icd10Code === 'M75.1') {
    return {
      recomendaciones: [
        'Modificar actividades que impliquen movimientos por encima de la cabeza',
        'Aplicar hielo local en fase aguda (primeras 48-72h)',
        'Realizar ejercicios de movilidad pasiva asistida en fase inicial',
        'Progresar a ejercicios activos y de fortalecimiento',
        'Mantener programa de ejercicios domiciliarios diarios'
      ],
      técnicasRecomendadas: [
        'Terapia manual para recuperar rango articular',
        'Ejercicios excéntricos progresivos para tendones afectados',
        'Kinesiotaping para asistir función y reducir dolor',
        'Ultrasonidos en modalidad pulsátil',
        'Trabajo propioceptivo de estabilización escapular'
      ],
      precauciones: [
        'Evitar carga excesiva en fase aguda',
        'Suspender ejercicios si produce dolor superior a 5/10 en EVA',
        'Vigilar posibles adherencias capsulares'
      ],
      tiempoRecuperaciónEstimado: '3-4 meses para recuperación funcional básica; 6 meses para recuperación deportiva completa',
      derivaciónRecomendada: true,
      especialistaRecomendado: SpanishMedicalSpecialist.TRAUMATOLOGY
    };
  }
  
  // Gonartrosis
  if (icd10Code === 'M17.0') {
    return {
      recomendaciones: [
        'Mantener peso corporal adecuado (IMC <30)',
        'Realizar ejercicio de bajo impacto (natación, bicicleta estática)',
        'Utilizar bastón en lado contralateral si necesario para marcha',
        'Evitar posición mantenida de rodilla en flexión',
        'Aplicar calor local antes de ejercicio y frío después si hay inflamación'
      ],
      técnicasRecomendadas: [
        'Ejercicios de fortalecimiento isométrico de cuádriceps',
        'Ejercicios de propiocepción y equilibrio',
        'Masaje descontracturante de tensores fasciales asociados',
        'Movilizaciones articulares suaves',
        'Hidroterapia en piscina terapéutica'
      ],
      precauciones: [
        'Evitar ejercicios de alto impacto',
        'Controlar derrame articular post-ejercicio',
        'Adaptar intensidad según nivel de dolor'
      ],
      tiempoRecuperaciónEstimado: 'Patología crónica que requiere control continuado. Programa intensivo inicial de 8-12 semanas, seguido de mantenimiento',
      derivaciónRecomendada: true,
      especialistaRecomendado: SpanishMedicalSpecialist.REHABILITATION
    };
  }
  
  // Cervicalgia
  if (icd10Code === 'M54.2') {
    return {
      recomendaciones: [
        'Mantener higiene postural en trabajo con ordenadores',
        'Aplicar calor local 15-20 minutos cada 3-4 horas',
        'Realizar ejercicios de movilidad cervical suaves diariamente',
        'Adaptar almohada y postura durante el sueño',
        'Realizar microdescansos cada 45-60 minutos en trabajos sedentarios'
      ],
      técnicasRecomendadas: [
        'Terapia manual: técnicas articulatorias y de energía muscular',
        'Masaje de trapecio, elevador de la escápula y escalenos',
        'Ejercicios de reeducación postural y corrección escapular',
        'TENS en fase aguda para control del dolor',
        'Punción seca en puntos gatillo activos (si procede)'
      ],
      precauciones: [
        'Evitar manipulaciones bruscas cervicales',
        'Vigilar síntomas neurológicos (parestesias en MMSS, mareos)',
        'Evitar collares cervicales rígidos más de 72 horas'
      ],
      tiempoRecuperaciónEstimado: '3-4 semanas en fase aguda; programa preventivo continuado en casos recurrentes',
      derivaciónRecomendada: false
    };
  }
  
  // Hemiplejía
  if (icd10Code === 'G81.9') {
    return {
      recomendaciones: [
        'Iniciar movilizaciones pasivas precoces para prevenir rigidez',
        'Establecer programa de cambios posturales cada 3-4 horas',
        'Realizar entrenamiento bilateral de actividades',
        'Adaptar entorno domiciliario para facilitar independencia',
        'Incorporar ejercicios de equilibrio según evolución'
      ],
      técnicasRecomendadas: [
        'Técnicas de facilitación neuromuscular propioceptiva (Kabat)',
        'Bobath para control postural y secuencias de movimiento',
        'Entrenamiento orientado a tareas específicas',
        'Técnicas de feedback visual con espejo',
        'Estimulación sensorial controlada'
      ],
      precauciones: [
        'Vigilar síndrome hombro-mano en fase subaguda',
        'Controlar adecuado posicionamiento para prevenir subluxación glenohumeral',
        'Evitar patrones espásticos en posicionamiento'
      ],
      tiempoRecuperaciónEstimado: 'Recuperación neurológica principal en primeros 3-6 meses; rehabilitación funcional continuada hasta 12-18 meses',
      derivaciónRecomendada: true,
      especialistaRecomendado: SpanishMedicalSpecialist.NEUROLOGY
    };
  }
  
  // Esguince de tobillo
  if (icd10Code === 'S93.4') {
    return {
      recomendaciones: [
        'Seguir protocolo RICE en primeras 48-72h (Reposo, Hielo, Compresión, Elevación)',
        'Iniciar carga parcial asistida según tolerancia',
        'Realizar ejercicios circulatorios desde el primer día',
        'Progresar a ejercicios propioceptivos cuando permita carga completa',
        'Reincorporación deportiva progresiva con protección funcional'
      ],
      técnicasRecomendadas: [
        'Drenaje linfático manual en fase aguda',
        'Movilización articular precoz controlada',
        'Ejercicios propioceptivos progresivos en diferentes superficies',
        'Fortalecimiento excéntrico de peroneos',
        'Kinesiotaping para soporte funcional'
      ],
      precauciones: [
        'Evitar carga completa precoz en grados II-III',
        'Vigilar posible sindrome de dolor regional complejo',
        'Evitar inestabilidad crónica mediante adecuada rehabilitación'
      ],
      tiempoRecuperaciónEstimado: 'Grado I: 1-3 semanas; Grado II: 3-6 semanas; Grado III: 6-12 semanas para recuperación funcional completa',
      derivaciónRecomendada: false
    };
  }

  // Si no se encuentra el código específico, devuelve recomendaciones generales
  return {
    recomendaciones: [
      'Consultar con especialista para evaluación específica',
      'Seguir las indicaciones del informe médico',
      'Mantener actividad física adaptada a condición'
    ],
    técnicasRecomendadas: [
      'Evaluación individualizada por fisioterapeuta',
      'Programa personalizado según hallazgos clínicos'
    ],
    precauciones: [
      'Evitar automedicación prolongada',
      'Suspender actividad ante aumento significativo de dolor'
    ],
    tiempoRecuperaciónEstimado: 'Variable según patología específica',
    derivaciónRecomendada: true,
    especialistaRecomendado: SpanishMedicalSpecialist.FAMILY_DOCTOR
  };
} 