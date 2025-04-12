// Asistente clínico AIDUX - Enfoque en priorización de información
console.log("\n===== ASISTENTE CLÍNICO AIDUX - PRIORIZACIÓN CLÍNICA =====\n");

// Bibliotecas de patrones sintomáticos y signos clínicos
const patronesSintomaticos = {
  neurologicos: [
    { patron: "cefalea", asociaciones: ["intensidad", "localización", "duración", "factores modificantes"] },
    { patron: "mareo", asociaciones: ["vértigo", "inestabilidad", "presíncope"] },
    { patron: "debilidad", asociaciones: ["focal", "generalizada", "progresiva", "súbita"] },
    { patron: "parestesias", asociaciones: ["hormigueo", "adormecimiento", "distribución", "progresión"] }
  ],
  cardiopulmonares: [
    { patron: "dolor torácico", asociaciones: ["opresivo", "punzante", "irradiado", "esfuerzo"] },
    { patron: "disnea", asociaciones: ["esfuerzo", "reposo", "ortopnea", "paroxística"] },
    { patron: "palpitaciones", asociaciones: ["frecuencia", "regularidad", "duración", "desencadenantes"] },
    { patron: "tos", asociaciones: ["seca", "productiva", "hemoptisis", "duración"] }
  ],
  digestivos: [
    { patron: "dolor abdominal", asociaciones: ["localización", "tipo", "irradiación", "factores modificantes"] },
    { patron: "náuseas/vómitos", asociaciones: ["contenido", "frecuencia", "relación con comidas"] },
    { patron: "diarrea", asociaciones: ["frecuencia", "consistencia", "duración", "presencia de sangre"] },
    { patron: "estreñimiento", asociaciones: ["duración", "patrón", "cambio reciente"] }
  ],
  musculoesqueléticos: [
    { patron: "dolor articular", asociaciones: ["monoarticular", "poliarticular", "simétrico", "inflamatorio"] },
    { patron: "dolor lumbar", asociaciones: ["irradiación", "factores modificantes", "trauma", "banderas rojas"] },
    { patron: "limitación funcional", asociaciones: ["rigidez", "impotencia funcional", "patrón"] }
  ]
};

// Función para detectar patrones en el texto clínico
function detectarPatrones(texto) {
  const patronesDetectados = [];
  
  // Recorrer todos los sistemas
  Object.keys(patronesSintomaticos).forEach(sistema => {
    patronesSintomaticos[sistema].forEach(patronItem => {
      if (texto.toLowerCase().includes(patronItem.patron.toLowerCase())) {
        patronesDetectados.push({
          sistema: sistema,
          patron: patronItem.patron,
          asociaciones: patronItem.asociaciones
        });
      }
      
      // Buscar también asociaciones
      patronItem.asociaciones.forEach(asociacion => {
        if (texto.toLowerCase().includes(asociacion.toLowerCase())) {
          // Verificamos si el patrón principal ya fue detectado
          const patronExistente = patronesDetectados.find(p => 
            p.patron === patronItem.patron && p.sistema === sistema
          );
          
          if (!patronExistente) {
            patronesDetectados.push({
              sistema: sistema,
              patron: patronItem.patron,
              asociaciones: [asociacion]
            });
          } else {
            // Agregar esta asociación si no está ya incluida
            if (!patronExistente.asociacionesDetectadas) {
              patronExistente.asociacionesDetectadas = [];
            }
            if (!patronExistente.asociacionesDetectadas.includes(asociacion)) {
              patronExistente.asociacionesDetectadas.push(asociacion);
            }
          }
        }
      });
    });
  });
  
  return patronesDetectados;
}

// Función para evaluar la completitud de la información
function evaluarCompletitud(patronesDetectados) {
  const resultado = [];
  
  patronesDetectados.forEach(patron => {
    const infoCompleta = {
      patron: patron.patron,
      sistema: patron.sistema,
      informacionFaltante: [],
      completitud: 0
    };
    
    // Verificar qué asociaciones fueron detectadas
    patron.asociaciones.forEach(asociacion => {
      const asociacionDetectada = patron.asociacionesDetectadas && 
                                 patron.asociacionesDetectadas.includes(asociacion);
      
      if (!asociacionDetectada) {
        infoCompleta.informacionFaltante.push(asociacion);
      }
    });
    
    // Calcular porcentaje de completitud
    const totalAsociaciones = patron.asociaciones.length;
    const asociacionesDetectadas = totalAsociaciones - infoCompleta.informacionFaltante.length;
    infoCompleta.completitud = Math.round((asociacionesDetectadas / totalAsociaciones) * 100);
    
    resultado.push(infoCompleta);
  });
  
  return resultado;
}

