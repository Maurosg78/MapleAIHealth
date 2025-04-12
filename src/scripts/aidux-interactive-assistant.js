// Simulador interactivo avanzado del asistente clínico AIDUX
console.log("\n===== ASISTENTE CLÍNICO AIDUX - SIMULACIÓN INTERACTIVA =====\n");

// Función para detectar síntomas presentes en un texto clínico
function detectarSintomas(texto) {
  const sintomas = [
    { nombre: "dolor", patrones: ["dolor", "dolencia", "molestia"] },
    { nombre: "lumbalgia", patrones: ["lumbar", "lumbalgia", "espalda baja"] },
    { nombre: "radiculopatía", patrones: ["hormigueo", "adormecimiento", "radiación", "irradiación"] },
    { nombre: "debilidad", patrones: ["debilidad", "pérdida de fuerza", "disminución de fuerza"] },
    { nombre: "parestesia", patrones: ["hormigueo", "adormecimiento", "sensación de hormigueo"] }
  ];
  
  const sintomasDetectados = [];
  
  sintomas.forEach(sintoma => {
    for (const patron of sintoma.patrones) {
      if (texto.toLowerCase().includes(patron.toLowerCase())) {
        if (!sintomasDetectados.includes(sintoma.nombre)) {
          sintomasDetectados.push(sintoma.nombre);
        }
        break;
      }
    }
  });
  
  return sintomasDetectados;
}

// Función para evaluar completitud de la historia clínica
function evaluarCompletitud(datosClinicos) {
  const categorias = {
    demograficos: ["nombre", "edad", "genero"],
    sintomas: ["localizacion", "intensidad", "duracion", "factoresModificantes"],
    antecedentes: ["personales", "familiares", "medicacion"],
    examenFisico: ["vital", "general", "especifico"]
  };
  
  const resultado = {
    completo: true,
    camposFaltantes: {},
    porcentajeCompletitud: 0,
    totalCampos: 0,
    camposCompletados: 0
  };
  
  // Contamos todos los campos posibles
  for (const categoria in categorias) {
    resultado.totalCampos += categorias[categoria].length;
    resultado.camposFaltantes[categoria] = [];
    
    // Verificamos si la categoría existe
    if (!datosClinicos[categoria]) {
      resultado.completo = false;
      resultado.camposFaltantes[categoria] = [...categorias[categoria]];
      continue;
    }
    
    // Verificamos cada campo de la categoría
    for (const campo of categorias[categoria]) {
      if (!datosClinicos[categoria][campo] || 
          (typeof datosClinicos[categoria][campo] === 'string' && 
           datosClinicos[categoria][campo].trim() === '')) {
        resultado.completo = false;
        resultado.camposFaltantes[categoria].push(campo);
      } else {
        resultado.camposCompletados++;
      }
    }
  }
  
  resultado.porcentajeCompletitud = Math.round((resultado.camposCompletados / resultado.totalCampos) * 100);
  
  return resultado;
}

