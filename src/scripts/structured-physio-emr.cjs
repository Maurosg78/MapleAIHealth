/**
 * Simulador de EMR para Fisioterapia con Asistente Virtual
 * Este script simula un EMR básico para fisioterapia con integración de asistente IA
 */

// Simulación de datos de paciente
const patientData = {
  id: "PT-20240712-001",
  personalInfo: {
    firstName: "Carlos",
    lastName: "González",
    dateOfBirth: "1978-05-15",
    gender: "Masculino",
    contactInfo: {
      phone: "+56 9 1234 5678",
      email: "carlos.gonzalez@ejemplo.cl",
      address: "Av. Providencia 1234, Santiago"
    }
  },
  medicalHistory: {
    allergies: ["Ibuprofeno"],
    chronicConditions: ["Hipertensión controlada"],
    previousSurgeries: [
      {
        procedure: "Meniscectomía parcial medial",
        date: "2022-03-10",
        notes: "Rodilla derecha, sin complicaciones"
      }
    ],
    medications: [
      {
        name: "Enalapril",
        dosage: "10mg",
        frequency: "1 vez al día",
        purpose: "Control de hipertensión"
      }
    ]
  },
  initialConsultation: {
    date: "2024-07-10",
    chiefComplaint: "Dolor lumbar con irradiación a pierna derecha de 3 semanas de evolución",
    painLevel: 7,
    functionalLimitations: [
      "Dificultad para mantenerse sentado por más de 30 minutos",
      "Incapacidad para inclinarse hacia adelante",
      "Dolor al levantarse de la cama por las mañanas"
    ],
    onsetMechanism: "Aparición gradual luego de mudanza donde cargó objetos pesados",
    aggravatingFactors: ["Sentarse por tiempo prolongado", "Flexión de tronco", "Toser"],
    alleviatingFactors: ["Reposo en decúbito supino con piernas elevadas", "Calor local"]
  },
  physicalAssessment: {
    posture: {
      anteriorView: "Elevación de hombro derecho, báscula pélvica derecha",
      lateralView: "Antepulsión de cabeza, aumento de lordosis lumbar",
      posteriorView: "Escoliosis lumbar leve con convexidad izquierda"
    },
    rangeOfMotion: {
      lumbarSpine: {
        flexion: {value: "30°", normal: "60°", pain: "Sí, EVA 6/10"},
        extension: {value: "15°", normal: "25°", pain: "Sí, EVA 5/10"},
        lateralFlexionRight: {value: "20°", normal: "25°", pain: "No"},
        lateralFlexionLeft: {value: "15°", normal: "25°", pain: "Sí, EVA 4/10"},
        rotationRight: {value: "30°", normal: "45°", pain: "No"},
        rotationLeft: {value: "35°", normal: "45°", pain: "No"}
      }
    },
    muscleStrength: {
      lowerExtremities: {
        hipFlexorsRight: {value: "4/5", pain: "No"},
        hipFlexorsLeft: {value: "5/5", pain: "No"},
        kneeExtensorsRight: {value: "4/5", pain: "No"},
        kneeExtensorsLeft: {value: "5/5", pain: "No"},
        ankleDorsiflexorsRight: {value: "4/5", pain: "No"},
        ankleDorsiflexorsLeft: {value: "5/5", pain: "No"}
      },
      trunk: {
        abdominals: {value: "3/5", pain: "Sí, EVA 5/10"},
        erectorSpinae: {value: "3/5", pain: "Sí, EVA 7/10"}
      }
    },
    neurologicalTests: {
      slrRight: {value: "Positivo a 40°", interpretation: "Tensión neural"},
      slrLeft: {value: "Negativo", interpretation: "Normal"},
      reflexes: {
        patellarRight: "Normal",
        patellarLeft: "Normal",
        achillesRight: "Disminuido",
        achillesLeft: "Normal"
      },
      sensation: {
        l4Right: "Normal",
        l4Left: "Normal",
        l5Right: "Hipoestesia",
        l5Left: "Normal",
        s1Right: "Normal",
        s1Left: "Normal"
      }
    },
    specialTests: {
      faberRight: {value: "Negativo", interpretation: "Articulation sacroilíaca normal"},
      faberLeft: {value: "Negativo", interpretation: "Articulación sacroilíaca normal"},
      compressionTest: {value: "Positivo", interpretation: "Posible afectación de raíz nerviosa"},
      kernigTest: {value: "Negativo", interpretation: "No hay irritación meníngea"}
    },
    palpation: [
      "Espasmo muscular en paravertebrales lumbares bilateral, más pronunciado a derecha",
      "Dolor a la palpación de L4-L5 y L5-S1",
      "Tensión en piriforme derecho con dolor a la palpación"
    ],
    functionalTests: {
      sitToStand: {
        time: "9.5 segundos",
        normal: "<7 segundos",
        observations: "Movimiento antálgico con desviación hacia la izquierda"
      },
      walkingAnalysis: "Marcha antiálgica con disminución de fase de apoyo en miembro inferior derecho",
      rpe: {
        score: "13/20",
        interpretation: "Esfuerzo percibido como algo duro"
      }
    }
  },
  clinicalDiagnosis: {
    primaryDiagnosis: "Lumbociática derecha",
    secondaryDiagnosis: "Disfunción articular L4-L5 y L5-S1",
    functionalDiagnosis: "Limitación funcional moderada para actividades que requieren flexión de tronco y bipedestación prolongada",
    differentialDiagnosis: [
      "Hernia discal L4-L5 o L5-S1",
      "Estenosis foraminal",
      "Síndrome piriforme"
    ],
    redFlags: "Ninguna presente",
    clinicalHypothesis: "Probable compresión radicular L5 por protrusión discal o hipertrofia facetaria"
  },
  treatmentPlan: {
    shortTermGoals: [
      "Reducir dolor en 50% en 2 semanas",
      "Mejorar amplitud de movimiento lumbar en flexión hasta 45° sin dolor en 2 semanas",
      "Lograr sentarse 60 minutos sin dolor en 3 semanas"
    ],
    longTermGoals: [
      "Retorno a actividades laborales sin restricciones en 6 semanas",
      "Recuperación de fuerza muscular normal en 8 semanas",
      "Implementación de programa preventivo para evitar recurrencias"
    ],
    interventions: [
      {
        type: "Terapia Manual",
        techniques: [
          "Movilización posteroanterior grados III-IV en L4-L5 y L5-S1",
          "Técnicas de energía muscular para piriforme y cuadrado lumbar",
          "Tracción lumbar intermitente"
        ],
        frequency: "3 sesiones por semana"
      },
      {
        type: "Ejercicio Terapéutico",
        techniques: [
          "Ejercicios de control motor lumbar",
          "Fortalecimiento progresivo de core",
          "Estiramientos de cadena posterior",
          "Neurodynamic sliders para ciático"
        ],
        frequency: "Diario, con supervisión en clínica 3 veces por semana"
      },
      {
        type: "Agentes Físicos",
        techniques: [
          "TENS para manejo de dolor (20 minutos)",
          "Compresa húmedo-caliente (15 minutos)"
        ],
        frequency: "En cada sesión, primeras 2 semanas"
      },
      {
        type: "Educación al Paciente",
        techniques: [
          "Higiene postural en actividades de la vida diaria",
          "Mecánica corporal para levantamiento de cargas",
          "Autogestión del dolor",
          "Entendimiento de su condición"
        ],
        frequency: "En cada sesión, con material de refuerzo para el hogar"
      }
    ],
    homeProgram: {
      exercises: [
        "Press de pelvis en supino, 10 repeticiones, 3 series, 2 veces al día",
        "Estiramiento de piriforme, mantener 30 segundos, 3 repeticiones, 2 veces al día",
        "Ejercicio de gato-camello, 10 repeticiones, 2 veces al día",
        "Activación transverso abdominal en supino, 10 repeticiones con mantención de 10 segundos, 2 veces al día"
      ],
      selfManagement: [
        "Aplicación de calor local por 15 minutos, 2 veces al día",
        "Evitar sedestación prolongada, realizar pausas cada 30 minutos",
        "Uso de almohada entre las rodillas al dormir de lado",
        "Mantener espalda apoyada al sentarse con soporte lumbar"
      ]
    },
    expectedOutcomes: {
      timeline: "8-10 semanas para recuperación completa",
      prognosticFactors: {
        favorable: ["Buena condición física previa", "Alta motivación del paciente", "Ausencia de patologías concomitantes graves"],
        unfavorable: ["Trabajo que requiere carga física", "Episodios previos de dolor lumbar"]
      }
    }
  },
  progressNotes: [
    {
      date: "2024-07-12",
      sessionNumber: 1,
      subjectiveFindings: "Paciente refiere dolor constante en zona lumbar, EVA 7/10, con irradiación a pierna derecha. Dificultad para dormir por dolor nocturno.",
      objectiveFindings: {
        painLevel: 7,
        rangeOfMotion: "Flexión lumbar limitada a 30° con dolor al final del rango",
        functionalTests: "No puede realizar flexión de tronco sin compensaciones",
        neurologicalFindings: "SLR derecho positivo a 40°"
      },
      interventionProvided: [
        "Evaluación inicial completa",
        "TENS para manejo del dolor, 20 minutos, parámetros: frecuencia 80Hz, duración de pulso 100μs",
        "Compresa húmedo-caliente en región lumbar, 15 minutos",
        "Educación sobre la condición y factores contribuyentes",
        "Instrucción inicial de ejercicios para el hogar"
      ],
      progressTowardGoals: "Evaluación baseline establecida",
      planForNextSession: "Iniciar terapia manual y ejercicios de control motor",
      patientEducation: "Se instruyó en higiene postural básica y aplicación de calor en casa",
      therapistSignature: "Dr. Felipe Ramírez, Kinesiólogo"
    }
  ]
};

