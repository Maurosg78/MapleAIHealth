/**
 * Tipos específicos para fisioterapia en España
 * Adaptados al sistema sanitario español y terminología local
 */

/**
 * Tipos de sistema sanitario en España
 */
export enum SpanishHealthcareSystem {
  PUBLIC = 'PÚBLICO', // Sistema Nacional de Salud
  PRIVATE = 'PRIVADO', // Centros privados
  MIXED = 'MIXTO', // Centros con convenio público-privado
  MUTUAL = 'MUTUA' // Mutuas colaboradoras con la Seguridad Social
}

/**
 * Tipos de centros de fisioterapia en España
 */
export enum SpanishPhysiotherapyCenterType {
  PRIMARY_CARE = 'ATENCIÓN_PRIMARIA', // Centros de salud
  HOSPITAL = 'HOSPITAL', // Unidades hospitalarias
  PRIVATE_CLINIC = 'CLÍNICA_PRIVADA', // Consultas/clínicas privadas
  SPORTS_CENTER = 'CENTRO_DEPORTIVO', // Centros deportivos con servicio de fisioterapia
  HOME_CARE = 'ATENCIÓN_DOMICILIARIA', // Servicio a domicilio
  OCCUPATIONAL_HEALTH = 'SALUD_LABORAL' // Servicios en empresas o mutuas laborales
}

/**
 * Tipos de documentos clínicos utilizados en España
 */
export enum SpanishClinicalDocument {
  MEDICAL_HISTORY = 'HISTORIA_CLÍNICA',
  INFORMED_CONSENT = 'CONSENTIMIENTO_INFORMADO',
  INITIAL_ASSESSMENT = 'VALORACIÓN_INICIAL',
  EVOLUTION_NOTES = 'NOTAS_EVOLUCIÓN',
  DISCHARGE_REPORT = 'INFORME_ALTA',
  REFERRAL = 'VOLANTE_DERIVACIÓN',
  SICK_LEAVE = 'PARTE_BAJA_LABORAL',
  LEGAL_REPORT = 'INFORME_PERICIAL'
}

/**
 * Especialistas médicos para derivación en España
 */
export enum SpanishMedicalSpecialist {
  FAMILY_DOCTOR = 'MÉDICO_FAMILIA',
  REHABILITATION = 'REHABILITACIÓN',
  TRAUMATOLOGY = 'TRAUMATOLOGÍA',
  RHEUMATOLOGY = 'REUMATOLOGÍA',
  NEUROLOGY = 'NEUROLOGÍA',
  SPORTS_MEDICINE = 'MEDICINA_DEPORTIVA',
  OCCUPATIONAL_MEDICINE = 'MEDICINA_LABORAL',
  PAIN_UNIT = 'UNIDAD_DOLOR'
}

/**
 * Clasificación y codificación médica utilizada en España
 */
export enum SpanishCodingClassification {
  ICD10ES = 'CIE10ES', // Clasificación Internacional de Enfermedades (versión española)
  SNOMED_CT = 'SNOMED_CT', // Nomenclatura sistematizada de medicina
  ICF = 'CIF' // Clasificación Internacional del Funcionamiento, de la Discapacidad y de la Salud
}

/**
 * Datos del paciente adaptados al contexto español
 */
export interface SpanishPatientInfo {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  dni?: string; // Documento Nacional de Identidad
  nie?: string; // Número de Identidad de Extranjero
  cip?: string; // Código de Identificación Personal sanitario
  numSegSocial?: string; // Número de Seguridad Social
  sistemaSanitario: SpanishHealthcareSystem;
  aseguradora?: string; // En caso de seguro privado (Adeslas, Sanitas, DKV, etc.)
  mutua?: string; // En caso de accidente laboral (Fremap, Asepeyo, etc.)
  médico: {
    nombreCompleto: string;
    especialidad: SpanishMedicalSpecialist;
    numColegiado?: string; // Número de colegiado
  };
  centroRemitente?: string; // Centro que deriva al paciente
}

/**
 * Estructura SOAP adaptada a fisioterapia española
 */