// Función para priorizar la información que falta recolectar
function priorizarInformacionFaltante(evaluacionCompletitud) {
  // Criterios de priorización:
  // 1. Síntomas/signos con banderas rojas potenciales
  // 2. Síntomas/signos con menor completitud 
  // 3. Información básica esencial (tiempo, intensidad, factores modificantes)
  
  const prioridadAlta = [];
  const prioridadMedia = [];
  const prioridadBaja = [];
  
  // Patrones prioritarios por sistema (banderas rojas potenciales)
  const patronesPrioritarios = {
    neurologicos: ["cefalea súbita intensa", "alteración de conciencia", "déficit focal"],
    cardiopulmonares: ["dolor torácico opresivo", "disnea súbita", "síncope"],
    digestivos: ["dolor abdominal agudo", "rectorragia", "ictericia"],
    musculoesqueléticos: ["dolor lumbar con síntomas neurológicos", "impotencia funcional súbita"]
  };
  
  // Asociaciones esenciales para cualquier síntoma
  const asociacionesEsenciales = ["intensidad", "duración", "factores modificantes", "progresión"];
  
  evaluacionCompletitud.forEach(item => {
    // Primero revisar si es un patrón prioritario
    let esPrioritario = false;
    
    Object.keys(patronesPrioritarios).forEach(sistema => {
      if (sistema === item.sistema) {
        esPrioritario = patronesPrioritarios[sistema].some(patron => 
          item.patron.includes(patron) || patron.includes(item.patron)
        );
      }
    });
    
    // Verificar si falta información esencial
    const faltaInfoEsencial = item.informacionFaltante.some(info => 
      asociacionesEsenciales.includes(info)
    );
    
    // Asignar prioridad
    if (esPrioritario || item.completitud < 30) {
      item.informacionFaltante.forEach(info => {
        prioridadAlta.push({
          patron: item.patron,
          infoFaltante: info,
          sistema: item.sistema
        });
      });
    } else if (faltaInfoEsencial || item.completitud < 70) {
      item.informacionFaltante.forEach(info => {
        if (asociacionesEsenciales.includes(info)) {
          prioridadAlta.push({
            patron: item.patron,
            infoFaltante: info,
            sistema: item.sistema
          });
        } else {
          prioridadMedia.push({
            patron: item.patron,
            infoFaltante: info,
            sistema: item.sistema
          });
        }
      });
    } else {
      item.informacionFaltante.forEach(info => {
        prioridadBaja.push({
          patron: item.patron,
          infoFaltante: info,
          sistema: item.sistema
        });
      });
    }
  });
  
  return { prioridadAlta, prioridadMedia, prioridadBaja };
}

