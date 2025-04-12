// AIDUX - Evaluación de casos clínicos con priorización sin diagnóstico directo
console.log("\n===== ASISTENTE CLÍNICO AIDUX - PRIORIZACIÓN MULTICASO =====\n");

// Biblioteca de sintomatología y evaluación clínica
const patronesSintomaticos = {
  neurologicos: ["cefalea", "mareo", "vértigo", "parestesias", "alteración de conciencia", "convulsiones"],
  cardiorespiratorios: ["dolor torácico", "disnea", "palpitaciones", "tos", "hemoptisis"],
  digestivos: ["dolor abdominal", "náuseas", "vómitos", "diarrea", "estreñimiento", "ictericia"],
  osteomusculares: ["dolor articular", "dolor lumbar", "limitación funcional", "trauma"]
};

// Preguntas para caracterización de síntomas según sistemas
const preguntasPorSistema = {
  neurologicos: [
    "¿Cuál es la localización exacta del síntoma?",
    "¿Cuál es la intensidad del 1 al 10?",
    "¿Existe algún factor desencadenante identificado?",
    "¿Hay síntomas asociados como náuseas, fotofobia o alteraciones visuales?",
    "¿El síntoma es continuo o intermitente?",
    "¿Ha presentado episodios similares anteriormente?"
  ],
  cardiorespiratorios: [
    "¿El síntoma se relaciona con el esfuerzo?",
    "¿Hay relación con la posición corporal?",
    "¿Se irradia el dolor a alguna zona?",
    "¿Se acompaña de dificultad respiratoria o sudoración?",
    "¿Cuánto tiempo duran los episodios?"
  ],
  digestivos: [
    "¿Hay relación con la ingesta de alimentos?",
    "¿Ha notado cambios en las características de las deposiciones?",
    "¿El dolor abdominal tiene alguna localización específica?",
    "¿Ha presentado fiebre asociada?",
    "¿Ha notado cambios en el color de la orina o las heces?"
  ],
  osteomusculares: [
    "¿El dolor se modifica con el movimiento?",
    "¿Existe limitación funcional asociada?",
    "¿Hay signos inflamatorios locales?",
    "¿Ha sufrido algún traumatismo previo?",
    "¿El dolor es de tipo mecánico o inflamatorio (mejora/empeora con reposo)?"
  ]
};

// Signos de alerta o "banderas rojas" por sistema
const signos_alerta = {
  neurologicos: [
    "Cefalea de inicio súbito e intensidad severa",
    "Alteración del nivel de conciencia",
    "Déficit neurológico focal",
    "Rigidez nucal asociada a fiebre",
    "Convulsiones"
  ],
  cardiorespiratorios: [
    "Dolor torácico opresivo irradiado a mandíbula o brazo izquierdo",
    "Disnea súbita o progresiva severa",
    "Cianosis",
    "Hemoptisis",
    "Dolor pleurítico con disnea aguda"
  ],
  digestivos: [
    "Dolor abdominal intenso y súbito",
    "Signos de irritación peritoneal",
    "Melena o hematoquecia",
    "Vómitos en posos de café",
    "Ictericia de rápida instauración"
  ],
  osteomusculares: [
    "Debilidad muscular progresiva o súbita",
    "Compromiso de esfínteres asociado a dolor lumbar",
    "Signos de compresión radicular severa",
    "Impotencia funcional súbita post trauma",
    "Limitación severa de movimientos con signos inflamatorios marcados"
  ]
};

// Exploración física recomendada por sistema
const exploracionPorSistema = {
  neurologicos: [
    "Evaluación de signos vitales",
    "Valoración del estado de conciencia y orientación",
    "Examen de pares craneales",
    "Evaluación de fuerza y sensibilidad",
    "Valoración de coordinación y equilibrio",
    "Evaluación de signos meníngeos",
    "Fondo de ojo"
  ],
  cardiorespiratorios: [
    "Medición de signos vitales completos",
    "Oximetría de pulso",
    "Auscultación cardíaca y pulmonar detallada",
    "Palpación de pulsos periféricos",
    "Evaluación de signos de congestión"
  ],
  digestivos: [
    "Inspección, auscultación, percusión y palpación abdominal",
    "Evaluación de signos de irritación peritoneal",
    "Tacto rectal si está indicado",
    "Evaluación de hepatoesplenomegalia",
    "Valoración de estado de hidratación"
  ],
  osteomusculares: [
    "Inspección de la zona afectada",
    "Palpación para identificar puntos dolorosos",
    "Evaluación de arcos de movilidad",
    "Valoración de fuerza muscular",
    "Exploración neurológica básica del territorio afectado",
    "Evaluación de reflejos osteotendinosos"
  ]
};