export interface SpanishPhysiotherapySOAP {
  subjetivo: {
    motivoConsulta: string;
    sintomatología: string;
    antecedentes: {
      patológicos: string[];
      quirúrgicos: string[];
      familiares: string[];
    };
    medicación: string[];
    pruebasDiagnósticas: {
      tipo: string; // Rx, RM, TAC, EMG, etc.
      fecha: string;
      resultado: string;
    }[];
    hábitosVida: {
      actividad: string;
      profesión: string;
      deportes: string;
      hábitosPerjudiciales: string; // Tabaco, alcohol, etc.
    };
  };
  objetivo: {
    inspección: string;
    palpación: string;
    balanceArticular: {
      región: string;
      activo: string;
      pasivo: string;
      doloroso: boolean;
    }[];
    balanceMuscular: {
      grupo: string;
      valor: string; // Escala 0-5 o porcentaje
      observaciones: string;
    }[];
    testEspecíficos: {
      nombre: string;
      resultado: string;
      positivo: boolean;
    }[];
    escalasValidadas: {
      nombre: string;
      puntuación: string;
      interpretación: string;
    }[];
  };
  análisis: {
    diagnósticoFisioterapia: string;
    códigoCIE10?: string;
    clasificaciónCIF?: {
      estructuras: string[];
      funciones: string[];
      actividades: string[];
      participación: string[];
      factoresAmbientales: string[];
    };
    limitacionesFuncionales: string[];
    pronóstico: string;
  };
  plan: {
    objetivos: {
      corto: string[];
      medio: string[];
      largo: string[];
    };
    técnicas: {
      nombre: string;
      parámetros?: string;
      frecuencia: string;
    }[];
    recomendaciones: string[];
    planEjercicios?: string;
    frecuenciaSesiones: string;
    duraciónEstimadaTratamiento: string;
  };
}

/**
 * Estructura para ejercicios terapéuticos en España
 */
export interface SpanishTherapeuticExercise {
  nombre: string;
  región: string;
  descripción: string;
  ejecución: string[];
  dosificación: {
    series: number;
    repeticiones: number;
    tiempo?: string;
    frecuencia: string;
    progresión?: string;
  };
  advertencias?: string[];
  mediosMateriales?: string[];
  objetivos: string[];
  imágenes?: string[];
  vídeo?: string;
  variantes?: {
    nombre: string;
    descripción: string;
    indicación: string;
  }[];
}

/**
 * Informe pericial fisioterapéutico para casos legales
 */
export interface SpanishLegalReport {
  datosPerito: {
    nombre: string;
    numColegiado: string;
    formación: string[];
    experiencia: string;
  };
  objetoInforme: string;
  metodología: string[];
  anamnesis: string;
  exploraciónFísica: string;
  pruebasDiagnósticas: {
    tipo: string;
    fecha: string;
    resultado: string;
    valoración: string;
  }[];
  diagnósticoFisioterapia: string;
  clasificaciónSecuelas: {
    descripción: string;
    baremoUtilizado: string;
    puntuación: string;
  }[];
  tratamientoRealizado: string;
  tratamientoFuturo: {
    tipo: string;
    duración: string;
    coste: string;
  }[];
  conclusiones: string[];
  respuestaObjeciones?: string;
  bibliografía: string[];
  anexos?: string[];
  fechaEmisión: string;
}

/**
 * Tipos de técnicas de fisioterapia utilizadas en España
 */
export enum SpanishPhysiotherapyTechnique {
  // Terapia manual
  ARTICULAR_MOBILIZATION = 'MOVILIZACIÓN_ARTICULAR',
  MANIPULATION = 'MANIPULACIÓN',
  MUSCLE_ENERGY = 'ENERGÍA_MUSCULAR',
  MYOFASCIAL = 'MIOFASCIAL',
  MASSAGE = 'MASOTERAPIA',
  TRANSVERSE_FRICTION = 'FRICCIÓN_TRANSVERSA',
  LYMPHATIC_DRAINAGE = 'DRENAJE_LINFÁTICO',
  NEUROMUSCULAR = 'NEUROMUSCULAR',
  
  // Ejercicio terapéutico
  THERAPEUTIC_EXERCISE = 'EJERCICIO_TERAPÉUTICO',
  PROPRIOCEPTIVE = 'PROPIOCEPCIÓN',
  MOTOR_CONTROL = 'CONTROL_MOTOR',
  PILATES = 'PILATES_TERAPÉUTICO',
  SUSPENSION_TRAINING = 'ENTRENAMIENTO_SUSPENSIÓN',
  GLOBAL_POSTURAL = 'REEDUCACIÓN_POSTURAL_GLOBAL',
  
  // Fisioterapia invasiva
  DRY_NEEDLING = 'PUNCIÓN_SECA',
  EPI = 'ELECTROLISIS_PERCUTÁNEA_INTRATISULAR',
  ACUPUNCTURE = 'ACUPUNTURA',
  
  // Agentes físicos
  ELECTROTHERAPY = 'ELECTROTERAPIA',
  TENS = 'TENS',
  ULTRASOUND = 'ULTRASONIDOS',
  LASER = 'LÁSER',
  SHOCK_WAVE = 'ONDAS_CHOQUE',
  THERMOTHERAPY = 'TERMOTERAPIA',
  CRYOTHERAPY = 'CRIOTERAPIA',
  HYDROTHERAPY = 'HIDROTERAPIA',
  
  // Fisioterapia neurológica
  PNF = 'FACILITACIÓN_NEUROMUSCULAR_PROPIOCEPTIVA',
  BOBATH = 'CONCEPTO_BOBATH',
  VOJTA = 'MÉTODO_VOJTA',
  PERFETTI = 'EJERCICIO_TERAPÉUTICO_COGNOSCITIVO',
  