// Función para generar preguntas dirigidas
function generarPreguntas(prioridades) {
  const resultado = {
    preguntasAlta: [],
    preguntasMedia: [],
    preguntasBaja: []
  };
  
  // Generar preguntas de alta prioridad
  prioridades.prioridadAlta.forEach(item => {
    let pregunta = "";
    
    switch(item.infoFaltante) {
      case "intensidad":
        pregunta = `¿Podría describir la intensidad del ${item.patron} en una escala del 1 al 10?`;
        break;
      case "duración":
        pregunta = `¿Cuánto tiempo lleva experimentando el ${item.patron}?`;
        break;
      case "localización":
        pregunta = `¿Podría señalar exactamente dónde se localiza el ${item.patron}?`;
        break;
      case "factores modificantes":
        pregunta = `¿Hay algo que empeore o mejore el ${item.patron}?`;
        break;
      case "irradiación":
        pregunta = `¿El ${item.patron} se irradia o extiende hacia alguna otra zona?`;
        break;
      case "progresión":
        pregunta = `¿Cómo ha evolucionado el ${item.patron} desde que comenzó?`;
        break;
      default:
        pregunta = `Respecto al ${item.patron}, ¿podría brindar información sobre ${item.infoFaltante}?`;
    }
    
    if (!resultado.preguntasAlta.includes(pregunta)) {
      resultado.preguntasAlta.push(pregunta);
    }
  });
  
  // Generar preguntas de prioridad media
  prioridades.prioridadMedia.forEach(item => {
    let pregunta = "";
    
    switch(item.infoFaltante) {
      case "frecuencia":
        pregunta = `¿Con qué frecuencia presenta el ${item.patron}?`;
        break;
      case "desencadenantes":
        pregunta = `¿Ha identificado algún factor que desencadene el ${item.patron}?`;
        break;
      default:
        pregunta = `En relación al ${item.patron}, ¿cómo describiría ${item.infoFaltante}?`;
    }
    
    if (!resultado.preguntasMedia.includes(pregunta)) {
      resultado.preguntasMedia.push(pregunta);
    }
  });
  
  // Generar preguntas de baja prioridad
  prioridades.prioridadBaja.forEach(item => {
    const pregunta = `Para completar la información: ¿podría detallar ${item.infoFaltante} en relación al ${item.patron}?`;
    
    if (!resultado.preguntasBaja.includes(pregunta)) {
      resultado.preguntasBaja.push(pregunta);
    }
  });
  
  return resultado;
}

// Función para sugerir estudios o evaluaciones sin mencionar diagnósticos
function sugerirEvaluaciones(patronesDetectados) {
  const sugerencias = [];
  
  // Mapeo de patrones a evaluaciones recomendadas, sin mencionar diagnósticos específicos
  const evaluacionesPorPatron = {
    "cefalea": [
      "Evaluación de signos vitales con énfasis en presión arterial",
      "Exploración neurológica básica",
      "Evaluación de rigidez nucal",
      "Valoración de fondo de ojo"
    ],
    "dolor lumbar": [
      "Evaluación de la movilidad de columna",
      "Valoración de sensibilidad y fuerza en miembros inferiores",
      "Prueba de Lasègue (elevación de pierna recta)",
      "Evaluación de reflejos osteotendinosos"
    ],
    "dolor abdominal": [
      "Palpación abdominal por cuadrantes",
      "Auscultación de ruidos hidroaéreos",
      "Evaluación de signos de irritación peritoneal",
      "Valoración de signos vitales con énfasis en temperatura"
    ],
    "dolor torácico": [
      "Toma de signos vitales completos",
      "Auscultación cardiopulmonar",
      "Evaluación de pulsos periféricos",
      "Valoración de simetría en tórax"
    ],
    "disnea": [
      "Medición de saturación de oxígeno",
      "Auscultación pulmonar detallada",
      "Evaluación de uso de músculos accesorios",
      "Valoración de frecuencia respiratoria en reposo y con actividad mínima"
    ]
  };
  
  // Generar sugerencias basadas en patrones detectados
  patronesDetectados.forEach(patron => {
    const evaluaciones = evaluacionesPorPatron[patron.patron];
    
    if (evaluaciones) {
      evaluaciones.forEach(evaluacion => {
        if (!sugerencias.includes(evaluacion)) {
          sugerencias.push(evaluacion);
        }
      });
    }
  });
  
  // Si no hay sugerencias específicas, dar recomendaciones generales
  if (sugerencias.length === 0) {
    sugerencias.push(
      "Evaluación de signos vitales completos",
      "Exploración física general orientada por síntomas",
      "Valoración del estado general del paciente"
    );
  }
  
  return sugerencias;
}