// Función para generar recomendaciones y sugerencias clínicas
function generarRecomendaciones(sintomas, evaluacion) {
  const recomendaciones = {
    preguntas: [],
    exploraciones: [],
    diagnosticosDiferenciales: []
  };
  
  // Preguntas para completar información demográfica
  if (evaluacion.camposFaltantes.demograficos && evaluacion.camposFaltantes.demograficos.length > 0) {
    if (evaluacion.camposFaltantes.demograficos.includes("nombre")) {
      recomendaciones.preguntas.push("¿Cuál es el nombre completo del paciente?");
    }
    if (evaluacion.camposFaltantes.demograficos.includes("edad")) {
      recomendaciones.preguntas.push("¿Qué edad tiene el paciente?");
    }
    if (evaluacion.camposFaltantes.demograficos.includes("genero")) {
      recomendaciones.preguntas.push("¿Cuál es el género del paciente?");
    }
  }
  
  // Preguntas y exploraciones basadas en síntomas detectados
  if (sintomas.includes("dolor") || sintomas.includes("lumbalgia")) {
    recomendaciones.preguntas.push(
      "¿Cómo calificaría la intensidad del dolor en una escala del 1 al 10?",
      "¿El dolor es constante o intermitente?",
      "¿Cuándo comenzó el dolor exactamente?",
      "¿Qué actividades empeoran el dolor?",
      "¿Qué posiciones o actividades alivian el dolor?"
    );
    
    recomendaciones.exploraciones.push(
      "Evaluar movilidad de la columna lumbar en flexión, extensión y rotación",
      "Palpar región lumbar para identificar puntos gatillo o contracturas",
      "Evaluar postura en bipedestación"
    );
    
    recomendaciones.diagnosticosDiferenciales.push(
      "Lumbalgia mecánica",
      "Contractura muscular",
      "Espondiloartrosis"
    );
  }
  
  if (sintomas.includes("radiculopatía") || sintomas.includes("parestesia")) {
    recomendaciones.preguntas.push(
      "¿El hormigueo o adormecimiento sigue un patrón o distribución específica?",
      "¿Hay alguna actividad que provoque o alivie estas sensaciones?",
      "¿Ha notado cambios en la fuerza de piernas o pies?"
    );
    
    recomendaciones.exploraciones.push(
      "Realizar prueba de Lasègue (elevación de pierna recta)",
      "Evaluar reflejos tendinosos profundos de miembros inferiores",
      "Evaluar sensibilidad por dermatomas en miembros inferiores",
      "Realizar prueba de fuerza muscular en miembros inferiores"
    );
    
    recomendaciones.diagnosticosDiferenciales.push(
      "Hernia discal lumbar",
      "Radiculopatía L4-L5 o L5-S1",
      "Estenosis de canal lumbar"
    );
  }
  
  if (sintomas.includes("debilidad")) {
    recomendaciones.preguntas.push(
      "¿La debilidad es en una o ambas piernas?",
      "¿La debilidad ha sido progresiva o de inicio súbito?",
      "¿Tiene dificultad para caminar o mantener el equilibrio?",
      "¿Ha notado algún problema con el control de esfínteres?"
    );
    
    recomendaciones.exploraciones.push(
      "⚠️ PRIORIDAD: Evaluar función motora de miembros inferiores",
      "⚠️ PRIORIDAD: Evaluar reflejos tendinosos profundos y cutáneos",
      "⚠️ PRIORIDAD: Evaluar sensibilidad perianal"
    );
    
    recomendaciones.diagnosticosDiferenciales.push(
      "Compresión medular - REQUIERE EVALUACIÓN URGENTE",
      "Síndrome de cauda equina - REQUIERE EVALUACIÓN URGENTE",
      "Hernia discal con compromiso radicular severo"
    );
  }
  
  return recomendaciones;
}

// Definimos un caso clínico inicial con información parcial
let casoClinico = {
  descripcionInicial: "Paciente se presenta a consulta refiriendo dolor en zona lumbar que ha estado molestando desde hace algunos días. A veces siente hormigueo en la pierna derecha. Toma medicamentos que no recuerda bien el nombre.",
  demograficos: {
    nombre: "",
    edad: "",
    genero: ""
  },
  sintomas: {
    localizacion: "lumbar",
    intensidad: "",
    duracion: "algunos días",
    factoresModificantes: ""
  },
  antecedentes: {
    personales: "",
    familiares: "",
    medicacion: "medicamentos no especificados"
  },
  examenFisico: {
    vital: "",
    general: "",
    especifico: ""
  }
};

// Primera interacción - procesamiento inicial
console.log("INFORMACIÓN INICIAL DEL CASO:\n");
console.log(`"${casoClinico.descripcionInicial}"\n`);

