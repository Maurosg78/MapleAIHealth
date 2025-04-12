// Enhanced Physiotherapy EMR Simulator with AI Assistant
const patientDB = [
  {
    id: 'PT-2023-001',
    nombre: 'María López',
    edad: 42,
    sexo: 'femenino',
    fechaNacimiento: '1981-05-12',
    historiaClinica: {
      antecedentes: ['Hipertensión controlada', 'Cirugía meniscal rodilla derecha (2018)'],
      medicacionActual: ['Enalapril 10mg/día'],
      alergias: ['Penicilina']
    },
    consulta: {
      motivoConsulta: 'Dolor cervical y cefalea tensional',
      fechaInicio: '2023-11-05',
      intensidadDolor: 7,
      localizacion: 'Región cervical posterior y temporal bilateral',
      caracteristicas: 'Dolor tensivo que aumenta con estrés y trabajo prolongado en computadora',
      factoresAgravantes: ['Postura prolongada frente a computadora', 'Estrés laboral'],
      factoresAliviantes: ['Descanso', 'Aplicación local de calor']
    },
    evaluacionFisica: {
      postural: 'Anteriorización cervical, elevación hombro derecho, protracción escapular bilateral',
      movimientoArticular: {
        flexionCervical: {valor: '30°', dolor: 'Moderado al final del rango'},
        extensionCervical: {valor: '25°', dolor: 'Moderado durante el movimiento'},
        rotacionDerecha: {valor: '45°', dolor: 'Leve al final'},
        rotacionIzquierda: {valor: '50°', dolor: 'Ausente'},
        inclinacionDerecha: {valor: '30°', dolor: 'Leve durante el movimiento'},
        inclinacionIzquierda: {valor: '28°', dolor: 'Leve durante el movimiento'}
      },
      palpacion: 'Puntos gatillo activos en trapecio superior bilateral, más dolorosos a derecha. Tensión elevada en ECOM bilateral',
      fuerzaMuscular: {
        flexoresCervicales: '4/5',
        extensoresCervicales: '4/5',
        trapecioBajo: '3+/5',
        serratoAnterior: '3+/5'
      },
      testEspecificos: [
        {nombre: 'Test de compresión cervical', resultado: 'Negativo'},
        {nombre: 'Test de distracción cervical', resultado: 'Positivo (alivio de síntomas)'},
        {nombre: 'Test de Spurling', resultado: 'Negativo'}
      ]
    },
    diagnostico: 'Cervicalgia mecánica con disfunción postural y cefalea tensional asociada',
    planTratamiento: {
      objetivosCortoplazo: [
        'Reducir dolor cervical en 50% en 2 semanas',
        'Mejorar rango de movimiento cervical en todos los planos',
        'Reducir frecuencia de cefaleas tensionales'
      ],
      objetivosLargoplazo: [
        'Retorno a actividades laborales sin dolor',
        'Mantenimiento de postura adecuada durante jornada laboral',
        'Automanejo de síntomas a través de ejercicios domiciliarios'
      ],
      intervenciones: [
        'Terapia manual: Liberación miofascial de trapecio superior y ECOM',
        'Estiramientos activos asistidos de musculatura cervical',
        'Ejercicios de fortalecimiento de flexores cervicales profundos',
        'Ejercicios de corrección postural para columna cervical y cintura escapular',
        'Educación en ergonomía para puesto de trabajo'
      ],
      frecuencia: '2 sesiones semanales por 3 semanas, luego reevaluación'
    },
    notasProgreso: [
      {
        fecha: '2023-11-10',
        sesion: 1,
        intervenciones: 'Evaluación inicial. Terapia manual en trapecio superior y ECOM. Ejercicios de movilidad cervical activa asistida.',
        respuesta: 'Reducción del dolor post-sesión a 5/10. Mejoría en sensación de tensión muscular.',
        planSiguienteSesion: 'Continuar terapia manual. Iniciar entrenamiento de flexores profundos.'
      }
    ]
  },
  {
    id: 'PT-2023-002',
    nombre: 'Carlos Ramírez',
    edad: 35,
    sexo: 'masculino',
    fechaNacimiento: '1988-09-23',
    historiaClinica: {
      antecedentes: ['Deportista recreacional (fútbol 2 veces/semana)', 'Sin antecedentes quirúrgicos'],
      medicacionActual: ['Ibuprofeno 400mg según necesidad'],
      alergias: ['Ninguna conocida']
    },
    consulta: {
      motivoConsulta: 'Dolor agudo en rodilla derecha',
      fechaInicio: '2023-10-28',
      intensidadDolor: 8,
      localizacion: 'Cara anterior y medial de rodilla derecha',
      caracteristicas: 'Dolor punzante que aumenta al subir/bajar escaleras y durante carrera',
      factoresAgravantes: ['Sentadillas', 'Correr', 'Descenso de escaleras'],
      factoresAliviantes: ['Reposo', 'Elevación', 'Hielo', 'Antiinflamatorios']
    },
    evaluacionFisica: {
      postural: 'Genu valgo bilateral, más pronunciado en derecha. Rotación externa tibia derecha.',
      movimientoArticular: {
        flexionRodilla: {valor: '120°', dolor: 'Severo a partir de 90°'},
        extensionRodilla: {valor: '0°', dolor: 'Leve en extensión completa'}
      },
      palpacion: 'Dolor a la palpación en región medial de rodilla, zona de inserción del ligamento colateral medial y tendón anserino',
      fuerzaMuscular: {
        cuadriceps: '4/5 (limitado por dolor)',
        isquiotibiales: '4+/5',
        gluteoMedio: '3+/5'
      },
      testEspecificos: [
        {nombre: 'Test de McMurray', resultado: 'Positivo para compartimento medial'},
        {nombre: 'Test de Lachman', resultado: 'Negativo'},
        {nombre: 'Test de estrés varo/valgo', resultado: 'Dolor leve en estrés valgo, sin inestabilidad'}
      ],
      imagenes: 'RM rodilla derecha: Lesión grado II menisco medial, sin compromiso de ligamentos'
    },
    diagnostico: 'Lesión meniscal medial grado II de rodilla derecha',
    planTratamiento: {
      objetivosCortoplazo: [
        'Reducir dolor y edema en 1-2 semanas',
        'Mejorar rango de movimiento indoloro',
        'Iniciar fortalecimiento muscular progresivo'
      ],
      objetivosLargoplazo: [
        'Retorno progresivo a actividad deportiva en 8-12 semanas',
        'Prevención de recidivas mediante fortalecimiento y propiocepción',
        'Corrección de factores biomecánicos predisponentes'
      ],
      intervenciones: [
        'Terapia manual para movilización articular',
        'RICE en fase inicial (Reposo, Hielo, Compresión, Elevación)',
        'Ejercicios isométricos progresando a dinámicos para cuádriceps',
        'Fortalecimiento de cadena cinética cerrada',
        'Entrenamiento propioceptivo progresivo',
        'Vendaje neuromuscular para soporte articular'
      ],
      frecuencia: '3 veces por semana durante 4 semanas, luego reevaluación'
    },
    notasProgreso: [
      {
        fecha: '2023-11-02',
        sesion: 1,
        intervenciones: 'Evaluación inicial. Crioterapia. Movilización patelar. Ejercicios isométricos de cuádriceps.',
        respuesta: 'Dolor post-sesión 6/10. Ligera reducción de edema periarticular.',
        planSiguienteSesion: 'Continuar con crioterapia. Progresar a ejercicios activos asistidos.'
      }
    ]
  }
];

