// Script que simula un EMR estructurado para fisioterapia con integración del asistente virtual

// Módulos y funciones simuladas
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Estructura de datos para el EMR de fisioterapia
const emrStructure = {
  patientInfo: {
    personalData: {
      id: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
      contact: {
        phone: '',
        email: '',
        address: '',
      },
      insurance: {
        provider: '',
        policyNumber: '',
        coverage: '',
      },
    },
    medicalHistory: {
      conditions: [],
      medications: [],
      surgeries: [],
      allergies: [],
      familyHistory: [],
    },
  },
  consultations: [],
  physicalAssessment: {
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      temperature: '',
      height: '',
      weight: '',
      bmi: '',
    },
    painAssessment: {
      location: [],
      intensity: {}, // escala 0-10 por ubicación
      quality: {}, // tipo de dolor por ubicación
      aggravating: [],
      relieving: [],
      vas: '', // Visual Analogue Scale
      nps: '', // Numeric Pain Scale
    },
    rangeOfMotion: {}, // Por articulación: valores de rango
    muscleStrength: {}, // Por grupo muscular: escala 0-5
    posturalAssessment: {
      anterior: {},
      lateral: {},
      posterior: {},
    },
    gaitAssessment: {
      pattern: '',
      deviations: [],
      assistiveDevices: '',
    },
    functionalTests: [], // Tests específicos con resultados
    specialTests: [], // Tests especiales ortopédicos/neurológicos
  },
  treatmentPlan: {
    diagnosis: {
      primary: '',
      secondary: [],
    },
    goals: {
      shortTerm: [],
      longTerm: [],
    },
    interventions: [], // Lista de intervenciones con detalles
    homeProgram: [], // Ejercicios para casa
    progressMeasures: [], // Criterios para medir progreso
  },
  progressNotes: [], // Notas de evolución por sesión
  documentsAndImages: [], // Informes, radiografías, etc.
};

// Datos preconfigurados para demostración del paciente
const samplePatient = {
  personalData: {
    id: 'PT-2023-0456',
    firstName: 'Laura',
    lastName: 'Martínez',
    birthDate: '1985-10-23',
    gender: 'Femenino',
    contact: {
      phone: '612-345-6789',
      email: 'laura.martinez@ejemplo.com',
      address: 'C/ Principal 123, Madrid',
    },
    insurance: {
      provider: 'Sanitas',
      policyNumber: 'SAN-7891234',
      coverage: 'Completa con fisioterapia (20 sesiones/año)',
    },
  },
  medicalHistory: {
    conditions: [
      'Tendinopatía rotuliana (Dx: 2022-08)',
      'Lumbalgia crónica (Dx: 2020-03)',
    ],
    medications: ['Ibuprofeno 400mg SOS', 'Paracetamol 1g SOS'],
    surgeries: ['Artroscopia menisco rodilla derecha (2018)'],
    allergies: ['Ninguna conocida'],
    familyHistory: ['Madre con artrosis de rodilla', 'Padre con hipertensión'],
  },
};

// Consulta inicial con datos para cargar en el EMR
const initialConsultation = {
  date: '2023-09-10',
  provider: 'Dr. García (Fisioterapeuta)',
  chiefComplaint:
    'Dolor en rodilla derecha al subir/bajar escaleras y tras actividad física. Dolor lumbar al mantener posición de pie prolongada.',
  currentIllness:
    'Paciente refiere inicio de dolor en rodilla hace aprox. 8 meses, inicialmente tras aumentar intensidad en entrenamiento de running (de 5k a 10k). Dolor lumbar de larga evolución (>3 años) que ha empeorado en los últimos 6 meses coincidiendo con cambio a trabajo sedentario.',
  functionalLimitations: [
    'Incapacidad para correr distancias >1km',
    'Dificultad para subir/bajar escaleras sin dolor',
    'Limitación para mantener posición de pie >30 min',
    'Despertares nocturnos ocasionales por dolor lumbar',
  ],
};