// Función para identificar sistemas comprometidos basado en la descripción del caso
function identificarSistemasComprometidos(descripcion) {
  const sistemasComprometidos = [];
  const patronesIdentificados = [];
  
  // Convertir descripción a minúsculas para facilitar la búsqueda
  const textoLower = descripcion.toLowerCase();
  
  // Buscar patrones en cada sistema
  Object.keys(patronesSintomaticos).forEach(sistema => {
    patronesSintomaticos[sistema].forEach(patron => {
      if (textoLower.includes(patron.toLowerCase())) {
        if (!sistemasComprometidos.includes(sistema)) {
          sistemasComprometidos.push(sistema);
        }
        patronesIdentificados.push({
          sistema: sistema,
          patron: patron
        });
      }
    });
  });
  
  return { sistemasComprometidos, patronesIdentificados };
}

// Función para generar preguntas prioritarias según los sistemas comprometidos
function generarPreguntasPrioritarias(sistemasComprometidos, descripcion) {
  const preguntasPrioritarias = [];
  const preguntasSecundarias = [];
  
  sistemasComprometidos.forEach(sistema => {
    // Añadir preguntas específicas del sistema
    preguntasPorSistema[sistema].forEach(pregunta => {
      // Verificar si la pregunta ya ha sido respondida en la descripción
      // (Implementación simplificada, en un sistema real sería más complejo)
      const preguntaRelevante = !verificarInformacionExistente(pregunta, descripcion);
      
      if (preguntaRelevante) {
        // Las primeras 3 preguntas son prioritarias, el resto secundarias
        if (preguntasPrioritarias.filter(p => p.startsWith(pregunta.substring(0, 10))).length === 0) {
          if (preguntasPrioritarias.length < 5) {
            preguntasPrioritarias.push(pregunta);
          } else {
            preguntasSecundarias.push(pregunta);
          }
        }
      }
    });
  });
  
  return { preguntasPrioritarias, preguntasSecundarias };
}

// Función simplificada para verificar si cierta información ya existe en la descripción
function verificarInformacionExistente(pregunta, descripcion) {
  // Extraer palabras clave de la pregunta
  const palabrasClave = pregunta.toLowerCase().split(' ')
    .filter(palabra => palabra.length > 4)
    .filter(palabra => !['cuál', 'cómo', 'dónde', 'cuándo', 'algún', 'podría'].includes(palabra));
  
  // Si al menos 2 palabras clave aparecen en la descripción, consideramos que hay información
  let coincidencias = 0;
  palabrasClave.forEach(palabra => {
    if (descripcion.toLowerCase().includes(palabra)) {
      coincidencias++;
    }
  });
  
  return coincidencias >= 2;
}

// Función para identificar posibles signos de alerta en la descripción
function identificarSignosAlerta(descripcion, sistemasComprometidos) {
  const alertasIdentificadas = [];
  
  sistemasComprometidos.forEach(sistema => {
    signos_alerta[sistema].forEach(alerta => {
      // Buscar palabras clave de la alerta en la descripción
      const palabrasClave = alerta.toLowerCase().split(' ')
        .filter(palabra => palabra.length > 4)
        .filter(palabra => !['como', 'asociado', 'signos', 'súbito'].includes(palabra));
      
      let coincidencias = 0;
      palabrasClave.forEach(palabra => {
        if (descripcion.toLowerCase().includes(palabra)) {
          coincidencias++;
        }
      });
      
      // Si hay al menos 2 coincidencias, consideramos que hay una alerta
      if (coincidencias >= 2) {
        alertasIdentificadas.push({
          sistema: sistema,
          alerta: alerta
        });
      }
    });
  });
  
  return alertasIdentificadas;
}

