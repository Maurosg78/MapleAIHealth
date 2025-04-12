// Simulador de interacción con asistente clínico AIDUX
console.log("\n===== SIMULACIÓN DE ASISTENTE CLÍNICO AIDUX =====\n");

// Caso clínico con información intencionalmente incompleta
const casoClinicoIncompleto = {
  descripcion: "Paciente se presenta a consulta refiriendo dolor en zona lumbar que ha estado molestando desde hace algunos días. A veces siente hormigueo en la pierna derecha. Toma medicamentos que no recuerda bien el nombre."
};

console.log("CASO CLÍNICO INGRESADO:\n");
console.log(`"${casoClinicoIncompleto.descripcion}"\n`);
console.log("ANALIZANDO CASO CLÍNICO...\n");

// Simulación de procesamiento del asistente AIDUX
function simulateAIDUXAssistant(casoClinico) {
  console.log("==== ANÁLISIS DE DATOS INCOMPLETOS ====\n");
  
  // Análisis de datos básicos del paciente
  console.log("🔍 DATOS DEMOGRÁFICOS:");
  const datosBasicosFaltantes = [
    "No se ha especificado el nombre del paciente",
    "No se ha especificado la edad del paciente",
    "No se ha especificado el género del paciente",
    "No se ha especificado la fecha de consulta"
  ];
  
  datosBasicosFaltantes.forEach(dato => {
    console.log(`  ❌ ${dato}`);
  });
  
  console.log("\n🔍 ANÁLISIS DE SÍNTOMAS PRINCIPALES:");
  console.log("  ✅ Se ha identificado: dolor lumbar");
  console.log("  ✅ Se ha identificado: hormigueo en pierna derecha");
  console.log("  ❌ No se ha caracterizado completamente el dolor (intensidad, factores modificantes)");
  console.log("  ❌ No se ha especificado la duración exacta del dolor");
  console.log("  ❌ No se ha especificado si hay factores desencadenantes");
  
  console.log("\n🔍 ANÁLISIS DE ANTECEDENTES:");
  console.log("  ❌ No se han registrado antecedentes médicos del paciente");
  console.log("  ❌ No se han registrado antecedentes quirúrgicos");
  console.log("  ❓ Medicación actual no está claramente definida");
  
  console.log("\n🔍 ANÁLISIS DE EXAMEN FÍSICO:");
  console.log("  ❌ No se ha registrado examen físico");
  
  console.log("\n==== RECOMENDACIONES DEL ASISTENTE AIDUX ====\n");
  
  console.log("📋 PREGUNTAS SUGERIDAS PARA COMPLETAR HISTORIA CLÍNICA:\n");
  
  const preguntasDemograficas = [
    "¿Cuál es el nombre completo del paciente?",
    "¿Qué edad tiene el paciente?",
    "¿Cuál es el género del paciente?"
  ];
  
  const preguntasDolor = [
    "¿Cuándo exactamente comenzó el dolor lumbar?",
    "En una escala del 1 al 10, ¿cómo calificaría la intensidad del dolor?",
    "¿El dolor es constante o intermitente?",
    "¿Qué factores empeoran el dolor? (ej. flexión, sentarse, caminar)",
    "¿Qué factores alivian el dolor?",
    "¿El dolor se irradia hacia alguna zona además del hormigueo en la pierna derecha?",
    "¿Ha experimentado cambios en la sensibilidad o fuerza en las piernas?"
  ];
  
  const preguntasAntecedentes = [
    "¿Tiene antecedentes de problemas de columna o lesiones previas?",
    "¿Ha tenido episodios similares anteriormente?",
    "¿Tiene alguna enfermedad crónica diagnosticada?",
    "¿Podría especificar qué medicamentos está tomando actualmente?",
    "¿Ha tenido alguna cirugía previa, especialmente relacionada con la columna?"
  ];
  
  const preguntasExamenFisico = [
    "Evaluar rango de movimiento de columna lumbar",
    "Realizar prueba de Lasègue (elevación de pierna recta)",
    "Evaluar fuerza muscular en extremidades inferiores",
    "Evaluar reflejos tendinosos profundos",
    "Verificar sensibilidad en dermatomas lumbares y sacros",
    "Evaluar marcha y postura"
  ];
  
  console.log("DATOS DEMOGRÁFICOS:");
  preguntasDemograficas.forEach((pregunta, index) => {
    console.log(`  ${index + 1}. ${pregunta}`);
  });
  
  console.log("\nCARACTERIZACIÓN DEL DOLOR:");
  preguntasDolor.forEach((pregunta, index) => {
    console.log(`  ${index + 1}. ${pregunta}`);
  });
  
  console.log("\nANTECEDENTES RELEVANTES:");
  preguntasAntecedentes.forEach((pregunta, index) => {
    console.log(`  ${index + 1}. ${pregunta}`);
  });
  
  console.log("\nEXAMEN FÍSICO RECOMENDADO:");
  preguntasExamenFisico.forEach((elemento, index) => {
    console.log(`  ${index + 1}. ${elemento}`);
  });
  
  console.log("\n==== DIAGNÓSTICOS DIFERENCIALES A CONSIDERAR ====\n");
  console.log("⚠️ ADVERTENCIA: Con la información actual, no es posible establecer diagnósticos precisos.");
  console.log("Se requerirá información completa para generar diagnósticos diferenciales apropiados.\n");
  
  const diagnosticosPosibles = [
    "Lumbalgia mecánica inespecífica",
    "Hernia de disco lumbar",
    "Radiculopatía lumbar",
    "Estenosis del canal lumbar",
    "Espondilolistesis"
  ];
  
  console.log("DIAGNÓSTICOS A CONSIDERAR UNA VEZ SE COMPLETE LA INFORMACIÓN:");
  diagnosticosPosibles.forEach((dx, index) => {
    console.log(`  ${index + 1}. ${dx}`);
  });
  
  console.log("\n==== SIGUIENTE INTERACCIÓN SIMULADA ====\n");
  
  // Simulamos que el médico proporciona información adicional
  const informacionAdicional = {
    nombre: "Carlos Rodríguez",
    edad: 45,
    genero: "masculino",
    detallesDolor: "El dolor comenzó hace 5 días después de levantar unas cajas pesadas. Es punzante, intensidad 7/10, empeora al inclinarse y mejora con reposo."
  };
  
  console.log("MÉDICO AÑADE INFORMACIÓN:\n");
  console.log(`"El paciente es ${informacionAdicional.nombre}, tiene ${informacionAdicional.edad} años, ${informacionAdicional.genero}. ${informacionAdicional.detallesDolor}"\n`);
  
  console.log("RESPUESTA DEL ASISTENTE:\n");
  console.log("✅ Datos demográficos registrados correctamente");
  console.log("✅ Se ha caracterizado mejor el dolor");
  console.log("✅ Se ha identificado posible factor desencadenante: levantamiento de peso\n");
  
  console.log("CONTINUANDO ANÁLISIS - PREGUNTAS ADICIONALES PRIORITARIAS:\n");
  
  const preguntasPrioritarias = [
    "¿El paciente presenta alteraciones en el control de esfínteres vesical o anal?",
    "¿Existe debilidad progresiva en las extremidades inferiores?",
    "¿Presenta fiebre o malestar general?"
  ];
  
  console.log("PREGUNTAS URGENTES (posibles banderas rojas):");
  preguntasPrioritarias.forEach((pregunta, index) => {
    console.log(`  ${index + 1}. ${pregunta}`);
  });
  
  console.log("\nEXAMEN FÍSICO ACTUALIZADO - PRIORIDADES:");
  [
    "Verificar signos de compresión radicular (Lasègue, fuerza y reflejos)",
    "Evaluar puntos específicos de dolor y contractura muscular paravertebral",
    "Descartar déficit motor o sensitivo en miembros inferiores"
  ].forEach((item, index) => {
    console.log(`  ${index + 1}. ${item}`);
  });
  
  console.log("\n==== REFINAMIENTO DE HIPÓTESIS DIAGNÓSTICAS ====\n");
  
  console.log("Con la nueva información proporcionada, los diagnósticos más probables son:");
  console.log("  1. Lumbalgia mecánica aguda por esfuerzo 🟢 (Alta probabilidad)");
  console.log("  2. Hernia discal lumbar 🟡 (Probabilidad moderada)");
  console.log("  3. Radiculopatía lumbar 🟡 (Probabilidad moderada)");
  
  console.log("\n===== FIN DE LA SIMULACIÓN =====\n");
  console.log("Nota: Esta es una simulación del comportamiento esperado del asistente AIDUX.");
  console.log("El sistema real integraría estos análisis con la interfaz de usuario del EMR.");
}

// Ejecutar la simulación
setTimeout(() => {
  simulateAIDUXAssistant(casoClinicoIncompleto);
}, 1500); 