// Evaluación física inicial
const initialAssessment = {
  vitalSigns: {
    bloodPressure: '118/75 mmHg',
    heartRate: '72 bpm',
    respiratoryRate: '14 rpm',
    temperature: '36.6°C',
    height: '168 cm',
    weight: '72 kg',
    bmi: '25.5 kg/m²',
  },
  painAssessment: {
    location: [
      'Rodilla derecha (cara anterior)',
      'Región lumbar (L4-L5 bilateral)',
    ],
    intensity: {
      'Rodilla derecha': '6/10 durante actividad, 3/10 en reposo',
      'Región lumbar': '5/10 en bipedestación prolongada, 2/10 en reposo',
    },
    quality: {
      'Rodilla derecha': 'Punzante, bien localizado inferior a rótula',
      'Región lumbar': 'Sordo, difuso con irradiación ocasional a glúteo',
    },
    aggravating: [
      'Subir/bajar escaleras',
      'Sentadillas',
      'Posición mantenida de pie',
      'Largas jornadas sentada',
    ],
    relieving: [
      'Reposo',
      'Hielo local en rodilla',
      'Calor local en lumbar',
      'Cambios de posición frecuentes',
    ],
    vas: 'Rodilla: 6/10, Lumbar: 5/10',
    nps: 'Rodilla: 6, Lumbar: 5',
  },
  rangeOfMotion: {
    'Rodilla derecha': {
      flexión: '125° (normal 135°)',
      extensión: '0° (normal)',
      observaciones: 'Dolor al final de la flexión',
    },
    'Rodilla izquierda': {
      flexión: '135° (normal)',
      extensión: '0° (normal)',
      observaciones: 'Sin hallazgos',
    },
    'Columna lumbar': {
      flexión: '70% de lo normal',
      extensión: '60% de lo normal',
      lateroflexión_derecha: '80% de lo normal',
      lateroflexión_izquierda: '80% de lo normal',
      rotación_derecha: '90% de lo normal',
      rotación_izquierda: '90% de lo normal',
      observaciones: 'Dolor al final de la extensión',
    },
  },
  muscleStrength: {
    'Cuádriceps derecho': '3/5',
    'Cuádriceps izquierdo': '4/5',
    'Isquiotibiales derechos': '4/5',
    'Isquiotibiales izquierdos': '4/5',
    'Musculatura paravertebral': '3/5',
    'Transverso abdominal': '2/5',
    'Glúteo mayor': '3/5',
    'Glúteo medio': '3/5',
  },
  functionalTests: [
    {
      name: 'Test de Clarke',
      result: 'Positivo en rodilla derecha',
      interpretation: 'Sugestivo de síndrome patelofemoral',
    },
    {
      name: 'Test de compresión patelar',
      result: 'Positivo en rodilla derecha',
      interpretation: 'Sugiere irritación patelofemoral',
    },
    {
      name: 'Schober test',
      result: '3.5 cm (normal >5cm)',
      interpretation: 'Movilidad lumbar reducida',
    },
    {
      name: 'SLRT (Straight Leg Raise Test)',
      result: 'Negativo bilateral',
      interpretation: 'No signos de compresión radicular',
    },
  ],
  posturalAssessment: {
    anterior: {
      'Alineación de rodillas': 'Ligero valgo bilateral',
      Rótulas: 'Ligera lateralización de rótula derecha',
      Pies: 'Tendencia a pronación bilateral',
    },
    lateral: {
      'Curvaturas espinales': 'Hiperlordosis lumbar leve',
      Pelvis: 'Anteversión pélvica',
      Rodillas: 'Recurvatum leve bilateral',
    },
    posterior: {
      Escápulas: 'Ligera elevación de escápula derecha',
      Pelvis: 'EIPS niveladas',
      'Pliegues glúteos': 'Simétricos',
    },
  },
  gaitAssessment: {
    pattern:
      'Marcha antiálgica con ligera descarga de peso en miembro inferior derecho durante fase de apoyo',
    deviations: [
      'Disminución de fase de apoyo en MI derecho',
      'Leve asimetría en balanceo de brazos',
    ],
    assistiveDevices: 'Ninguno',
  },
};

