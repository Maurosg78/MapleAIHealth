/**
 * Simulador del Procesador de Casos Clínicos AIDUX
 * Este script demuestra cómo el sistema AIDUX procesa un caso clínico específico
 * 
 * ¡ADVERTENCIA DE SEGURIDAD MÉDICA! - PRIORIDAD MÁXIMA
 * -----------------------------------------------------
 * 1. Este sistema NUNCA debe generar información médica no verificada
 * 2. Toda recomendación DEBE basarse exclusivamente en datos confirmados
 * 3. Si algún dato es desconocido, el sistema DEBE solicitar la información
 * 4. Proporcionar información médica incorrecta representa una infracción GRAVE
 */

const clinicalCase = {
  patientInfo: {
    age: 42,
    gender: "Femenino",
    id: "PT-20240715-001"
  },
  
  primaryComplaint: "Dolor lumbar matutino que cede durante el día, dolor poliarticular en manos",
  
  clinicalHistory: {
    currentIllness: "Paciente de 42 años que consulta por cuadro de dolor lumbar matutino que se alivia parcialmente durante la mañana. Presenta adicionalmente dolor poliarticular que se centra en las manos con enrojecimiento visible en articulaciones interfalángicas. Refiere fatiga persistente durante todo el día.",
    
    medicalHistory: [
      "Diagnóstico reciente de enfermedad celíaca",
      "Varios episodios de diverticulitis durante el último año",
      "Histerectomía parcial por endometriosis",
      "Sospecha de artritis psoriásica por médico tratante"
    ],
    
    medicationHistory: [],
    
    allergies: [],
    
    functionalStatus: "Refiere limitación para actividades matutinas debido a rigidez. Fatiga constante que interfiere con actividades cotidianas."
  },
  
  physicalExamination: {
    generalAppearance: "Paciente con apariencia fatigada",
    vitalSigns: {
      bloodPressure: "128/78 mmHg",
      heartRate: "76 lpm",
      respiratoryRate: "16 rpm",
      temperature: "36.7°C",
      oxygenSaturation: "98%"
    },
    musculoskeletal: {
      spine: "Dolor a la palpación en región lumbar, especialmente L4-L5. Movilidad lumbar limitada en flexión (70% del rango normal) y rotación bilateral (80% del rango normal). Test de Schober 3 cm.",
      extremities: "Enrojecimiento visible en articulaciones interfalángicas proximales de 2°, 3° y 4° dedos de ambas manos. Dolor a la palpación en dichas articulaciones. Fuerza muscular conservada. No edema en otras articulaciones.",
      specialTests: "FABER y FADIR negativos bilateralmente. SLR negativo bilateral."
    },
    neurological: "Reflejos osteotendinosos conservados y simétricos. No déficit sensorial ni motor en extremidades."
  },
  
  diagnosticStudies: {
    performed: [
      "Hemograma: Leve anemia normocítica (Hb 11.5 g/dL)",
      "VSG: Elevada (32 mm/h)",
      "PCR: Elevada (1.8 mg/dL)",
      "Factor Reumatoideo: Negativo",
      "Anticuerpos anti-péptidos citrulinados: Negativos"
    ],
    pending: [
      "Radiografía de manos",
      "Radiografía de columna lumbosacra",
      "Resonancia magnética de articulaciones sacroilíacas"
    ]
  },
  
  medicalPlan: {
    referral: "Derivación a Reumatología para evaluación y confirmación diagnóstica",
    pendingDiagnosis: [
      "Artritis Psoriásica (principal sospecha)",
      "Espondiloartropatía asociada a enfermedad inflamatoria intestinal",
      "Fibromialgia secundaria (como comorbilidad)"
    ],
    requestedTreatment: "Tratamiento para dolor lumbar difuso y mejora de condición aeróbica"
  }
};

// Función para verificar si hay información suficiente para procesar un campo
const verificarInformacionCompleta = (datos, campoRequerido) => {
  if (!datos || (Array.isArray(datos) && datos.length === 0) || datos === '') {
    return `[INFORMACIÓN FALTANTE: Se requiere ${campoRequerido}]`;
  }
  return null;
};

