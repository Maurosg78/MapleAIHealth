// Simulador de diagnóstico diferencial del asistente AIDUX
console.log("\n===== ASISTENTE CLÍNICO AIDUX - SIMULACIÓN DE DIAGNÓSTICO DIFERENCIAL =====\n");

// Caso clínico complejo con múltiples síntomas y datos parciales
const casoClinicoparcial = {
  descripcion: "Paciente femenina de 42 años que consulta por dolor abdominal difuso de 3 días de evolución, náuseas ocasionales y sensación de distensión. Refiere que el dolor es más intenso después de comer. No presenta fiebre. Menciona episodios similares en el pasado pero menos intensos."
};

// Estructuras de diagnóstico diferencial basadas en síntomas
const diagnosticosDiferenciales = {
  "dolor abdominal": [
    { 
      nombre: "Síndrome de intestino irritable", 
      hallazgos: ["dolor abdominal recurrente", "cambios en hábito intestinal", "distensión", "alivio con defecación"],
      preguntas: [
        "¿El dolor se alivia después de defecar?",
        "¿Ha notado cambios en la consistencia o frecuencia de las deposiciones?",
        "¿El dolor es crónico o recurrente (más de 3 meses)?"
      ],
      exploraciones: [
        "Palpación abdominal para descartar signos de alarma",
        "Evaluar ruidos hidroaéreos"
      ]
    },
    {
      nombre: "Dispepsia funcional",
      hallazgos: ["dolor epigástrico", "saciedad temprana", "distensión", "relación con comidas"],
      preguntas: [
        "¿El dolor se localiza principalmente en la parte superior del abdomen?",
        "¿Se siente llena rápidamente al comer?",
        "¿Presenta acidez o regurgitación?"
      ],
      exploraciones: [
        "Palpación epigástrica",
        "Evaluación de signos de alarma (pérdida de peso, disfagia)"
      ]
    },
    {
      nombre: "Colelitiasis/Colecistitis",
      hallazgos: ["dolor en hipocondrio derecho", "relación con comidas grasas", "náuseas", "vómitos"],
      preguntas: [
        "¿El dolor se localiza en la parte superior derecha del abdomen?",
        "¿El dolor se irradia hacia la espalda o el hombro derecho?",
        "¿Empeora después de comer alimentos grasos?"
      ],
      exploraciones: [
        "Signo de Murphy",
        "Palpación en hipocondrio derecho"
      ]
    },
    {
      nombre: "Enfermedad por reflujo gastroesofágico",
      hallazgos: ["dolor/ardor retroesternal", "regurgitación", "empeora al acostarse", "relación con comidas"],
      preguntas: [
        "¿Presenta ardor o dolor en el pecho?",
        "¿Los síntomas empeoran al acostarse?",
        "¿Ha notado regurgitación de contenido ácido?"
      ],
      exploraciones: [
        "Examinar faringe para signos de irritación",
        "Auscultar esófago durante la deglución"
      ]
    }
  ],
  "náuseas": [
    {
      nombre: "Gastroenteritis",
      hallazgos: ["náuseas", "vómitos", "diarrea", "dolor abdominal", "fiebre"],
      preguntas: [
        "¿Ha presentado diarrea?",
        "¿Ha tenido fiebre?",
        "¿Ha estado en contacto con alguien con síntomas similares?"
      ],
      exploraciones: [
        "Evaluación de signos de deshidratación",
        "Palpación abdominal"
      ]
    },
    {
      nombre: "Intoxicación alimentaria",
      hallazgos: ["náuseas", "vómitos", "dolor abdominal", "inicio agudo", "diarrea"],
      preguntas: [
        "¿Consumió algún alimento sospechoso recientemente?",
        "¿Los síntomas comenzaron bruscamente?",
        "¿Otras personas que comieron lo mismo presentan síntomas?"
      ],
      exploraciones: [
        "Evaluación de signos de deshidratación",
        "Valorar dolor a la palpación abdominal"
      ]
    }
  ],
  "distensión abdominal": [
    {
      nombre: "Síndrome de intestino irritable",
      hallazgos: ["distensión fluctuante", "cambios en hábito intestinal", "dolor relacionado con defecación"],
      preguntas: [
        "¿La distensión varía durante el día?",
        "¿Presenta períodos de estreñimiento alternados con diarrea?",
        "¿La distensión se relaciona con ciertos alimentos?"
      ],
      exploraciones: [
        "Inspección abdominal",
        "Palpación para descartar masas"
      ]
    },
    {
      nombre: "Intolerancia a la lactosa",
      hallazgos: ["distensión", "dolor", "diarrea", "flatulencia", "relación con lácteos"],
      preguntas: [
        "¿Los síntomas aparecen después de consumir lácteos?",
        "¿Presenta aumento de gases o flatulencia?",
        "¿Ha notado mejoría al evitar productos lácteos?"
      ],
      exploraciones: [
        "Palpación abdominal",
        "Evaluación de ruidos intestinales"
      ]
    },
    {
      nombre: "SIBO (Sobrecrecimiento bacteriano del intestino delgado)",
      hallazgos: ["distensión", "dolor", "fatiga", "diarrea", "malabsorción"],
      preguntas: [
        "¿La distensión empeora a lo largo del día?",
        "¿Ha perdido peso sin causa aparente?",
        "¿Presenta flatulencia excesiva?"
      ],
      exploraciones: [
        "Evaluación de signos de malnutrición",
        "Palpación abdominal profunda"
      ]
    }
  ]
};