// Plan de tratamiento inicial
const initialTreatmentPlan = {
  diagnosis: {
    primary: 'Tendinopatía rotuliana derecha',
    secondary: [
      'Lumbalgia mecánica crónica',
      'Debilidad muscular estabilizadora',
    ],
  },
  goals: {
    shortTerm: [
      'Reducir dolor en rodilla a 3/10 en 3 semanas',
      'Aumentar fuerza de cuádriceps a 4/5 en 4 semanas',
      'Reducir dolor lumbar a 2/10 en 3 semanas',
      'Mejorar activación de musculatura estabilizadora core',
    ],
    longTerm: [
      'Retorno a actividad deportiva recreativa sin dolor en 3 meses',
      'Independencia en manejo de síntomas mediante programa de ejercicios',
      'Prevenir recidivas mediante educación postural y ergonomía',
    ],
  },
  interventions: [
    {
      type: 'exercise',
      name: 'Ejercicios excéntricos para cuádriceps',
      description: 'Sentadilla excéntrica en plano inclinado a 25°',
      dosage: '3 series x 15 repeticiones, 3 veces/semana',
      progression: 'Iniciar con peso corporal, progresar con pesos',
      evidenceLevel: 'A',
    },
    {
      type: 'exercise',
      name: 'Estabilización lumbar',
      description: 'Ejercicios de control motor para core',
      dosage: 'Diario, series progresivas',
      progression: 'Desde activación básica a ejercicios funcionales',
      evidenceLevel: 'B',
    },
    {
      type: 'manual',
      name: 'Terapia manual columna lumbar',
      description: 'Técnicas de manipulación y movilización',
      dosage: '2 sesiones/semana por 3 semanas',
      evidenceLevel: 'B',
    },
    {
      type: 'physical',
      name: 'Electroterapia analgésica',
      description: 'TENS convencional',
      dosage: '20 min/sesión, 2 veces/semana por 3 semanas',
      evidenceLevel: 'C',
    },
  ],
  homeProgram: [
    {
      name: 'Ejercicios excéntricos domiciliarios',
      description: 'Sentadilla con apoyo en pared, descenso lento',
      frequency: '3 veces/semana',
      sets: '3 series x 15 repeticiones',
    },
    {
      name: 'Activación transverso',
      description: 'Ejercicio de succión abdominal en diferentes posiciones',
      frequency: 'Diario',
      sets: '5-10 contracciones sostenidas 10 segundos',
    },
  ],
  progressMeasures: [
    'Escala NPS de dolor semanal',
    'Test manual de fuerza cada 2 semanas',
    'Rango de movimiento cada 2 semanas',
    'Cuestionario funcional inicial, medio y final',
  ],
};