// Función para ofrecer consideraciones clínicas sin diagnosticar
function generarConsideracionesClinicas(patronesDetectados) {
  const consideraciones = [];
  const banderasRojas = [];
  
  // Mapeo de patrones a consideraciones clínicas importantes
  const consideracionesPorPatron = {
    "cefalea": {
      consideraciones: [
        "La presentación y características del dolor de cabeza pueden orientar sobre el abordaje más apropiado",
        "Importante valorar si hay patrones temporales o factores desencadenantes consistentes",
        "El impacto en la funcionalidad del paciente es un factor relevante para el manejo"
      ],
      banderasRojas: [
        "Inicio súbito e intenso ('peor dolor de cabeza')",
        "Presencia de fiebre y rigidez nucal",
        "Alteración del estado de conciencia o déficit neurológico focal",
        "Cefalea que despierta al paciente del sueño"
      ]
    },
    "dolor lumbar": {
      consideraciones: [
        "La duración de los síntomas y la presencia de irradiación orientan el enfoque terapéutico",
        "La respuesta a analgésicos previos puede guiar el manejo farmacológico",
        "Los factores ergonómicos y ocupacionales son importantes para el manejo integral"
      ],
      banderasRojas: [
        "Alteración de esfínteres o síndrome de cauda equina",
        "Déficit neurológico progresivo",
        "Dolor que no cede con reposo o empeora en decúbito",
        "Antecedente de trauma significativo o paciente >50 años con primer episodio"
      ]
    },
    "dolor abdominal": {
      consideraciones: [
        "La localización y migración del dolor orientan sobre las estructuras potencialmente involucradas",
        "La temporalidad y relación con comidas o evacuaciones aporta información valiosa",
        "Los antecedentes quirúrgicos abdominales modifican el enfoque evaluativo"
      ],
      banderasRojas: [
        "Dolor súbito e intenso",
        "Signos de irritación peritoneal",
        "Hipotensión o taquicardia asociadas",
        "Vómitos con sangre o heces melénicas"
      ]
    },
    "dolor torácico": {
      consideraciones: [
        "Las características del dolor, factores desencadenantes y duración orientan la evaluación",
        "La presencia de síntomas asociados como disnea o diaforesis aumenta la especificidad",
        "Los factores de riesgo cardiovascular contextualizan la interpretación de los síntomas"
      ],
      banderasRojas: [
        "Dolor opresivo irradiado a mandíbula o brazo izquierdo",
        "Asociación con disnea, náuseas o síncope",
        "Cambios en signos vitales (hipotensión, taquicardia)",
        "Inicio durante el esfuerzo o en contexto de factores de riesgo cardiovascular"
      ]
    }
  };
  
  // Generar consideraciones para los patrones detectados
  patronesDetectados.forEach(patron => {
    const info = consideracionesPorPatron[patron.patron];
    
    if (info) {
      info.consideraciones.forEach(consideracion => {
        if (!consideraciones.includes(consideracion)) {
          consideraciones.push(consideracion);
        }
      });
      
      info.banderasRojas.forEach(bandera => {
        if (!banderasRojas.includes(bandera)) {
          banderasRojas.push(bandera);
        }
      });
    }
  });
  
  return { consideraciones, banderasRojas };
}

// Caso clínico de ejemplo
const casoClinico = {
  descripcion: "Paciente de 56 años que refiere dolor lumbar de 3 días de evolución. Señala que el dolor se intensifica al agacharse y mejoría parcial con el reposo. Refiere hormigueo ocasional en miembro inferior derecho."
};

// Procesar el caso clínico
console.log("INFORMACIÓN RECIBIDA:\n");
console.log(`"${casoClinico.descripcion}"\n`);

console.log("ANALIZANDO INFORMACIÓN...\n");

// Detectar patrones en el texto
const patronesDetectados = detectarPatrones(casoClinico.descripcion);

console.log("PATRONES DETECTADOS:");
patronesDetectados.forEach(patron => {
  console.log(`  • ${patron.patron} (sistema ${patron.sistema})`);
  if (patron.asociacionesDetectadas && patron.asociacionesDetectadas.length > 0) {
    console.log(`    Información presente: ${patron.asociacionesDetectadas.join(", ")}`);
  }
});

// Evaluar completitud de la información
const evaluacionCompletitud = evaluarCompletitud(patronesDetectados);

console.log("\nANÁLISIS DE COMPLETITUD:");
evaluacionCompletitud.forEach(item => {
  console.log(`  • ${item.patron}: ${item.completitud}% de información recopilada`);
  if (item.informacionFaltante.length > 0) {
    console.log(`    Información faltante: ${item.informacionFaltante.join(", ")}`);
  }
});