// Función para analizar texto y detectar síntomas
function detectarSintomas(texto) {
  const sintomasPosibles = [
    "dolor abdominal", "náuseas", "vómitos", "distensión", "fiebre", 
    "diarrea", "estreñimiento", "pérdida de peso", "fatiga",
    "acidez", "regurgitación", "flatulencia", "eructos"
  ];
  
  const sintomasDetectados = [];
  const sintomasNegados = [];
  
  sintomasPosibles.forEach(sintoma => {
    if (texto.toLowerCase().includes(sintoma)) {
      // Verificar si el síntoma está negado
      const patronesNegacion = ["no presenta", "niega", "sin", "ausencia de"];
      
      let esNegado = false;
      for (const negacion of patronesNegacion) {
        const regex = new RegExp(`${negacion}\\s+([\\w\\s,]*)${sintoma}`, 'i');
        if (regex.test(texto.toLowerCase())) {
          esNegado = true;
          break;
        }
      }
      
      if (esNegado) {
        sintomasNegados.push(sintoma);
      } else {
        sintomasDetectados.push(sintoma);
      }
    }
  });
  
  return { presentes: sintomasDetectados, negados: sintomasNegados };
}

// Función para generar diagnósticos diferenciales basados en síntomas
function generarDiagnosticosDiferenciales(sintomas) {
  const diagnosticos = [];
  const puntuaciones = {};
  
  // Recorremos cada síntoma presente
  sintomas.presentes.forEach(sintoma => {
    // Buscamos diagnósticos asociados con ese síntoma
    const diagnosticosDelSintoma = diagnosticosDiferenciales[sintoma] || [];
    
    diagnosticosDelSintoma.forEach(dx => {
      if (!puntuaciones[dx.nombre]) {
        puntuaciones[dx.nombre] = { 
          diagnostico: dx, 
          puntuacion: 0,
          hallazgosCoincidentes: [],
          totalHallazgos: dx.hallazgos.length
        };
        diagnosticos.push(puntuaciones[dx.nombre]);
      }
      
      // Aumentamos la puntuación por tener este síntoma principal
      puntuaciones[dx.nombre].puntuacion += 1;
      
      // Comprobamos si hay hallazgos adicionales que coincidan
      dx.hallazgos.forEach(hallazgo => {
        // Verificamos si el hallazgo está en los síntomas presentes
        if (sintomas.presentes.some(s => hallazgo.includes(s))) {
          if (!puntuaciones[dx.nombre].hallazgosCoincidentes.includes(hallazgo)) {
            puntuaciones[dx.nombre].hallazgosCoincidentes.push(hallazgo);
            puntuaciones[dx.nombre].puntuacion += 0.5;
          }
        }
      });
      
      // Restamos puntuación si hay síntomas negados que deberían estar presentes
      dx.hallazgos.forEach(hallazgo => {
        if (sintomas.negados.some(s => hallazgo.includes(s))) {
          puntuaciones[dx.nombre].puntuacion -= 0.5;
        }
      });
    });
  });
  
  // Calculamos porcentaje de probabilidad
  diagnosticos.forEach(dx => {
    dx.porcentajeHallazgos = Math.round((dx.hallazgosCoincidentes.length / dx.totalHallazgos) * 100);
    
    // Clasificamos la probabilidad
    if (dx.puntuacion >= 2 && dx.porcentajeHallazgos >= 60) {
      dx.probabilidad = "Alta";
      dx.emoji = "🔴";
    } else if (dx.puntuacion >= 1.5 || dx.porcentajeHallazgos >= 40) {
      dx.probabilidad = "Moderada";
      dx.emoji = "🟠";
    } else {
      dx.probabilidad = "Baja";
      dx.emoji = "🟡";
    }
  });
  
  // Ordenamos por puntuación
  return diagnosticos.sort((a, b) => b.puntuacion - a.puntuacion);
}