// Función para procesar los datos y mostrar cualquier información faltante
function processWithAIDUX(caseData) {
  console.log("\n==========================================================");
  console.log("🤖 AIDUX EMR - PROCESADOR DE CASOS CLÍNICOS");
  console.log("==========================================================\n");
  
  // Lista para almacenar campos faltantes
  const camposFaltantes = [];
  
  // 1. Datos del paciente
  console.log("📋 INFORMACIÓN DEL PACIENTE");
  console.log("----------------------------------------------------------");
  
  const idFaltante = verificarInformacionCompleta(caseData?.patientInfo?.id, "ID del paciente");
  if (idFaltante) camposFaltantes.push(idFaltante);
  
  const edadFaltante = verificarInformacionCompleta(caseData?.patientInfo?.age, "edad del paciente");
  if (edadFaltante) camposFaltantes.push(edadFaltante);
  
  const generoFaltante = verificarInformacionCompleta(caseData?.patientInfo?.gender, "género del paciente");
  if (generoFaltante) camposFaltantes.push(generoFaltante);
  
  const motivoConsultaFaltante = verificarInformacionCompleta(caseData?.primaryComplaint, "motivo de consulta");
  if (motivoConsultaFaltante) camposFaltantes.push(motivoConsultaFaltante);
  
  console.log(`ID: ${caseData?.patientInfo?.id || '[NO DISPONIBLE]'}`);
  console.log(`Edad: ${caseData?.patientInfo?.age ? `${caseData.patientInfo.age} años` : '[NO DISPONIBLE]'}`);
  console.log(`Género: ${caseData?.patientInfo?.gender || '[NO DISPONIBLE]'}`);
  console.log(`Motivo de consulta: ${caseData?.primaryComplaint || '[NO DISPONIBLE]'}`);
  
  // 2. Historia Clínica Estructurada
  console.log("\n📑 HISTORIA CLÍNICA ESTRUCTURADA");
  console.log("----------------------------------------------------------");
  
  const enfermedadActualFaltante = verificarInformacionCompleta(
    caseData?.clinicalHistory?.currentIllness,
    "descripción de la enfermedad actual"
  );
  if (enfermedadActualFaltante) camposFaltantes.push(enfermedadActualFaltante);
  
  console.log(`\nHistoria de la enfermedad actual:`);
  console.log(caseData?.clinicalHistory?.currentIllness || '[INFORMACIÓN NO DISPONIBLE]');
  
  console.log(`\nAntecedentes médicos:`);
  if (caseData?.clinicalHistory?.medicalHistory && caseData.clinicalHistory.medicalHistory.length > 0) {
    caseData.clinicalHistory.medicalHistory.forEach(item => {
      console.log(`• ${item}`);
    });
  } else {
    console.log('[NO SE HAN REGISTRADO ANTECEDENTES MÉDICOS]');
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requieren antecedentes médicos]");
  }
  
  console.log(`\nMedicamentos actuales:`);
  if (caseData?.clinicalHistory?.medicationHistory && caseData.clinicalHistory.medicationHistory.length > 0) {
    caseData.clinicalHistory.medicationHistory.forEach(med => {
      console.log(`• ${med}`);
    });
  } else {
    console.log('[NO SE HA REGISTRADO MEDICACIÓN ACTUAL]');
  }
  
  console.log(`\nAlergias:`);
  if (caseData?.clinicalHistory?.allergies && caseData.clinicalHistory.allergies.length > 0) {
    caseData.clinicalHistory.allergies.forEach(allergy => {
      console.log(`• ${allergy}`);
    });
  } else {
    console.log('[NO SE HAN REGISTRADO ALERGIAS]');
  }
  
  console.log(`\nEstado funcional:`);
  console.log(caseData?.clinicalHistory?.functionalStatus || '[INFORMACIÓN NO DISPONIBLE]');
  if (!caseData?.clinicalHistory?.functionalStatus) {
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requiere estado funcional del paciente]");
  }
  
  // 3. Examen Físico
  console.log("\n🔍 EXAMEN FÍSICO");
  console.log("----------------------------------------------------------");
  
  if (!caseData?.physicalExamination?.generalAppearance) {
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requiere descripción de apariencia general]");
  }
  
  console.log(`Apariencia general: ${caseData?.physicalExamination?.generalAppearance || '[NO DISPONIBLE]'}`);
  
  console.log(`\nSignos vitales:`);
  if (caseData?.physicalExamination?.vitalSigns) {
    const vs = caseData.physicalExamination.vitalSigns;
    console.log(`• Presión arterial: ${vs.bloodPressure || '[NO REGISTRADO]'}`);
    console.log(`• Frecuencia cardíaca: ${vs.heartRate || '[NO REGISTRADO]'}`);
    console.log(`• Frecuencia respiratoria: ${vs.respiratoryRate || '[NO REGISTRADO]'}`);
    console.log(`• Temperatura: ${vs.temperature || '[NO REGISTRADO]'}`);
    console.log(`• Saturación de oxígeno: ${vs.oxygenSaturation || '[NO REGISTRADO]'}`);
    
    if (!vs.bloodPressure) camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requiere presión arterial]");
    if (!vs.heartRate) camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requiere frecuencia cardíaca]");
  } else {
    console.log('[SIGNOS VITALES NO REGISTRADOS]');
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requieren signos vitales]");
  }
  
  console.log(`\nExamen musculoesquelético:`);
  if (caseData?.physicalExamination?.musculoskeletal) {
    const musculo = caseData.physicalExamination.musculoskeletal;
    console.log(`• Columna: ${musculo.spine || '[NO EVALUADO]'}`);
    console.log(`• Extremidades: ${musculo.extremities || '[NO EVALUADO]'}`);
    console.log(`• Tests especiales: ${musculo.specialTests || '[NO REALIZADOS]'}`);
  } else {
    console.log('[EXAMEN MUSCULOESQUELÉTICO NO REALIZADO]');
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requiere examen musculoesquelético]");
  }
  
  console.log(`\nExamen neurológico: ${caseData?.physicalExamination?.neurological || '[NO REALIZADO]'}`);
  if (!caseData?.physicalExamination?.neurological) {
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requiere examen neurológico]");
  }
  
  // 4. Estudios Diagnósticos
  console.log("\n📊 ESTUDIOS DIAGNÓSTICOS");
  console.log("----------------------------------------------------------");
  
  console.log(`\nEstudios realizados:`);
  if (caseData?.diagnosticStudies?.performed && caseData.diagnosticStudies.performed.length > 0) {
    caseData.diagnosticStudies.performed.forEach(study => {
      console.log(`• ${study}`);
    });
  } else {
    console.log('[NO SE HAN REGISTRADO ESTUDIOS DIAGNÓSTICOS]');
  }
  
  console.log(`\nEstudios pendientes:`);
  if (caseData?.diagnosticStudies?.pending && caseData.diagnosticStudies.pending.length > 0) {
    caseData.diagnosticStudies.pending.forEach(study => {
      console.log(`• ${study}`);
    });
  } else {
    console.log('[NO HAY ESTUDIOS PENDIENTES REGISTRADOS]');
  }
  
  // 5. Plan Médico
  console.log("\n📋 PLAN MÉDICO INICIAL");
  console.log("----------------------------------------------------------");
  
  const derivacionFaltante = verificarInformacionCompleta(
    caseData?.medicalPlan?.referral,
    "información de derivación"
  );
  if (derivacionFaltante) camposFaltantes.push(derivacionFaltante);
  
  console.log(`Derivación: ${caseData?.medicalPlan?.referral || '[NO ESPECIFICADO]'}`);
  
  console.log(`\nDiagnósticos en consideración:`);
  if (caseData?.medicalPlan?.pendingDiagnosis && caseData.medicalPlan.pendingDiagnosis.length > 0) {
    caseData.medicalPlan.pendingDiagnosis.forEach(diagnosis => {
      console.log(`• ${diagnosis}`);
    });
  } else {
    console.log('[NO SE HAN REGISTRADO DIAGNÓSTICOS EN CONSIDERACIÓN]');
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requieren diagnósticos diferenciales]");
  }
  
  console.log(`\nTratamiento solicitado: ${caseData?.medicalPlan?.requestedTreatment || '[NO ESPECIFICADO]'}`);
  if (!caseData?.medicalPlan?.requestedTreatment) {
    camposFaltantes.push("[INFORMACIÓN FALTANTE: Se requiere plan de tratamiento]");
  }
  
  // Mostrar información faltante antes del análisis
  if (camposFaltantes.length > 0) {
    console.log("\n⚠️ INFORMACIÓN FALTANTE PARA COMPLETAR ANÁLISIS");
    console.log("----------------------------------------------------------");
    camposFaltantes.forEach(campo => {
      console.log(`• ${campo}`);
    });
    
    console.log("\n⛔ NO ES POSIBLE REALIZAR UN ANÁLISIS COMPLETO");
    console.log("Se requiere la información faltante antes de proceder con recomendaciones");
    console.log("Proporcionar información médica sin datos suficientes constituye una infracción grave");
    
    console.log("\n==========================================================");
    console.log("🔒 Procesamiento parcial completado con AIDUX EMR");
    console.log("Se requiere completar la información faltante");
    console.log("==========================================================\n");
    
    return;
  }
  
  // 6. Análisis del Asistente AIDUX (solo se muestra si toda la información necesaria está disponible)
  console.log("\n🤖 ANÁLISIS DEL ASISTENTE AIDUX");
  console.log("----------------------------------------------------------");
  
  // Análisis basado exclusivamente en la información disponible
  console.log("\n📋 RESUMEN DE INFORMACIÓN DISPONIBLE");
  console.log(`• Paciente de ${caseData.patientInfo.age} años, género ${caseData.patientInfo.gender}`);
  console.log(`• Motivo de consulta: ${caseData.primaryComplaint}`);
  console.log(`• Diagnósticos en consideración por médico tratante:`);
  caseData.medicalPlan.pendingDiagnosis.forEach(diagnosis => {
    console.log(`  - ${diagnosis}`);
  });
  
  console.log("\n📊 HALLAZGOS RELEVANTES");
  if (caseData.diagnosticStudies.performed && caseData.diagnosticStudies.performed.length > 0) {
    console.log(`• Resultados de laboratorio disponibles:`);
    caseData.diagnosticStudies.performed.forEach(study => {
      console.log(`  - ${study}`);
    });
  }
  
  if (caseData.physicalExamination.musculoskeletal) {
    console.log(`• Hallazgos musculoesqueléticos: ${caseData.physicalExamination.musculoskeletal.spine}`);
  }
  
  console.log("\n📚 DOCUMENTOS CLÍNICOS DISPONIBLES");
  console.log("----------------------------------------------------------");
  console.log(`1. Historia clínica estructurada`);
  console.log(`2. Registro de exploración física`);
  console.log(`3. Resultados de pruebas diagnósticas`);
  console.log(`4. Solicitud de derivación a especialista`);
  
  console.log("\n⚠️ NOTA IMPORTANTE SOBRE RECOMENDACIONES MÉDICAS");
  console.log("----------------------------------------------------------");
  console.log("Las recomendaciones médicas sólo pueden ser proporcionadas por");
  console.log("profesionales de salud cualificados después de una evaluación completa.");
  console.log("Este sistema únicamente organiza la información disponible y solicita");
  console.log("datos adicionales cuando es necesario para completar la evaluación.");
  
  console.log("\n==========================================================");
  console.log("🔒 Procesamiento completado con AIDUX EMR");
  console.log("La información ha sido documentada según estándares legales y clínicos");
  console.log("==========================================================\n");
}