// Función para simular el asistente de IA para fisioterapia
function fisioCopilot(casoClinico) {
  // Análisis de contexto clínico
  const analisisContexto = [];
  
  // Análisis basado en diagnóstico
  if (casoClinico.diagnostico.includes('Cervicalgia')) {
    analisisContexto.push(
      'Cervicalgia mecánica probablemente asociada a factores posturales y ergonómicos',
      'Presencia de puntos gatillo en trapecio superior que contribuyen a la cefalea tensional',
      'Debilidad de musculatura estabilizadora cervical y escapular'
    );
  } else if (casoClinico.diagnostico.includes('meniscal')) {
    analisisContexto.push(
      'Lesión meniscal medial grado II confirmada por resonancia magnética',
      'Debilidad muscular en cadena cinética de miembro inferior derecho',
      'Alteración biomecánica con genu valgo que predispone a sobrecarga de compartimento medial'
    );
  }
  
  // Sugerencias de preguntas para anamnesis
  const preguntasAnamnesis = [];
  if (casoClinico.diagnostico.includes('Cervicalgia')) {
    preguntasAnamnesis.push(
      '¿Cuántas horas al día pasa frente a la computadora?',
      '¿Ha notado relación entre el estrés laboral y la intensidad de la cefalea?',
      '¿Qué estrategias ha utilizado previamente para manejar episodios similares?',
      '¿Existe algún movimiento o postura específica que reproduzca el dolor?'
    );
  } else if (casoClinico.diagnostico.includes('meniscal')) {
    preguntasAnamnesis.push(
      '¿Recuerda algún mecanismo específico de lesión (torsión, impacto)?',
      '¿Ha experimentado episodios de bloqueo o "traba" en la rodilla?',
      '¿Cuál es su objetivo deportivo a mediano plazo?',
      '¿Ha tenido lesiones previas en esta rodilla?'
    );
  }
  
  // Sugerencias de evaluación
  const sugerenciasEvaluacion = [];
  if (casoClinico.diagnostico.includes('Cervicalgia')) {
    sugerenciasEvaluacion.push(
      'Evaluar estabilidad de flexores cervicales profundos con test de flexión craneocervical',
      'Valorar control motor escapular con test de deslizamiento lateral',
      'Considerar test neurodinámicos para descartar compromiso radicular',
      'Evaluar umbral de dolor a la presión en músculos suboccipitales'
    );
  } else if (casoClinico.diagnostico.includes('meniscal')) {
    sugerenciasEvaluacion.push(
      'Complementar con test de Thessaly para confirmar compromiso meniscal',
      'Evaluar control dinámico de rodilla en sentadilla monopodal',
      'Valorar movilidad de cadera ipsilateral como factor contribuyente',
      'Realizar análisis de pisada para identificar alteraciones biomecánicas'
    );
  }
  
  // Recomendaciones de tratamiento con evidencia científica
  const recomendacionesTratamiento = [];
  if (casoClinico.diagnostico.includes('Cervicalgia')) {
    recomendacionesTratamiento.push(
      {
        recomendacion: 'Entrenamiento de resistencia de flexores cervicales profundos',
        evidencia: 'Nivel A - Ensayos clínicos aleatorizados muestran reducción significativa del dolor cervical y cefalea asociada',
        referencia: 'Jull et al. (2019). Cervical flexor muscle training reduces pain, anxiety, and depression levels in patients with chronic neck pain by a clinically important amount. Journal of Physiotherapy, 65(1), 28-33.'
      },
      {
        recomendacion: 'Terapia manual combinada con ejercicio terapéutico',
        evidencia: 'Nivel A - Meta-análisis muestran superioridad de abordaje combinado frente a terapias aisladas',
        referencia: 'Gross et al. (2015). Manipulation and mobilisation for neck pain contrasted against an inactive control or another active treatment. Cochrane Database of Systematic Reviews, (9).'
      },
      {
        recomendacion: 'Educación en ergonomía laboral y pausas activas',
        evidencia: 'Nivel B - Estudios observacionales muestran reducción en recurrencia de síntomas',
        referencia: 'Johnston et al. (2018). Office ergonomics training and a sit-stand workstation: Effects on musculoskeletal and visual symptoms and performance of office workers. Applied Ergonomics, 69, 10-18.'
      }
    );
  } else if (casoClinico.diagnostico.includes('meniscal')) {
    recomendacionesTratamiento.push(
      {
        recomendacion: 'Programa de ejercicios progresivos de fortalecimiento y control neuromuscular',
        evidencia: 'Nivel A - Ensayos clínicos muestran resultados comparables a intervención quirúrgica en lesiones meniscales degenerativas',
        referencia: 'Kise et al. (2016). Exercise therapy versus arthroscopic partial meniscectomy for degenerative meniscal tear in middle aged patients. BMJ, 354, i3740.'
      },
      {
        recomendacion: 'Entrenamiento neuromuscular con ejercicios de cadena cinética cerrada',
        evidencia: 'Nivel A - Revisiones sistemáticas demuestran mejora en función y reducción de dolor',
        referencia: 'Lichtenberg et al. (2018). The effects of neuromuscular exercise on medial meniscal pathology: A biomechanical analysis. Journal of Orthopaedic Research, 36(8), 2280-2287.'
      },
      {
        recomendacion: 'Corrección de patrones de movimiento alterados mediante feedback visual',
        evidencia: 'Nivel B - Estudios controlados muestran reducción en carga compresiva de compartimento medial',
        referencia: 'Bennell et al. (2017). Neuromuscular versus quadriceps strengthening exercise in people with medial knee osteoarthritis and varus malalignment. Arthritis & Rheumatology, 69(5), 943-951.'
      }
    );
  }
  
  // Métricas sugeridas para evaluar progreso
  const metricasProgreso = [];
  if (casoClinico.diagnostico.includes('Cervicalgia')) {
    metricasProgreso.push(
      'Escala Numérica de Dolor (0-10) para cervicalgia y cefalea',
      'Neck Disability Index (NDI) - objetivo: reducción mínima de 7 puntos',
      'Test de resistencia de flexores cervicales profundos - objetivo: mantener 10 segundos en nivel 4 de presión',
      'Frecuencia semanal de cefaleas - objetivo: reducción del 50%'
    );
  } else if (casoClinico.diagnostico.includes('meniscal')) {
    metricasProgreso.push(
      'Knee Injury and Osteoarthritis Outcome Score (KOOS) - objetivo: mejoría de 15 puntos',
      'Single Leg Hop Test - objetivo: 85% de simetría con lado no afecto',
      'Y-Balance Test - objetivo: mejora de 8% en distancia anterior',
      'Dolor durante actividades funcionales (0-10) - objetivo: <3/10'
    );
  }
  
  return {
    analisisContexto,
    preguntasAnamnesis,
    sugerenciasEvaluacion,
    recomendacionesTratamiento,
    metricasProgreso
  };
}