// Función para generar preguntas adicionales basadas en posibles diagnósticos
function generarPreguntasAdicionales(diagnosticos) {
  const preguntasMap = new Map();
  const exploracionesMap = new Map();
  
  diagnosticos.slice(0, 3).forEach(dx => {
    dx.diagnostico.preguntas.forEach(pregunta => {
      if (!preguntasMap.has(pregunta)) {
        preguntasMap.set(pregunta, dx.probabilidad);
      }
    });
    
    dx.diagnostico.exploraciones.forEach(exploracion => {
      if (!exploracionesMap.has(exploracion)) {
        exploracionesMap.set(exploracion, dx.probabilidad);
      }
    });
  });
  
  // Convertimos el map a un array y ordenamos por probabilidad
  const preguntas = Array.from(preguntasMap.entries())
    .map(([pregunta, probabilidad]) => ({ pregunta, probabilidad }))
    .sort((a, b) => {
      const orden = { "Alta": 0, "Moderada": 1, "Baja": 2 };
      return orden[a.probabilidad] - orden[b.probabilidad];
    });
    
  const exploraciones = Array.from(exploracionesMap.entries())
    .map(([exploracion, probabilidad]) => ({ exploracion, probabilidad }))
    .sort((a, b) => {
      const orden = { "Alta": 0, "Moderada": 1, "Baja": 2 };
      return orden[a.probabilidad] - orden[b.probabilidad];
    });
  
  return { preguntas, exploraciones };
}

// Simulación del proceso de análisis del asistente AIDUX
console.log("CASO CLÍNICO INICIAL:\n");
console.log(`"${casoClinicoparcial.descripcion}"\n`);

console.log("ANÁLISIS DE INFORMACIÓN DISPONIBLE...\n");

// Detectamos los síntomas presentes y negados
const sintomas = detectarSintomas(casoClinicoparcial.descripcion);

console.log("SÍNTOMAS DETECTADOS:");
sintomas.presentes.forEach(sintoma => {
  console.log(`  ✅ ${sintoma}`);
});

console.log("\nSÍNTOMAS NEGADOS/AUSENTES:");
sintomas.negados.forEach(sintoma => {
  console.log(`  ❌ ${sintoma}`);
});

console.log("\nFACTORES RELEVANTES IDENTIFICADOS:");
if (casoClinicoparcial.descripcion.includes("42 años")) {
  console.log("  • Mujer de mediana edad (42 años)");
}
if (casoClinicoparcial.descripcion.includes("más intenso después de comer")) {
  console.log("  • Síntomas relacionados con la ingesta de alimentos");
}
if (casoClinicoparcial.descripcion.includes("episodios similares")) {
  console.log("  • Historia de episodios recurrentes");
}
if (casoClinicoparcial.descripcion.includes("3 días")) {
  console.log("  • Duración subaguda (3 días)");
}