// Función para sugerir exploración física según sistemas comprometidos
function sugerirExploracionFisica(sistemasComprometidos, alertasIdentificadas) {
  const exploracionPrioritaria = [];
  const exploracionSecundaria = [];
  
  // Primero incluir exploraciones relacionadas con alertas
  alertasIdentificadas.forEach(alerta => {
    const exploracionesDelSistema = exploracionPorSistema[alerta.sistema];
    // Seleccionar las exploraciones más relevantes para la alerta
    exploracionesDelSistema.slice(0, 3).forEach(exploracion => {
      if (!exploracionPrioritaria.includes(exploracion)) {
        exploracionPrioritaria.push(exploracion);
      }
    });
  });
  
  // Luego incluir exploraciones básicas para cada sistema comprometido
  sistemasComprometidos.forEach(sistema => {
    const exploracionesDelSistema = exploracionPorSistema[sistema];
    exploracionesDelSistema.forEach(exploracion => {
      if (!exploracionPrioritaria.includes(exploracion)) {
        if (exploracionPrioritaria.length < 5) {
          exploracionPrioritaria.push(exploracion);
        } else {
          if (!exploracionSecundaria.includes(exploracion)) {
            exploracionSecundaria.push(exploracion);
          }
        }
      }
    });
  });
  
  return { exploracionPrioritaria, exploracionSecundaria };
}

// Función para sugerir estudios complementarios sin mencionar diagnósticos
function sugerirEstudiosComplementarios(sistemasComprometidos, descripcion) {
  const estudiosBasicos = [];
  const estudiosEspecificos = [];
  
  // Estudios básicos por sistema
  const estudiosPorSistema = {
    neurologicos: [
      "Signos vitales completos con énfasis en presión arterial",
      "Glicemia capilar",
      "Exámenes de laboratorio básicos"
    ],
    cardiorespiratorios: [
      "Electrocardiograma",
      "Medición de signos vitales seriados",
      "Oximetría de pulso continua"
    ],
    digestivos: [
      "Exámenes de laboratorio básicos",
      "Evaluación de estado de hidratación",
      "Balance hidroelectrolítico"
    ],
    osteomusculares: [
      "Evaluación de rangos de movilidad articular",
      "Documentación fotográfica de lesiones si aplica",
      "Escalas de dolor estandarizadas"
    ]
  };
  
  // Añadir estudios básicos para cada sistema comprometido
  sistemasComprometidos.forEach(sistema => {
    estudiosPorSistema[sistema].forEach(estudio => {
      if (!estudiosBasicos.includes(estudio)) {
        estudiosBasicos.push(estudio);
      }
    });
  });
  
  // Añadir estudios específicos según palabras clave en la descripción
  if (descripcion.toLowerCase().includes("cefalea") && descripcion.toLowerCase().includes("intens")) {
    estudiosEspecificos.push("Considerar estudios de neuroimagen");
  }
  
  if (descripcion.toLowerCase().includes("dolor") && descripcion.toLowerCase().includes("torác")) {
    estudiosEspecificos.push("Monitorización cardíaca");
    estudiosEspecificos.push("Marcadores cardíacos");
  }
  
  if (descripcion.toLowerCase().includes("abdomen") && descripcion.toLowerCase().includes("dolor")) {
    estudiosEspecificos.push("Evaluación abdominal completa");
  }
  
  if (descripcion.toLowerCase().includes("trauma") || descripcion.toLowerCase().includes("accidente")) {
    estudiosEspecificos.push("Evaluación de lesiones según mecanismo de trauma");
  }
  
  return { estudiosBasicos, estudiosEspecificos };
}

// Conjunto de casos clínicos para evaluación
const casos = [
  {
    id: 1,
    descripcion: "Paciente femenina de 35 años que consulta por dolor abdominal difuso de 2 días de evolución, asociado a náuseas sin vómitos. Refiere que el dolor aumenta después de comer y disminuye parcialmente en reposo. No presenta fiebre ni cambios en el patrón de deposiciones."
  },
  {
    id: 2,
    descripcion: "Paciente masculino de 67 años con dolor torácico opresivo de inicio súbito hace 40 minutos, irradiado a mandíbula y brazo izquierdo, asociado a diaforesis y disnea. Antecedente de hipertensión y diabetes. Al examen físico: TA 160/95, FC 98, palidez generalizada."
  },
  {
    id: 3,
    descripcion: "Paciente femenina de 28 años que consulta por cefalea pulsátil hemicraneal derecha de 12 horas de evolución, intensidad 8/10, asociada a fotofobia, fonofobia y náuseas. Refiere episodios similares 2-3 veces por mes desde hace 2 años. Sin fiebre ni déficit neurológico."
  }
];