// Notas de progreso simuladas
const progressNotes = [
  {
    date: '2023-09-17',
    sessionNumber: 1,
    subjective:
      'Paciente refiere dolor de rodilla 6/10 y lumbar 5/10. Refiere dificultad con ejercicios en casa.',
    objective:
      'Se observa compensación con cadera al realizar ejercicios. Range of motion igual que evaluación inicial.',
    assessment: 'Progresando según lo esperado. Necesita ajustes en técnica.',
    plan: 'Continuar con plan inicial. Se refuerza técnica de ejercicios. Se añade taping rotuliano.',
  },
  {
    date: '2023-09-24',
    sessionNumber: 2,
    subjective:
      'Paciente refiere leve mejoría en dolor de rodilla (5/10) tras aplicación de taping. Dolor lumbar sin cambios.',
    objective:
      'Mejor ejecución de ejercicios. Aumento leve en fuerza de cuádriceps (3+/5).',
    assessment: 'Respuesta positiva a taping. Progresión lenta pero favorable.',
    plan: 'Continuar plan. Ajustar carga en ejercicios excéntricos. Enfatizar programa lumbar.',
  },
  {
    date: '2023-10-01',
    sessionNumber: 3,
    subjective:
      'Dolor de rodilla 4/10 durante actividad, 2/10 en reposo. Dolor lumbar 4/10.',
    objective:
      'Fuerza cuádriceps 4/5. Mejor activación transverso. ROM lumbar mejorado 10%.',
    assessment: 'Buena evolución. Ritmo de progreso adecuado.',
    plan: 'Añadir ejercicios propioceptivos para rodilla. Progresar en ejercicios de estabilización.',
  },
  {
    date: '2023-10-08',
    sessionNumber: 4,
    subjective:
      'Refiere mejoría notable. Dolor rodilla 3/10, lumbar 3/10. Sin dolor al subir escaleras.',
    objective:
      'Fuerza mantenida 4/5. Mejor control en ejercicios. Test de Clarke levemente positivo.',
    assessment: 'Evolución favorable. Cumpliendo objetivos a corto plazo.',
    plan: 'Inicio de programa de retorno gradual a actividad deportiva. Espaciar sesiones a 1/semana.',
  },
];

// Función para cargar datos preconfigurados en el EMR
function loadSamplePatientData() {
  const emr = JSON.parse(JSON.stringify(emrStructure)); // Clonar estructura

  // Cargar datos del paciente
  emr.patientInfo.personalData = samplePatient.personalData;
  emr.patientInfo.medicalHistory = samplePatient.medicalHistory;

  // Cargar consulta inicial
  emr.consultations.push(initialConsultation);

  // Cargar evaluación física
  emr.physicalAssessment = initialAssessment;

  // Cargar plan de tratamiento
  emr.treatmentPlan = initialTreatmentPlan;

  // Cargar notas de progreso
  emr.progressNotes = progressNotes;

  return emr;
}