// Exportar para uso en otros módulos
module.exports = {
  processWithAIDUX
};

// Si el script se ejecuta directamente, usar la información proporcionada
if (require.main === module) {
  // Este objeto contiene datos del paciente SOLO PARA PROPÓSITOS DE DEMOSTRACIÓN
  // En un entorno real, estos datos provendrían de sistemas certificados
  const clinicalCase = {
    patientInfo: {
      age: 42,
      gender: "Femenino",
      id: "PT-20240715-001"
    },
    
    primaryComplaint: "Dolor lumbar matutino que cede durante el día, dolor poliarticular en manos",
    
    clinicalHistory: {
      currentIllness: "Paciente de 42 años que consulta por cuadro de dolor lumbar matutino que se alivia parcialmente durante la mañana. Presenta adicionalmente dolor poliarticular que se centra en las manos con enrojecimiento visible en articulaciones interfalángicas. Refiere fatiga persistente durante todo el día.",
      
      medicalHistory: [
        "Diagnóstico reciente de enfermedad celíaca",
        "Varios episodios de diverticulitis durante el último año",
        "Histerectomía parcial por endometriosis",
        "Sospecha de artritis psoriásica por médico tratante"
      ],
      
      medicationHistory: [],
      
      allergies: [],
      
      functionalStatus: "Refiere limitación para actividades matutinas debido a rigidez. Fatiga constante que interfiere con actividades cotidianas."
    },
    
    physicalExamination: {
      generalAppearance: "Paciente con apariencia fatigada",
      vitalSigns: {
        bloodPressure: "128/78 mmHg",
        heartRate: "76 lpm",
        respiratoryRate: "16 rpm",
        temperature: "36.7°C",
        oxygenSaturation: "98%"
      },
      musculoskeletal: {
        spine: "Dolor a la palpación en región lumbar, especialmente L4-L5. Movilidad lumbar limitada en flexión (70% del rango normal) y rotación bilateral (80% del rango normal). Test de Schober 3 cm.",
        extremities: "Enrojecimiento visible en articulaciones interfalángicas proximales de 2°, 3° y 4° dedos de ambas manos. Dolor a la palpación en dichas articulaciones. Fuerza muscular conservada. No edema en otras articulaciones.",
        specialTests: "FABER y FADIR negativos bilateralmente. SLR negativo bilateral."
      },
      neurological: "Reflejos osteotendinosos conservados y simétricos. No déficit sensorial ni motor en extremidades."
    },
    
    diagnosticStudies: {
      performed: [
        "Hemograma: Leve anemia normocítica (Hb 11.5 g/dL)",
        "VSG: Elevada (32 mm/h)",
        "PCR: Elevada (1.8 mg/dL)",
        "Factor Reumatoideo: Negativo",
        "Anticuerpos anti-péptidos citrulinados: Negativos"
      ],
      pending: [
        "Radiografía de manos",
        "Radiografía de columna lumbosacra",
        "Resonancia magnética de articulaciones sacroilíacas"
      ]
    },
    
    medicalPlan: {
      referral: "Derivación a Reumatología para evaluación y confirmación diagnóstica",
      pendingDiagnosis: [
        "Artritis Psoriásica (principal sospecha)",
        "Espondiloartropatía asociada a enfermedad inflamatoria intestinal",
        "Fibromialgia secundaria (como comorbilidad)"
      ],
      requestedTreatment: "Tratamiento para dolor lumbar difuso y mejora de condición aeróbica"
    }
  };
  
  // Crear un caso incompleto para demostrar solicitud de información
  const casoIncompleto = {
    patientInfo: {
      age: 42,
      gender: "Femenino",
      // ID faltante
    },
    primaryComplaint: "Dolor lumbar",
    clinicalHistory: {
      // Historia actual incompleta
      medicalHistory: [],
      medicationHistory: [],
      allergies: []
      // Estado funcional faltante
    },
    physicalExamination: {
      // Falta información de examen físico
    },
    diagnosticStudies: {
      performed: [],
      pending: []
    },
    medicalPlan: {
      // Falta información del plan médico
    }
  };
  
  console.log("\n===== DEMOSTRACIÓN 1: CASO CON INFORMACIÓN COMPLETA =====");
  processWithAIDUX(clinicalCase);
  
  console.log("\n\n===== DEMOSTRACIÓN 2: CASO CON INFORMACIÓN INCOMPLETA =====");
  processWithAIDUX(casoIncompleto);
} 