// Priorizar información faltante
const prioridades = priorizarInformacionFaltante(evaluacionCompletitud);

console.log("\n==== RECOMENDACIONES DEL ASISTENTE AIDUX ====\n");

// Generar preguntas dirigidas
const preguntas = generarPreguntas(prioridades);

console.log("PREGUNTAS PRIORITARIAS PARA COMPLETAR HISTORIA CLÍNICA:");
preguntas.preguntasAlta.forEach((pregunta, index) => {
  console.log(`  ${index + 1}. ⚠️ ${pregunta}`);
});

if (preguntas.preguntasMedia.length > 0) {
  console.log("\nPREGUNTAS ADICIONALES IMPORTANTES:");
  preguntas.preguntasMedia.forEach((pregunta, index) => {
    console.log(`  ${index + 1}. ${pregunta}`);
  });
}

// Sugerir evaluaciones
const sugerenciasEvaluacion = sugerirEvaluaciones(patronesDetectados);

console.log("\nEVALUACIÓN FÍSICA SUGERIDA:");
sugerenciasEvaluacion.forEach((sugerencia, index) => {
  console.log(`  ${index + 1}. ${sugerencia}`);
});

// Generar consideraciones clínicas
const { consideraciones, banderasRojas } = generarConsideracionesClinicas(patronesDetectados);

console.log("\nCONSIDERACIONES CLÍNICAS IMPORTANTES:");
consideraciones.forEach((consideracion, index) => {
  console.log(`  • ${consideracion}`);
});

console.log("\nASPECTOS A VIGILAR (BANDERAS ROJAS POTENCIALES):");
banderasRojas.forEach((bandera, index) => {
  console.log(`  ⚠️ ${bandera}`);
});

console.log("\n==== NUEVA INFORMACIÓN PROPORCIONADA ====\n");

// Simulación de información adicional proporcionada por el profesional
const informacionAdicional = {
  descripcion: "El paciente refiere que el dolor es de intensidad 7/10, niega traumatismo previo. El hormigueo se extiende por cara lateral de pierna derecha hasta el pie. Ha notado discreta pérdida de fuerza al caminar. Tiene antecedentes de hipertensión controlada con medicación."
};

console.log(`"${informacionAdicional.descripcion}"\n`);

console.log("ACTUALIZANDO ANÁLISIS CON NUEVA INFORMACIÓN...\n");

// Actualización de recomendaciones con la información combinada
const descripcionCompleta = casoClinico.descripcion + " " + informacionAdicional.descripcion;
const patronesActualizados = detectarPatrones(descripcionCompleta);

console.log("INFORMACIÓN ACTUALIZADA:");
patronesActualizados.forEach(patron => {
  console.log(`  • ${patron.patron} (sistema ${patron.sistema})`);
  if (patron.asociacionesDetectadas && patron.asociacionesDetectadas.length > 0) {
    console.log(`    Información presente: ${patron.asociacionesDetectadas.join(", ")}`);
  }
});

// Generar nuevas recomendaciones
console.log("\nPRIORIDADES ACTUALIZADAS:\n");

console.log("INTERVENCIONES PRIORITARIAS:");
console.log("  1. ⚠️ Evaluación neurológica completa de miembros inferiores (dermatomas L4-S1)");
console.log("  2. ⚠️ Verificar integridad de reflejos osteotendinosos y fuerza muscular");
console.log("  3. ⚠️ Evaluación específica de control de esfínteres");

console.log("\nESTUDIOS COMPLEMENTARIOS A CONSIDERAR:");
console.log("  • Estudios de imagen de columna lumbosacra");
console.log("  • Evaluación de parámetros inflamatorios");

console.log("\nMEDIDAS TERAPÉUTICAS INICIALES A VALORAR:");
console.log("  • Analgesia multimodal según intensidad referida (7/10)");
console.log("  • Medidas físicas complementarias");
console.log("  • Reposo relativo con recomendaciones posturales específicas");

console.log("\n===== FIN DE LA SIMULACIÓN =====\n");
console.log("Nota: Este asistente no proporciona diagnósticos directos, sino que prioriza");
console.log("la recolección de información y sugerencias según la relevancia clínica."); 