// Simulación de Asistente Virtual de IA para Fisioterapia
const virtualAssistant = {
  // Análisis del caso basado en datos del paciente
  analyzeCase: function(patient) {
    return {
      clinicalContext: {
        keyFindings: [
          "Dolor lumbar irradiado a pierna derecha (posible radiculopatía L5)",
          "Test SLR positivo en derecha a 40°",
          "Hipoestesia en dermatoma L5 derecho",
          "Reflejos aquilianos disminuidos en derecha",
          "Debilidad muscular en extensores de columna (3/5)"
        ],
        riskFactors: [
          "Episodios previos de dolor lumbar",
          "Ocupación con demanda física (carga de objetos pesados)"
        ],
        functionalImpact: "Limitación moderada-severa en actividades que requieren flexión lumbar y sedestación prolongada"
      },
      anamnesisQuestions: [
        "¿Ha experimentado hormigueo o entumecimiento en los dedos del pie?",
        "¿Ha notado cambios en su control de vejiga o intestino recientemente?",
        "¿El dolor es constante o intermitente a lo largo del día?",
        "¿Ha probado algún medicamento para el dolor? ¿Cuál ha sido su efectividad?"
      ],
      evaluationSuggestions: [
        "Realizar test de Slump para confirmar componente neural",
        "Evaluar fuerza del extensor hallucis longus (L5)",
        "Considerar test de Waddell para evaluar componentes no orgánicos",
        "Valorar movilidad de articulaciones sacroilíacas"
      ],
      treatmentSuggestions: [
        {
          intervention: "Ejercicios de centralización de McKenzie",
          description: "Extensiones lumbares progresivas para valorar respuesta centralizadora del dolor",
          evidenceLevel: "A - Evidencia fuerte",
          reference: "Garcia AN, et al. McKenzie Method of Mechanical Diagnosis and Therapy was slightly more effective than placebo for pain, but not for disability, in patients with chronic non-specific low back pain: a randomised placebo controlled trial. J Physiother. 2018;64(2):94-100."
        },
        {
          intervention: "Tracción lumbar intermitente",
          description: "Indicada para casos con signos radiculares positivos",
          evidenceLevel: "B - Evidencia moderada",
          reference: "Alrwaily M, et al. The efficacy of traction for back pain: a systematic review and meta-analysis. Arch Phys Med Rehabil. 2018;99(8):1584-1597."
        },
        {
          intervention: "Ejercicios de control motor",
          description: "Activación de musculatura profunda (transverso, multífidos) para mejorar estabilidad",
          evidenceLevel: "A - Evidencia fuerte",
          reference: "Saragiotto BT, et al. Motor control exercise for chronic non-specific low-back pain. Cochrane Database Syst Rev. 2016;(1):CD012004."
        },
        {
          intervention: "Educación en neurociencia del dolor",
          description: "Explicación fisiológica del dolor para reducir catastrofización y kinesiofobia",
          evidenceLevel: "B - Evidencia moderada",
          reference: "Louw A, et al. The efficacy of pain neuroscience education on musculoskeletal pain: A systematic review of the literature. Physiother Theory Pract. 2016;32(5):332-55."
        }
      ],
      redFlagAlerts: [],
      progressEvaluationMetrics: [
        "Escala numérica de dolor (0-10)",
        "Índice de discapacidad de Oswestry",
        "Test de elevación de pierna recta (grados)",
        "Roland-Morris Disability Questionnaire",
        "Tiempo que puede mantener sedestación sin dolor"
      ],
      evidenceBasedRecommendations: [
        "Los pacientes con signos de radiculopatía L5 suelen responder mejor a una combinación de ejercicios de control motor y técnicas de deslizamiento neural que a estrategias pasivas únicamente (Nivel de evidencia: B)",
        "Para esta presentación clínica, la evidencia sugiere que la tracción lumbar intermitente puede ser beneficiosa cuando se combina con ejercicio activo (Nivel de evidencia: B)",
        "Los pacientes con dolor irradiado pueden beneficiarse de la aplicación de TENS con parámetros de alta frecuencia y baja intensidad (Nivel de evidencia: C)",
        "La movilización articular de grados III-IV ha demostrado ser más efectiva que la de grados I-II para reducir el dolor a corto plazo en casos similares (Nivel de evidencia: B)"
      ]
    };
  }
};