// Función para mostrar el EMR en formato estructurado
function displayEMR(emr) {
  console.log('\n============= EMR DE FISIOTERAPIA =============\n');

  // Información del paciente
  console.log('INFORMACIÓN DEL PACIENTE:');
  console.log(`ID: ${emr.patientInfo.personalData.id}`);
  console.log(
    `Nombre: ${emr.patientInfo.personalData.firstName} ${emr.patientInfo.personalData.lastName}`
  );
  console.log(
    `Fecha de nacimiento: ${emr.patientInfo.personalData.birthDate} (${calculateAge(emr.patientInfo.personalData.birthDate)} años)`
  );
  console.log(`Género: ${emr.patientInfo.personalData.gender}`);
  console.log('\nCONTACTO:');
  console.log(`Teléfono: ${emr.patientInfo.personalData.contact.phone}`);
  console.log(`Email: ${emr.patientInfo.personalData.contact.email}`);
  console.log(`Dirección: ${emr.patientInfo.personalData.contact.address}`);

  // Historia médica
  console.log('\nHISTORIA MÉDICA:');
  console.log(
    `Condiciones: ${emr.patientInfo.medicalHistory.conditions.join(', ')}`
  );
  console.log(
    `Medicaciones: ${emr.patientInfo.medicalHistory.medications.join(', ')}`
  );
  console.log(
    `Cirugías: ${emr.patientInfo.medicalHistory.surgeries.join(', ')}`
  );
  console.log(
    `Alergias: ${emr.patientInfo.medicalHistory.allergies.join(', ')}`
  );

  // Consulta inicial
  console.log('\nCONSULTA INICIAL:');
  const consultation = emr.consultations[0]; // Tomamos la primera consulta
  console.log(`Fecha: ${consultation.date}`);
  console.log(`Profesional: ${consultation.provider}`);
  console.log(`Motivo de consulta: ${consultation.chiefComplaint}`);
  console.log(`Enfermedad actual: ${consultation.currentIllness}`);
  console.log('\nLimitaciones funcionales:');
  consultation.functionalLimitations.forEach((limitation) => {
    console.log(`- ${limitation}`);
  });

  // Evaluación física
  console.log('\nEVALUACIÓN FÍSICA:');
  console.log('\nSignos vitales:');
  const vitalSigns = emr.physicalAssessment.vitalSigns;
  console.log(`Presión arterial: ${vitalSigns.bloodPressure}`);
  console.log(`Frecuencia cardíaca: ${vitalSigns.heartRate}`);
  console.log(
    `Talla: ${vitalSigns.height}, Peso: ${vitalSigns.weight}, IMC: ${vitalSigns.bmi}`
  );

  console.log('\nEvaluación del dolor:');
  console.log(
    `Localización: ${emr.physicalAssessment.painAssessment.location.join(', ')}`
  );
  console.log('Intensidad:');
  Object.entries(emr.physicalAssessment.painAssessment.intensity).forEach(
    ([location, intensity]) => {
      console.log(`- ${location}: ${intensity}`);
    }
  );

  console.log('\nRango de movimiento:');
  Object.entries(emr.physicalAssessment.rangeOfMotion).forEach(
    ([joint, motion]) => {
      console.log(`- ${joint}:`);
      Object.entries(motion).forEach(([movement, value]) => {
        console.log(`  ${movement}: ${value}`);
      });
    }
  );

  console.log('\nFuerza muscular:');
  Object.entries(emr.physicalAssessment.muscleStrength).forEach(
    ([muscle, strength]) => {
      console.log(`- ${muscle}: ${strength}`);
    }
  );

  console.log('\nTests funcionales:');
  emr.physicalAssessment.functionalTests.forEach((test) => {
    console.log(`- ${test.name}: ${test.result} (${test.interpretation})`);
  });

  // Plan de tratamiento
  console.log('\nPLAN DE TRATAMIENTO:');
  console.log(`Diagnóstico principal: ${emr.treatmentPlan.diagnosis.primary}`);
  console.log(
    `Diagnósticos secundarios: ${emr.treatmentPlan.diagnosis.secondary.join(', ')}`
  );

  console.log('\nObjetivos a corto plazo:');
  emr.treatmentPlan.goals.shortTerm.forEach((goal) => {
    console.log(`- ${goal}`);
  });

  console.log('\nObjetivos a largo plazo:');
  emr.treatmentPlan.goals.longTerm.forEach((goal) => {
    console.log(`- ${goal}`);
  });

  console.log('\nIntervenciones:');
  emr.treatmentPlan.interventions.forEach((intervention) => {
    console.log(
      `- ${intervention.name} (Nivel evidencia: ${intervention.evidenceLevel})`
    );
    console.log(`  ${intervention.description}`);
    console.log(`  Dosificación: ${intervention.dosage}`);
  });

  console.log('\nPrograma domiciliario:');
  emr.treatmentPlan.homeProgram.forEach((exercise) => {
    console.log(`- ${exercise.name}: ${exercise.description}`);
    console.log(
      `  Frecuencia: ${exercise.frequency}, Series: ${exercise.sets}`
    );
  });

  // Notas de progreso
  console.log('\nNOTAS DE PROGRESO:');
  emr.progressNotes.forEach((note) => {
    console.log(`\nSesión #${note.sessionNumber} (${note.date}):`);
    console.log(`Subjetivo: ${note.subjective}`);
    console.log(`Objetivo: ${note.objective}`);
    console.log(`Evaluación: ${note.assessment}`);
    console.log(`Plan: ${note.plan}`);
  });

  console.log('\n==============================================\n');
}