// Función para mostrar el EMR con las recomendaciones del asistente
function mostrarEMRConAsistente(paciente) {
  console.log('\n=====================================================');
  console.log('             REGISTRO MÉDICO ELECTRÓNICO             ');
  console.log('=====================================================\n');
  
  // Información del paciente
  console.log('INFORMACIÓN DEL PACIENTE:');
  console.log(`ID: ${paciente.id}`);
  console.log(`Nombre: ${paciente.nombre}`);
  console.log(`Edad: ${paciente.edad} años`);
  console.log(`Sexo: ${paciente.sexo}`);
  console.log(`Fecha de nacimiento: ${paciente.fechaNacimiento}`);
  console.log('\n');
  
  // Historia clínica
  console.log('HISTORIA CLÍNICA:');
  console.log(`Antecedentes: ${paciente.historiaClinica.antecedentes.join(', ')}`);
  console.log(`Medicación actual: ${paciente.historiaClinica.medicacionActual.join(', ')}`);
  console.log(`Alergias: ${paciente.historiaClinica.alergias.join(', ')}`);
  console.log('\n');
  
  // Consulta inicial
  console.log('CONSULTA INICIAL:');
  console.log(`Motivo de consulta: ${paciente.consulta.motivoConsulta}`);
  console.log(`Fecha de inicio: ${paciente.consulta.fechaInicio}`);
  console.log(`Intensidad del dolor (0-10): ${paciente.consulta.intensidadDolor}`);
  console.log(`Localización: ${paciente.consulta.localizacion}`);
  console.log(`Características: ${paciente.consulta.caracteristicas}`);
  console.log(`Factores agravantes: ${paciente.consulta.factoresAgravantes.join(', ')}`);
  console.log(`Factores aliviantes: ${paciente.consulta.factoresAliviantes.join(', ')}`);
  console.log('\n');
  
  // Evaluación física
  console.log('EVALUACIÓN FÍSICA:');
  console.log(`Evaluación postural: ${paciente.evaluacionFisica.postural}`);
  
  console.log('Rango de movimiento articular:');
  const rom = paciente.evaluacionFisica.movimientoArticular;
  Object.keys(rom).forEach(movimiento => {
    console.log(`  - ${movimiento}: ${rom[movimiento].valor} (Dolor: ${rom[movimiento].dolor})`);
  });
  
  console.log(`Hallazgos a la palpación: ${paciente.evaluacionFisica.palpacion}`);
  
  console.log('Fuerza muscular:');
  const fuerza = paciente.evaluacionFisica.fuerzaMuscular;
  Object.keys(fuerza).forEach(musculo => {
    console.log(`  - ${musculo}: ${fuerza[musculo]}`);
  });
  
  console.log('Tests específicos:');
  paciente.evaluacionFisica.testEspecificos.forEach(test => {
    console.log(`  - ${test.nombre}: ${test.resultado}`);
  });
  
  if (paciente.evaluacionFisica.imagenes) {
    console.log(`Resultados de imagenología: ${paciente.evaluacionFisica.imagenes}`);
  }
  console.log('\n');
  
  // Diagnóstico
  console.log('DIAGNÓSTICO CLÍNICO:');
  console.log(paciente.diagnostico);
  console.log('\n');
  
  // Plan de tratamiento
  console.log('PLAN DE TRATAMIENTO:');
  console.log('Objetivos a corto plazo:');
  paciente.planTratamiento.objetivosCortoplazo.forEach(objetivo => console.log(`  - ${objetivo}`));
  
  console.log('Objetivos a largo plazo:');
  paciente.planTratamiento.objetivosLargoplazo.forEach(objetivo => console.log(`  - ${objetivo}`));
  
  console.log('Intervenciones terapéuticas:');
  paciente.planTratamiento.intervenciones.forEach(intervencion => console.log(`  - ${intervencion}`));
  
  console.log(`Frecuencia de tratamiento: ${paciente.planTratamiento.frecuencia}`);
  console.log('\n');
  
  // Notas de progreso
  console.log('NOTAS DE PROGRESO:');
  paciente.notasProgreso.forEach(nota => {
    console.log(`Fecha: ${nota.fecha} - Sesión #${nota.sesion}`);
    console.log(`Intervenciones realizadas: ${nota.intervenciones}`);
    console.log(`Respuesta al tratamiento: ${nota.respuesta}`);
    console.log(`Plan para siguiente sesión: ${nota.planSiguienteSesion}`);
    console.log('---');
  });
  console.log('\n');
  
  // Asistente virtual de fisioterapia
  console.log('=====================================================');
  console.log('        ANÁLISIS Y RECOMENDACIONES DEL ASISTENTE    ');
  console.log('=====================================================\n');
  
  const recomendaciones = fisioCopilot(paciente);
  
  console.log('ANÁLISIS DEL CONTEXTO CLÍNICO:');
  recomendaciones.analisisContexto.forEach(analisis => console.log(`• ${analisis}`));
  console.log('\n');
  
  console.log('PREGUNTAS SUGERIDAS PARA ANAMNESIS:');
  recomendaciones.preguntasAnamnesis.forEach(pregunta => console.log(`• ${pregunta}`));
  console.log('\n');
  
  console.log('SUGERENCIAS PARA EVALUACIÓN:');
  recomendaciones.sugerenciasEvaluacion.forEach(sugerencia => console.log(`• ${sugerencia}`));
  console.log('\n');
  
  console.log('RECOMENDACIONES DE TRATAMIENTO BASADAS EN EVIDENCIA:');
  recomendaciones.recomendacionesTratamiento.forEach(rec => {
    console.log(`• ${rec.recomendacion}`);
    console.log(`  Nivel de evidencia: ${rec.evidencia}`);
    console.log(`  Referencia: ${rec.referencia}`);
    console.log('');
  });
  
  console.log('MÉTRICAS SUGERIDAS PARA EVALUAR PROGRESO:');
  recomendaciones.metricasProgreso.forEach(metrica => console.log(`• ${metrica}`));
  console.log('\n');
}

// Simulación del EMR con dos casos clínicos diferentes
console.log("\n*** SIMULACIÓN DE EMR DE FISIOTERAPIA CON ASISTENTE VIRTUAL DE IA ***\n");
console.log("CASO #1: Cervicalgia con cefalea tensional\n");
mostrarEMRConAsistente(patientDB[0]);

console.log("\n\nCASO #2: Lesión meniscal de rodilla\n");
mostrarEMRConAsistente(patientDB[1]);

console.log("\n--- FIN DE LA SIMULACIÓN ---"); 