// Procesamiento paso a paso (simulado en tiempo real)
console.log("INICIANDO ANÁLISIS DEL CASO CLÍNICO...\n");
setTimeout(() => {
  console.log("PASO 1: DETECCIÓN DE SÍNTOMAS\n");
  
  const sintomasDetectados = detectarSintomas(casoClinico.descripcionInicial);
  console.log("Síntomas detectados en la descripción:");
  sintomasDetectados.forEach(sintoma => {
    console.log(`  ✅ ${sintoma}`);
  });
  
  setTimeout(() => {
    console.log("\nPASO 2: EVALUACIÓN DE COMPLETITUD DE LA HISTORIA\n");
    
    const evaluacion = evaluarCompletitud(casoClinico);
    console.log(`Completitud general: ${evaluacion.porcentajeCompletitud}%`);
    
    console.log("\nCampos faltantes por categoría:");
    for (const categoria in evaluacion.camposFaltantes) {
      if (evaluacion.camposFaltantes[categoria].length > 0) {
        console.log(`  📋 ${categoria}: ${evaluacion.camposFaltantes[categoria].join(", ")}`);
      }
    }
    
    setTimeout(() => {
      console.log("\nPASO 3: GENERACIÓN DE RECOMENDACIONES\n");
      
      const recomendaciones = generarRecomendaciones(sintomasDetectados, evaluacion);
      
      console.log("PREGUNTAS SUGERIDAS:");
      recomendaciones.preguntas.forEach((pregunta, idx) => {
        console.log(`  ${idx + 1}. ${pregunta}`);
      });
      
      console.log("\nEXPLORACIONES RECOMENDADAS:");
      recomendaciones.exploraciones.forEach((exploracion, idx) => {
        console.log(`  ${idx + 1}. ${exploracion}`);
      });
      
      console.log("\nDIAGNÓSTICOS DIFERENCIALES A CONSIDERAR:");
      recomendaciones.diagnosticosDiferenciales.forEach((dx, idx) => {
        console.log(`  ${idx + 1}. ${dx}`);
      });
      
      // Simulamos que el médico ha añadido información adicional
      setTimeout(() => {
        console.log("\n==== INFORMACIÓN ADICIONAL PROPORCIONADA POR EL MÉDICO ====\n");
        
        const informacionAdicional = "El paciente es Carlos Rodríguez, tiene 45 años, masculino. El dolor comenzó hace 5 días después de levantar unas cajas pesadas. Es punzante, intensidad 7/10, empeora al inclinarse y mejora con reposo.";
        console.log(`"${informacionAdicional}"\n`);
        
        // Actualizamos el caso clínico con la nueva información
        casoClinico.demograficos.nombre = "Carlos Rodríguez";
        casoClinico.demograficos.edad = "45";
        casoClinico.demograficos.genero = "masculino";
        casoClinico.sintomas.duracion = "5 días";
        casoClinico.sintomas.intensidad = "7/10";
        casoClinico.sintomas.factoresModificantes = "empeora al inclinarse, mejora con reposo";
        casoClinico.antecedentes.personales = "levantamiento de cajas pesadas (factor desencadenante)";
        
        console.log("REEVALUANDO CASO CON NUEVA INFORMACIÓN...\n");
        
        setTimeout(() => {
          console.log("ANÁLISIS ACTUALIZADO:\n");
          
          const nuevaEvaluacion = evaluarCompletitud(casoClinico);
          console.log(`Completitud general actualizada: ${nuevaEvaluacion.porcentajeCompletitud}%`);
          
          console.log("\nCampos completados:");
          console.log(`  ✅ Datos demográficos: nombre, edad, género`);
          console.log(`  ✅ Características del dolor: localización, intensidad, duración, factores modificantes`);
          console.log(`  ✅ Factor desencadenante identificado: levantamiento de cajas pesadas`);
          
          console.log("\nInformación pendiente prioritaria:");
          if (nuevaEvaluacion.camposFaltantes.examenFisico && 
              nuevaEvaluacion.camposFaltantes.examenFisico.length > 0) {
            console.log(`  ⚠️ Examen físico completo`);
          }
          if (nuevaEvaluacion.camposFaltantes.antecedentes && 
              nuevaEvaluacion.camposFaltantes.antecedentes.includes("personales")) {
            console.log(`  ⚠️ Antecedentes médicos personales completos`);
          }
          
          setTimeout(() => {
            console.log("\nANÁLISIS DE BANDERAS ROJAS (RED FLAGS):\n");
            
            // Detección de banderas rojas basadas en la información actual
            console.log("SIGNOS DE ALARMA A DESCARTAR:");
            const banderasRojas = [
              "Control de esfínteres: No evaluado ⚠️",
              "Debilidad progresiva: No evaluada ⚠️",
              "Síntomas bilaterales: No evaluados ⚠️",
              "Fiebre o signos de infección: No evaluados ⚠️"
            ];
            
            banderasRojas.forEach(bandera => {
              console.log(`  • ${bandera}`);
            });
            
            setTimeout(() => {
              console.log("\nRECOMENDACIONES ACTUALIZADAS BASADAS EN NUEVA INFORMACIÓN:\n");
              
              const sintomasActualizados = [...sintomasDetectados, "mecánico"];
              const recomendacionesActualizadas = generarRecomendaciones(sintomasActualizados, nuevaEvaluacion);
              
              console.log("PREGUNTAS PRIORITARIAS:");
              [
                "¿Presenta alguna alteración en el control de esfínteres?",
                "¿Tiene antecedentes médicos relevantes como diabetes, hipertensión o problemas de columna previos?",
                "¿Ha experimentado episodios similares anteriormente?",
                "¿El dolor se ha extendido a otras áreas además de la pierna derecha?",
                "¿Presenta debilidad en las piernas al caminar?"
              ].forEach((pregunta, idx) => {
                console.log(`  ${idx + 1}. ${pregunta}`);
              });
              
              console.log("\nEXAMEN FÍSICO PRIORITARIO:");
              [
                "Signo de Lasègue bilateral",
                "Evaluación de fuerza en extremidades inferiores",
                "Evaluación de reflejos osteotendinosos",
                "Evaluación de sensibilidad en dermatomas L4, L5 y S1",
                "Palpación de musculatura paravertebral y puntos dolorosos"
              ].forEach((examen, idx) => {
                console.log(`  ${idx + 1}. ${examen}`);
              });
              
              console.log("\nDIAGNÓSTICO DIFERENCIAL REFINADO:");
              [
                "Lumbalgia mecánica aguda por esfuerzo 🟢 (Alta probabilidad)",
                "Hernia discal lumbar con radiculopatía 🟡 (Probabilidad moderada)",
                "Esguince/distensión lumbar 🟡 (Probabilidad moderada)"
              ].forEach((dx, idx) => {
                console.log(`  ${idx + 1}. ${dx}`);
              });
              
              setTimeout(() => {
                console.log("\nPLAN DE MANEJO SUGERIDO (PENDIENTE DE COMPLETAR EVALUACIÓN):\n");
                
                console.log("ESTUDIOS COMPLEMENTARIOS A CONSIDERAR:");
                [
                  "Radiografía de columna lumbosacra en bipedestación (AP y lateral)",
                  "Considerar resonancia magnética si hay signos/síntomas de radiculopatía persistente"
                ].forEach((estudio, idx) => {
                  console.log(`  ${idx + 1}. ${estudio}`);
                });
                
                console.log("\nOPCIONES TERAPÉUTICAS INICIALES A CONSIDERAR:");
                [
                  "Reposo relativo por 48-72 horas",
                  "Analgesia con AINE (considerar contraindicaciones)",
                  "Relajante muscular por 5-7 días",
                  "Aplicación de calor local",
                  "Evaluación por fisiatría/fisioterapia una vez controlado el dolor agudo"
                ].forEach((terapia, idx) => {
                  console.log(`  ${idx + 1}. ${terapia}`);
                });
                
                console.log("\n===== FIN DE LA SIMULACIÓN INTERACTIVA =====\n");
                console.log("Esta simulación ilustra cómo el asistente AIDUX procesa información clínica");
                console.log("parcial y genera recomendaciones específicas a medida que se completa la historia.");
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 2000);
    }, 1000);
  }, 1000);
}, 1000); 