// Función para simular preguntas del asistente IA basadas en el EMR
function getVirtualAssistantQuestions(emr) {
  // Preguntas sobre datos faltantes para completar la anamnesis
  const anamnesisQuestions = [
    '¿El paciente ha recibido tratamientos previos para estas condiciones?',
    '¿Qué actividades deportivas o de ocio realizaba antes de la lesión?',
    '¿Hay posturas o movimientos específicos que aumenten significativamente el dolor?',
    '¿El dolor interrumpe el sueño? ¿Con qué frecuencia?',
    '¿Cómo describiría su nivel de estrés y podría estar contribuyendo a sus síntomas?',
  ];

  // Preguntas sobre evaluación adicional
  const evaluationQuestions = [
    '¿Se ha realizado una evaluación de la técnica de carrera antes de la lesión?',
    '¿Se ha evaluado el calzado deportivo y su adecuación?',
    '¿Se ha evaluado la flexibilidad de cadenas musculares anterior y posterior?',
    '¿Ha considerado evaluar el control neuromotor del complejo lumbopélvico?',
    '¿Sería relevante realizar un análisis de la pisada dada la pronación observada?',
  ];

  // Preguntas sobre el plan de tratamiento
  const treatmentQuestions = [
    '¿Ha considerado añadir entrenamiento propioceptivo en superficies inestables?',
    '¿La paciente podría beneficiarse de un programa de ejercicios de control motor específico?',
    '¿Sería adecuado implementar técnicas de liberación miofascial para la banda iliotibial?',
    '¿Ha considerado la punción seca como complemento para los puntos gatillo identificados?',
    '¿Un programa de estiramientos específicos para psoas e isquiotibiales podría complementar el tratamiento?',
  ];

  // Preguntas basadas en la evidencia
  const evidenceBasedQuestions = [
    'Según la literatura reciente, ¿ha considerado ejercicios HSR (Heavy Slow Resistance) como alternativa a los excéntricos tradicionales?',
    'La evidencia actual sugiere que el entrenamiento isométrico puede proporcionar alivio del dolor a corto plazo, ¿consideraría incluirlo?',
    '¿Ha evaluado la posibilidad de utilizar ondas de choque como tratamiento complementario dada la evidencia de nivel B para tendinopatía rotuliana?',
    'Estudios recientes muestran beneficios de la educación en neurociencia del dolor para lumbalgia crónica, ¿la incluiría en su abordaje?',
    'La evidencia sugiere que los ejercicios de control motor son más efectivos que los ejercicios generales para lumbalgia, ¿ha considerado especificar más el programa?',
  ];

  return {
    anamnesis: anamnesisQuestions,
    evaluation: evaluationQuestions,
    treatment: treatmentQuestions,
    evidenceBased: evidenceBasedQuestions,
  };
}

// Función para simular interacción con el asistente virtual
function simulateVirtualAssistant(emr) {
  console.log('\n====== ASISTENTE VIRTUAL DE FISIOTERAPIA ======\n');
  console.log(
    'Asistente: Bienvenido al Asistente Virtual de Fisioterapia. He analizado el EMR actual y tengo algunas sugerencias y preguntas para completar la evaluación y el plan de tratamiento.'
  );

  // Obtener preguntas del asistente
  const questions = getVirtualAssistantQuestions(emr);

  console.log('\nPREGUNTAS PARA COMPLETAR LA ANAMNESIS:');
  questions.anamnesis.forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });

  console.log('\nPREGUNTAS PARA COMPLETAR LA EVALUACIÓN:');
  questions.evaluation.forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });

  console.log('\nSUGERENCIAS PARA EL PLAN DE TRATAMIENTO:');
  questions.treatment.forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });

  console.log('\nPREGUNTAS BASADAS EN EVIDENCIA CIENTÍFICA:');
  questions.evidenceBased.forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });

  // Simulación de recomendaciones basadas en evidencia
  console.log('\nRECOMENDACIONES BASADAS EN EVIDENCIA:');
  console.log('1. EJERCICIOS EXCÉNTRICOS EN TENDINOPATÍA ROTULIANA:');
  console.log('   Nivel de evidencia: A');
  console.log(
    '   Fuentes: Malliaras P, et al. Sports Med. 2019; Lorenzen J, et al. BJSM. 2021'
  );
  console.log(
    '   Recomendación: Incluir programa de sentadillas excéntricas en plano inclinado a 25°, 3x15 repeticiones, 3 veces/semana'
  );

  console.log('\n2. TERAPIA MANUAL PARA LUMBALGIA CRÓNICA:');
  console.log('   Nivel de evidencia: B');
  console.log(
    '   Fuentes: Coulter ID, et al. Manual Therapy. 2022; Bernal-Utrera C, et al. Physical Therapy. 2021'
  );
  console.log(
    '   Recomendación: Combinar técnicas HVLA y movilizaciones segmentarias 1-2 veces/semana, junto con ejercicios de estabilización'
  );

  console.log('\n3. ENTRENAMIENTO PROPIOCEPTIVO EN PATELOFEMORAL:');
  console.log('   Nivel de evidencia: B');
  console.log('   Fuentes: Röijezon U, et al. Manual Therapy. 2020');
  console.log(
    '   Recomendación: Añadir entrenamiento de equilibrio unipodal, progresando de superficie estable a inestable'
  );

  console.log('\n============================================\n');
}