// Analizar y presentar resultados para cada caso
casos.forEach(caso => {
  console.log(`\n===== CASO CLÍNICO ${caso.id} =====\n`);
  console.log(`INFORMACIÓN INICIAL:\n"${caso.descripcion}"\n`);
  
  console.log("ANÁLISIS INICIAL DE INFORMACIÓN:");
  
  // Identificar sistemas comprometidos
  const { sistemasComprometidos, patronesIdentificados } = identificarSistemasComprometidos(caso.descripcion);
  
  console.log("\nSISTEMAS INVOLUCRADOS:");
  sistemasComprometidos.forEach(sistema => {
    console.log(`  • ${sistema.charAt(0).toUpperCase() + sistema.slice(1)}`);
  });
  
  console.log("\nPATRONES SINTOMÁTICOS IDENTIFICADOS:");
  patronesIdentificados.forEach(patron => {
    console.log(`  • ${patron.patron}`);
  });
  
  // Identificar posibles signos de alerta
  const alertasIdentificadas = identificarSignosAlerta(caso.descripcion, sistemasComprometidos);
  
  if (alertasIdentificadas.length > 0) {
    console.log("\nATENCIÓN: POSIBLES SIGNOS DE ALERTA DETECTADOS:");
    alertasIdentificadas.forEach(alerta => {
      console.log(`  ⚠️ ${alerta.alerta}`);
    });
  }
  
  console.log("\n==== RECOMENDACIONES DEL ASISTENTE AIDUX ====\n");
  
  // Generar preguntas prioritarias
  const { preguntasPrioritarias, preguntasSecundarias } = generarPreguntasPrioritarias(sistemasComprometidos, caso.descripcion);
  
  console.log("PREGUNTAS PRIORITARIAS PARA COMPLETAR HISTORIA CLÍNICA:");
  preguntasPrioritarias.forEach((pregunta, index) => {
    console.log(`  ${index + 1}. ${pregunta}`);
  });
  
  if (preguntasSecundarias.length > 0) {
    console.log("\nPREGUNTAS ADICIONALES RECOMENDADAS:");
    preguntasSecundarias.slice(0, 3).forEach((pregunta, index) => {
      console.log(`  ${index + 1}. ${pregunta}`);
    });
    
    if (preguntasSecundarias.length > 3) {
      console.log(`  ... y ${preguntasSecundarias.length - 3} preguntas adicionales`);
    }
  }
  
  // Sugerir exploración física
  const { exploracionPrioritaria, exploracionSecundaria } = sugerirExploracionFisica(sistemasComprometidos, alertasIdentificadas);
  
  console.log("\nEXPLORACIÓN FÍSICA RECOMENDADA:");
  exploracionPrioritaria.forEach((exploracion, index) => {
    const prefijo = alertasIdentificadas.length > 0 ? "⚠️ " : "";
    console.log(`  ${index + 1}. ${prefijo}${exploracion}`);
  });
  
  if (exploracionSecundaria.length > 0) {
    console.log("\nEXPLORACIÓN COMPLEMENTARIA SUGERIDA:");
    exploracionSecundaria.slice(0, 3).forEach((exploracion, index) => {
      console.log(`  ${index + 1}. ${exploracion}`);
    });
  }
  
  // Sugerir estudios complementarios si es necesario
  const { estudiosBasicos, estudiosEspecificos } = sugerirEstudiosComplementarios(sistemasComprometidos, caso.descripcion);
  
  if (alertasIdentificadas.length > 0 || estudiosEspecificos.length > 0) {
    console.log("\nESTUDIOS A CONSIDERAR:");
    
    estudiosBasicos.forEach((estudio, index) => {
      console.log(`  ${index + 1}. ${estudio}`);
    });
    
    estudiosEspecificos.forEach((estudio, index) => {
      console.log(`  ${estudiosBasicos.length + index + 1}. ⚠️ ${estudio}`);
    });
  }
  
  console.log("\nABORDAJE SUGERIDO:");
  
  if (alertasIdentificadas.length > 0) {
    console.log("  • Priorizar evaluación de signos de alarma identificados");
    console.log("  • Estabilización inicial según hallazgos");
    console.log("  • Considerar interconsulta oportuna según evolución");
  } else {
    console.log("  • Completar historia clínica con las preguntas prioritarias");
    console.log("  • Realizar exploración física enfocada en los sistemas comprometidos");
    console.log("  • Documentar hallazgos para adecuada toma de decisiones");
  }
  
  console.log("\nIMPORTANTE: Este asistente NO realiza diagnósticos, sino que prioriza la obtención");
  console.log("de información clínica relevante según los síntomas reportados por el paciente.");
});

console.log("\n===== FIN DE LA EVALUACIÓN MULTICASO =====\n"); 