console.log("\n==== DIAGNÓSTICO DIFERENCIAL BASADO EN LA INFORMACIÓN DISPONIBLE ====\n");

// Generamos los diagnósticos diferenciales
const diagnosticos = generarDiagnosticosDiferenciales(sintomas);

console.log("DIAGNÓSTICOS DIFERENCIALES PRIORIZADOS:");
diagnosticos.forEach((dx, index) => {
  console.log(`  ${index + 1}. ${dx.emoji} ${dx.diagnostico.nombre} - Probabilidad: ${dx.probabilidad}`);
  console.log(`     • Hallazgos coincidentes: ${dx.porcentajeHallazgos}% (${dx.hallazgosCoincidentes.join(", ")})`);
});

console.log("\n==== RECOMENDACIONES PARA COMPLETAR LA EVALUACIÓN ====\n");

// Generamos preguntas adicionales basadas en los diagnósticos
const { preguntas, exploraciones } = generarPreguntasAdicionales(diagnosticos);

console.log("PREGUNTAS ADICIONALES RECOMENDADAS:");
preguntas.forEach((item, index) => {
  const prioridadEmoji = item.probabilidad === "Alta" ? "⚠️" : "•";
  console.log(`  ${prioridadEmoji} ${item.pregunta}`);
});

console.log("\nEXPLORACIONES FÍSICAS RECOMENDADAS:");
exploraciones.forEach((item, index) => {
  const prioridadEmoji = item.probabilidad === "Alta" ? "⚠️" : "•";
  console.log(`  ${prioridadEmoji} ${item.exploracion}`);
});

console.log("\n==== INFORMACIÓN COMPLEMENTARIA RECIBIDA ====\n");

// Simulamos que el médico proporciona información adicional
const informacionAdicional = {
  descripcion: "La paciente refiere que el dolor se localiza principalmente en epigastrio y se irradia hacia hipocondrio derecho. El dolor empeora después de comidas abundantes y grasas. No hay cambios en el hábito intestinal. Refiere acidez ocasional. En el examen físico presenta dolor a la palpación en hipocondrio derecho con signo de Murphy positivo."
};

console.log(`"${informacionAdicional.descripcion}"\n`);

// Procesamos la nueva información
console.log("REEVALUANDO DIAGNÓSTICO DIFERENCIAL...\n");

// Simulamos el diagnóstico refinado basado en la nueva información
console.log("DIAGNÓSTICO DIFERENCIAL ACTUALIZADO:");
console.log("  1. 🔴 Colecistitis/Colelitiasis - Probabilidad: Alta");
console.log("     • Hallazgos clave: dolor en hipocondrio derecho, relación con comidas grasas,");
console.log("       signo de Murphy positivo");
console.log("  2. 🟠 Dispepsia funcional - Probabilidad: Moderada");
console.log("     • Hallazgos coincidentes: dolor epigástrico, relación con comidas");
console.log("  3. 🟡 Enfermedad por reflujo gastroesofágico - Probabilidad: Baja");
console.log("     • Hallazgos coincidentes: acidez ocasional");

console.log("\n==== PLAN DE MANEJO RECOMENDADO ====\n");

console.log("ESTUDIOS DIAGNÓSTICOS SUGERIDOS:");
console.log("  1. ⚠️ Ecografía abdominal con enfoque en vías biliares (URGENTE)");
console.log("  2. Pruebas de función hepática (AST, ALT, FA, GGT, bilirrubina)");
console.log("  3. Hemograma completo");
console.log("  4. PCR y VSG para evaluar proceso inflamatorio");

console.log("\nTRATAMIENTO INICIAL:");
console.log("  • Ayuno");
console.log("  • Hidratación");
console.log("  • Analgesia (AINE o espasmolíticos)");
console.log("  • Evaluación por cirugía si se confirma colecistitis");

console.log("\n===== FIN DE LA SIMULACIÓN =====\n"); 