// Función para calcular edad
function calculateAge(birthDateString) {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// Función para simular la entrada de texto libre del fisioterapeuta
function simulateFreeTextEntry() {
  console.log('=== DEMOSTRACIÓN DE ENTRADA DE TEXTO LIBRE ===');
  console.log(
    'En el EMR real, el fisioterapeuta podría escribir notas en texto libre'
  );
  console.log(
    'El asistente virtual procesaría este texto y lo organizaría en las secciones adecuadas'
  );
  console.log('A continuación, una simulación de este proceso:\n');

  console.log('EJEMPLO DE ENTRADA DE TEXTO LIBRE:');
  const freeTextExample =
    'Paciente refiere mejoría del 50% en dolor de rodilla tras 4 sesiones. ' +
    'Ahora puede subir escaleras con mínima molestia. Aún presenta dolor 3/10 al correr. ' +
    'Fuerza de cuádriceps ha mejorado a 4+/5. Continuar con programa actual y añadir ejercicios ' +
    'funcionales. Próxima sesión en 1 semana.';

  console.log(freeTextExample);

  console.log('\nASISTENTE VIRTUAL: TEXTO ORGANIZADO EN ESTRUCTURA EMR:');
  console.log('SUBJETIVO:');
  console.log('- Mejoría del 50% en dolor de rodilla');
  console.log('- Puede subir escaleras con mínima molestia');
  console.log('- Aún presenta dolor 3/10 al correr');

  console.log('\nOBJETIVO:');
  console.log('- Fuerza de cuádriceps: 4+/5');

  console.log('\nPLAN:');
  console.log('- Continuar con programa actual');
  console.log('- Añadir ejercicios funcionales');
  console.log('- Próxima sesión en 1 semana');

  console.log('\nBASADO EN ESTA ENTRADA, EL ASISTENTE SUGIERE:');
  console.log(
    '1. ¿Desea documentar un valor específico de ROM para la rodilla?'
  );
  console.log(
    '2. ¿Ha considerado reducir la frecuencia de terapia manual dada la mejoría?'
  );
  console.log('3. ¿Qué ejercicios funcionales específicos planea introducir?');
  console.log(
    '4. ¿Desea actualizar los objetivos de tratamiento basados en este progreso?'
  );
}

// Función principal para ejecutar la simulación
function main() {
  console.log('=== SIMULADOR DE EMR ESTRUCTURADO PARA FISIOTERAPIA ===');
  console.log(
    'Este script simula un EMR de fisioterapia con integración de asistente virtual\n'
  );

  // Cargar datos de ejemplo
  const emr = loadSamplePatientData();

  // Mostrar el EMR
  displayEMR(emr);

  // Simular interacción con asistente virtual
  simulateVirtualAssistant(emr);

  // Mostrar simulación de entrada de texto libre
  simulateFreeTextEntry();

  // Finalizar
  console.log('\n=== SIMULACIÓN COMPLETADA ===');
}

// Ejecutar simulación
main();