// Simulación de ejecución del EMR
function displayEMR(emr) {
  console.log("\n====================================");
  console.log("      EMR DE FISIOTERAPIA");
  console.log("====================================\n");
  
  // Información del paciente
  console.log("📋 INFORMACIÓN DEL PACIENTE");
  console.log("----------------------------------");
  console.log(`ID: ${emr.id}`);
  console.log(`Nombre: ${emr.personalInfo.firstName} ${emr.personalInfo.lastName}`);
  console.log(`Fecha de nacimiento: ${emr.personalInfo.dateOfBirth}`);
  console.log(`Género: ${emr.personalInfo.gender}`);
  console.log(`Contacto: ${emr.personalInfo.contactInfo.phone} | ${emr.personalInfo.contactInfo.email}`);
  console.log(`Dirección: ${emr.personalInfo.contactInfo.address}`);
  
  // Historia médica
  console.log("\n📚 HISTORIA MÉDICA");
  console.log("----------------------------------");
  console.log("Alergias: " + (emr.medicalHistory.allergies.length > 0 ? emr.medicalHistory.allergies.join(", ") : "Ninguna"));
  console.log("Condiciones crónicas: " + (emr.medicalHistory.chronicConditions.length > 0 ? emr.medicalHistory.chronicConditions.join(", ") : "Ninguna"));
  
  if (emr.medicalHistory.previousSurgeries.length > 0) {
    console.log("\nCirugías previas:");
    emr.medicalHistory.previousSurgeries.forEach(surgery => {
      console.log(`- ${surgery.procedure} (${surgery.date}): ${surgery.notes}`);
    });
  }
  
  if (emr.medicalHistory.medications.length > 0) {
    console.log("\nMedicamentos actuales:");
    emr.medicalHistory.medications.forEach(med => {
      console.log(`- ${med.name} ${med.dosage}, ${med.frequency} - ${med.purpose}`);
    });
  }
  
  // Consulta inicial
  console.log("\n🩺 CONSULTA INICIAL (${emr.initialConsultation.date})");
  console.log("----------------------------------");
  console.log(`Motivo de consulta: ${emr.initialConsultation.chiefComplaint}`);
  console.log(`Nivel de dolor: ${emr.initialConsultation.painLevel}/10`);
  
  console.log("\nLimitaciones funcionales:");
  emr.initialConsultation.functionalLimitations.forEach(limitation => {
    console.log(`- ${limitation}`);
  });
  
  console.log(`\nMecanismo de inicio: ${emr.initialConsultation.onsetMechanism}`);
  
  console.log("\nFactores agravantes:");
  emr.initialConsultation.aggravatingFactors.forEach(factor => {
    console.log(`- ${factor}`);
  });
  
  console.log("\nFactores aliviantes:");
  emr.initialConsultation.alleviatingFactors.forEach(factor => {
    console.log(`- ${factor}`);
  });
  
  // Evaluación física
  console.log("\n📏 EVALUACIÓN FÍSICA");
  console.log("----------------------------------");
  
  console.log("Postura:");
  console.log(`- Vista anterior: ${emr.physicalAssessment.posture.anteriorView}`);
  console.log(`- Vista lateral: ${emr.physicalAssessment.posture.lateralView}`);
  console.log(`- Vista posterior: ${emr.physicalAssessment.posture.posteriorView}`);
  
  console.log("\nRango de movimiento (Columna lumbar):");
  const rom = emr.physicalAssessment.rangeOfMotion.lumbarSpine;
  console.log(`- Flexión: ${rom.flexion.value} (normal: ${rom.flexion.normal}), Dolor: ${rom.flexion.pain}`);
  console.log(`- Extensión: ${rom.extension.value} (normal: ${rom.extension.normal}), Dolor: ${rom.extension.pain}`);
  console.log(`- Flexión lateral derecha: ${rom.lateralFlexionRight.value} (normal: ${rom.lateralFlexionRight.normal}), Dolor: ${rom.lateralFlexionRight.pain}`);
  console.log(`- Flexión lateral izquierda: ${rom.lateralFlexionLeft.value} (normal: ${rom.lateralFlexionLeft.normal}), Dolor: ${rom.lateralFlexionLeft.pain}`);
  
  console.log("\nFuerza muscular:");
  const ms = emr.physicalAssessment.muscleStrength;
  console.log("Extremidades inferiores:");
  console.log(`- Flexores de cadera derecha: ${ms.lowerExtremities.hipFlexorsRight.value}, Dolor: ${ms.lowerExtremities.hipFlexorsRight.pain}`);
  console.log(`- Flexores de cadera izquierda: ${ms.lowerExtremities.hipFlexorsLeft.value}, Dolor: ${ms.lowerExtremities.hipFlexorsLeft.pain}`);
  
  console.log("Tronco:");
  console.log(`- Abdominales: ${ms.trunk.abdominals.value}, Dolor: ${ms.trunk.abdominals.pain}`);
  console.log(`- Erectores de columna: ${ms.trunk.erectorSpinae.value}, Dolor: ${ms.trunk.erectorSpinae.pain}`);
  
  console.log("\nTests neurológicos:");
  const neuro = emr.physicalAssessment.neurologicalTests;
  console.log(`- SLR derecho: ${neuro.slrRight.value} (${neuro.slrRight.interpretation})`);
  console.log(`- SLR izquierdo: ${neuro.slrLeft.value} (${neuro.slrLeft.interpretation})`);
  
  console.log("\nPalpación:");
  emr.physicalAssessment.palpation.forEach(finding => {
    console.log(`- ${finding}`);
  });
  
  console.log("\nTests funcionales:");
  const func = emr.physicalAssessment.functionalTests;
  console.log(`- Sentado a de pie: ${func.sitToStand.time} (normal: ${func.sitToStand.normal})`);
  console.log(`  Observaciones: ${func.sitToStand.observations}`);
  console.log(`- Análisis de marcha: ${func.walkingAnalysis}`);
  
  // Diagnóstico
  console.log("\n🔍 DIAGNÓSTICO CLÍNICO");
  console.log("----------------------------------");
  console.log(`Diagnóstico primario: ${emr.clinicalDiagnosis.primaryDiagnosis}`);
  console.log(`Diagnóstico secundario: ${emr.clinicalDiagnosis.secondaryDiagnosis}`);
  console.log(`Diagnóstico funcional: ${emr.clinicalDiagnosis.functionalDiagnosis}`);
  
  console.log("\nDiagnósticos diferenciales:");
  emr.clinicalDiagnosis.differentialDiagnosis.forEach(dx => {
    console.log(`- ${dx}`);
  });
  
  console.log(`\nBanderas rojas: ${emr.clinicalDiagnosis.redFlags}`);
  console.log(`Hipótesis clínica: ${emr.clinicalDiagnosis.clinicalHypothesis}`);
  
  // Plan de tratamiento
  console.log("\n💡 PLAN DE TRATAMIENTO");
  console.log("----------------------------------");
  
  console.log("Objetivos a corto plazo:");
  emr.treatmentPlan.shortTermGoals.forEach(goal => {
    console.log(`- ${goal}`);
  });
  
  console.log("\nObjetivos a largo plazo:");
  emr.treatmentPlan.longTermGoals.forEach(goal => {
    console.log(`- ${goal}`);
  });
  
  console.log("\nIntervenciones:");
  emr.treatmentPlan.interventions.forEach(intervention => {
    console.log(`\n${intervention.type} (${intervention.frequency}):`);
    intervention.techniques.forEach(technique => {
      console.log(`- ${technique}`);
    });
  });
  
  console.log("\nPrograma domiciliario:");
  console.log("Ejercicios:");
  emr.treatmentPlan.homeProgram.exercises.forEach(exercise => {
    console.log(`- ${exercise}`);
  });
  
  console.log("\nAutogestión:");
  emr.treatmentPlan.homeProgram.selfManagement.forEach(strategy => {
    console.log(`- ${strategy}`);
  });
  
  console.log("\nResultados esperados:");
  console.log(`Cronograma: ${emr.treatmentPlan.expectedOutcomes.timeline}`);
  
  // Notas de progreso
  console.log("\n📝 NOTAS DE PROGRESO");
  console.log("----------------------------------");
  
  emr.progressNotes.forEach(note => {
    console.log(`Fecha: ${note.date} (Sesión #${note.sessionNumber})`);
    console.log(`Hallazgos subjetivos: ${note.subjectiveFindings}`);
    
    console.log("\nHallazgos objetivos:");
    console.log(`- Nivel de dolor: ${note.objectiveFindings.painLevel}/10`);
    console.log(`- Rango de movimiento: ${note.objectiveFindings.rangeOfMotion}`);
    console.log(`- Tests funcionales: ${note.objectiveFindings.functionalTests}`);
    
    console.log("\nIntervenciones realizadas:");
    note.interventionProvided.forEach(intervention => {
      console.log(`- ${intervention}`);
    });
    
    console.log(`\nProgreso hacia objetivos: ${note.progressTowardGoals}`);
    console.log(`Plan para próxima sesión: ${note.planForNextSession}`);
    console.log(`Educación al paciente: ${note.patientEducation}`);
    console.log(`\nFirmado por: ${note.therapistSignature}`);
  });
  
  // Simulación de asistente virtual
  console.log("\n🤖 ASISTENTE VIRTUAL DE FISIOTERAPIA");
  console.log("====================================");
  
  const analysis = virtualAssistant.analyzeCase(emr);
  
  console.log("\n📊 ANÁLISIS DEL CONTEXTO CLÍNICO");
  console.log("----------------------------------");
  console.log("Hallazgos clave:");
  analysis.clinicalContext.keyFindings.forEach(finding => {
    console.log(`- ${finding}`);
  });
  
  console.log("\nFactores de riesgo:");
  analysis.clinicalContext.riskFactors.forEach(risk => {
    console.log(`- ${risk}`);
  });
  
  console.log(`\nImpacto funcional: ${analysis.clinicalContext.functionalImpact}`);
  
  console.log("\n❓ PREGUNTAS SUGERIDAS PARA ANAMNESIS");
  console.log("----------------------------------");
  analysis.anamnesisQuestions.forEach(question => {
    console.log(`- ${question}`);
  });
  
  console.log("\n📋 SUGERENCIAS PARA EVALUACIÓN");
  console.log("----------------------------------");
  analysis.evaluationSuggestions.forEach(suggestion => {
    console.log(`- ${suggestion}`);
  });
  
  console.log("\n💊 RECOMENDACIONES DE TRATAMIENTO");
  console.log("----------------------------------");
  analysis.treatmentSuggestions.forEach(treatment => {
    console.log(`\n${treatment.intervention} (Nivel de evidencia: ${treatment.evidenceLevel})`);
    console.log(`Descripción: ${treatment.description}`);
    console.log(`Referencia: ${treatment.reference}`);
  });
  
  console.log("\n📈 MÉTRICAS PARA EVALUAR PROGRESO");
  console.log("----------------------------------");
  analysis.progressEvaluationMetrics.forEach(metric => {
    console.log(`- ${metric}`);
  });
  
  console.log("\n📚 RECOMENDACIONES BASADAS EN EVIDENCIA");
  console.log("----------------------------------");
  analysis.evidenceBasedRecommendations.forEach(recommendation => {
    console.log(`- ${recommendation}`);
  });
}

// Ejecutar la simulación
displayEMR(patientData); 