  // Otros
  KINESIOTAPING = 'VENDAJE_NEUROMUSCULAR',
  RESPIRATORY = 'FISIOTERAPIA_RESPIRATORIA',
  PELVIC_FLOOR = 'SUELO_PÉLVICO',
  VESTIBULAR = 'REHABILITACIÓN_VESTIBULAR'
}

/**
 * Enfoques de fisioterapia utilizados en España
 */
export enum SpanishPhysiotherapyApproach {
  BIOMEDICAL = 'BIOMÉDICO',
  BIOPSYCHOSOCIAL = 'BIOPSICOSOCIAL',
  EVIDENCE_BASED = 'BASADO_EN_EVIDENCIA',
  PATIENT_CENTERED = 'CENTRADO_EN_PACIENTE',
  MECHANISTIC = 'MECANICISTA',
  FUNCTIONAL = 'FUNCIONAL',
  HOLISTIC = 'HOLÍSTICO'
}

/**
 * Estado laboral del paciente (relevante para bajas)
 */
export enum SpanishWorkStatus {
  ACTIVE = 'ACTIVO',
  SICK_LEAVE = 'BAJA_LABORAL',
  PARTIAL_LEAVE = 'BAJA_PARCIAL',
  DISABILITY = 'INCAPACIDAD',
  UNEMPLOYED = 'DESEMPLEADO',
  RETIRED = 'JUBILADO',
  STUDENT = 'ESTUDIANTE'
}

/**
 * Tipos de accidentes para clasificación en sistema español
 */
export enum SpanishAccidentType {
  NONE = 'NO_ACCIDENTE',
  WORKPLACE = 'ACCIDENTE_LABORAL',
  COMMUTING = 'ACCIDENTE_IN_ITINERE',
  TRAFFIC = 'ACCIDENTE_TRÁFICO',
  SPORTS = 'ACCIDENTE_DEPORTIVO',
  DOMESTIC = 'ACCIDENTE_DOMÉSTICO',
  ASSAULT = 'AGRESIÓN',
  OTHER = 'OTRO'
}

/**
 * Tipos de resultados clínicos medidos en fisioterapia española
 */
export enum SpanishClinicalOutcomes {
  PAIN = 'DOLOR',
  FUNCTION = 'FUNCIÓN',
  MOBILITY = 'MOVILIDAD',
  STRENGTH = 'FUERZA',
  QUALITY_LIFE = 'CALIDAD_VIDA',
  RETURN_WORK = 'RETORNO_LABORAL',
  RETURN_SPORT = 'RETORNO_DEPORTIVO',
  MEDICATION_USE = 'USO_MEDICACIÓN',
  PATIENT_SATISFACTION = 'SATISFACCIÓN_PACIENTE',
  RECURRENCE = 'RECURRENCIA'
}

/**
 * Estado de derivación desde atención primaria a fisioterapia
 */
export enum SpanishReferralStatus {
  PENDING = 'PENDIENTE',
  ACCEPTED = 'ACEPTADA',
  REJECTED = 'RECHAZADA',
  COMPLETED = 'COMPLETADA',
  CANCELED = 'ANULADA',
  ON_WAITING_LIST = 'EN_LISTA_ESPERA'
}

/**
 * Nivel de prioridad en la atención (utilizado en sistema público)
 */
export enum SpanishPriorityLevel {
  URGENT = 'URGENTE', // Atención inmediata
  PREFERENT = 'PREFERENTE', // 15-30 días
  ORDINARY = 'ORDINARIA', // Según lista de espera estándar
  NOT_DELAYED = 'NO_DEMORABLE' // Requiere atención en <7 días
}

/**
 * Resumen de tratamiento para informes de alta
 */
export interface SpanishTreatmentSummary {
  fechaInicio: string;
  fechaFin: string;
  numSesiones: number;
  técnicasAplicadas: SpanishPhysiotherapyTechnique[];
  evolución: {
    dolor: string; // Ej: "Reducción de EVA de 8/10 a 3/10"
    función: string;
    objetivosConseguidos: string[];
    objetivosPendientes: string[];
  };
  recomendacionesAlta: string[];
  pronóstico: string;
  revisión?: string; // Fecha recomendada para revisión
}

/**
 * Tipos de visitas en fisioterapia (utilizado para agendas)
 */
export enum SpanishAppointmentType {
  INITIAL = 'PRIMERA_VISITA',
  FOLLOW_UP = 'SUCESIVA',
  REASSESSMENT = 'REVALORACIÓN',
  DISCHARGE = 'ALTA',
  EMERGENCY = 'URGENCIA',
  CONSULTATION = 'CONSULTA_RÁPIDA'
} 