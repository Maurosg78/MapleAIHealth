// Simulador de detección de información faltante en historia clínica
console.log("\n===== ASISTENTE CLÍNICO AIDUX - DETECTOR DE INFORMACIÓN FALTANTE =====\n");

// Caso clínico extremadamente incompleto
const casoClinico = {
  descripcion: "Paciente con cefalea. Toma medicamentos."
};

// Estructura de una historia clínica completa
const estructuraHistoriaClinica = {
  datosDemograficos: [
    "Nombre completo",
    "Edad",
    "Género",
    "Fecha de nacimiento",
    "Número de identificación"
  ],
  motivoConsulta: [
    "Síntoma principal",
    "Tiempo de evolución",
    "Motivo de consulta en palabras del paciente"
  ],
  enfermedadActual: [
    "Inicio y evolución del cuadro clínico",
    "Características del síntoma principal (intensidad, localización, factores modificantes)",
    "Síntomas asociados",
    "Tratamientos previos recibidos y respuesta a los mismos"
  ],
  antecedentesMedicos: [
    "Patológicos",
    "Quirúrgicos",
    "Traumáticos",
    "Alérgicos",
    "Transfusionales",
    "Hospitalizaciones previas"
  ],
  medicamentos: [
    "Medicamentos actuales",
    "Dosis",
    "Frecuencia",
    "Tiempo de uso",
    "Adherencia"
  ],
  antecedentesPersonales: [
    "Consumo de sustancias (tabaco, alcohol, drogas)",
    "Hábitos alimentarios",
    "Actividad física",
    "Ocupación y exposiciones laborales"
  ],
  antecedentesFamiliares: [
    "Enfermedades hereditarias",
    "Enfermedades crónicas en familiares de primer grado"
  ],
  revisionPorSistemas: [
    "Sistema cardiovascular",
    "Sistema respiratorio",
    "Sistema gastrointestinal",
    "Sistema genitourinario",
    "Sistema musculoesquelético",
    "Sistema nervioso",
    "Sistema endocrino",
    "Piel y anexos"
  ],
  examenFisico: [
    "Signos vitales",
    "Peso y talla",
    "Estado general",
    "Examen sistemático por aparatos y sistemas"
  ]
};

// Función para detectar qué información está presente en la descripción
function detectarInformacionPresente(descripcion) {
  const informacionDetectada = {
    datosDemograficos: {},
    motivoConsulta: {},
    enfermedadActual: {},
    medicamentos: {},
    antecedentesMedicos: {},
    antecedentesPersonales: {},
    antecedentesFamiliares: {},
    revisionPorSistemas: {},
    examenFisico: {}
  };
  
  // Detección simple por palabras clave
  if (descripcion.includes("cefalea") || descripcion.includes("dolor de cabeza")) {
    informacionDetectada.motivoConsulta.sintomaPrincipal = "Cefalea";
    informacionDetectada.enfermedadActual.sintomasPrincipales = "Cefalea";
  }
  
  if (descripcion.includes("medicamentos") || descripcion.includes("toma")) {
    informacionDetectada.medicamentos.enUso = "Medicamentos no especificados";
  }
  
  // Detectar datos demográficos
  const regexEdad = /(\d+)\s*años/;
  const edadMatch = descripcion.match(regexEdad);
  if (edadMatch) {
    informacionDetectada.datosDemograficos.edad = edadMatch[1] + " años";
  }
  
  // Detectar género
  if (descripcion.includes("hombre") || descripcion.includes("masculino") || descripcion.includes("varón")) {
    informacionDetectada.datosDemograficos.genero = "Masculino";
  } else if (descripcion.includes("mujer") || descripcion.includes("femenina") || descripcion.includes("femenino")) {
    informacionDetectada.datosDemograficos.genero = "Femenino";
  }
  
  // Detectar tiempo de evolución
  const regexTiempo = /(\d+)\s*(días|semanas|meses|horas)/;
  const tiempoMatch = descripcion.match(regexTiempo);
  if (tiempoMatch) {
    informacionDetectada.enfermedadActual.tiempoEvolucion = tiempoMatch[0];
  }
  
  return informacionDetectada;
}

// Función para generar preguntas para completar información faltante
function generarPreguntasFaltantes(informacionPresente) {
  const preguntas = {
    datosDemograficos: [],
    motivoConsulta: [],
    enfermedadActual: [],
    medicamentos: [],
    antecedentesMedicos: [],
    antecedentesPersonales: [],
    antecedentesFamiliares: [],
    revisionPorSistemas: [],
    examenFisico: []
  };
  
  // Verificar datos demográficos
  if (!informacionPresente.datosDemograficos.edad) {
    preguntas.datosDemograficos.push("¿Qué edad tiene el paciente?");
  }
  
  if (!informacionPresente.datosDemograficos.genero) {
    preguntas.datosDemograficos.push("¿Cuál es el género del paciente?");
  }
  
  if (!informacionPresente.datosDemograficos.nombre) {
    preguntas.datosDemograficos.push("¿Cuál es el nombre completo del paciente?");
  }
  
  // Para cefalea, preguntas específicas
  if (informacionPresente.motivoConsulta.sintomaPrincipal === "Cefalea") {
    if (!informacionPresente.enfermedadActual.tiempoEvolucion) {
      preguntas.enfermedadActual.push("¿Cuánto tiempo lleva con la cefalea?");
    }
    
    preguntas.enfermedadActual.push(
      "¿Dónde se localiza el dolor (frontal, temporal, occipital, generalizado)?",
      "¿Cómo describiría el tipo de dolor (pulsátil, opresivo, punzante)?",
      "¿Cuál es la intensidad del dolor en una escala del 1 al 10?",
      "¿Hay algún factor desencadenante identificado?",
      "¿Qué factores alivian o empeoran el dolor?",
      "¿Presenta síntomas asociados (náuseas, vómitos, fotofobia, fonofobia)?",
      "¿Ha tenido episodios similares anteriormente?"
    );
    
    preguntas.revisionPorSistemas.push(
      "¿Ha presentado alteraciones visuales?",
      "¿Ha notado debilidad o entumecimiento en alguna parte del cuerpo?",
      "¿Ha tenido fiebre recientemente?",
      "¿Ha experimentado cambios en su estado de conciencia o confusión?"
    );
  }
  
  // Preguntas sobre medicamentos
  if (informacionPresente.medicamentos.enUso === "Medicamentos no especificados") {
    preguntas.medicamentos.push(
      "¿Qué medicamentos específicos está tomando actualmente?",
      "¿Cuál es la dosis y frecuencia de cada medicamento?",
      "¿Desde cuándo los está tomando?",
      "¿Ha tomado algún medicamento para el dolor de cabeza? ¿Cuál fue la respuesta?"
    );
  }
  
  // Antecedentes médicos generales
  preguntas.antecedentesMedicos.push(
    "¿Tiene alguna enfermedad crónica diagnosticada?",
    "¿Ha tenido cirugías previas?",
    "¿Tiene alergias conocidas a medicamentos o alimentos?"
  );
  
  // Antecedentes personales relevantes
  preguntas.antecedentesPersonales.push(
    "¿Consume alcohol, tabaco u otras sustancias?",
    "¿Cuál es su ocupación? ¿Existe algún factor de estrés laboral?"
  );
  
  // Antecedentes familiares relevantes
  preguntas.antecedentesFamiliares.push(
    "¿Hay antecedentes familiares de migraña o cefaleas crónicas?",
    "¿Algún familiar cercano con enfermedades neurológicas?"
  );
  
  // Examen físico mínimo requerido
  preguntas.examenFisico.push(
    "Tomar signos vitales (presión arterial, frecuencia cardíaca, temperatura)",
    "Realizar evaluación neurológica básica",
    "Evaluar fondo de ojo",
    "Evaluar rigidez nucal",
    "Valorar signos meníngeos"
  );
  
  return preguntas;
}

// Función para clasificar preguntas por prioridad
function priorizarPreguntas(preguntas) {
  const prioridadAlta = [];
  const prioridadMedia = [];
  const prioridadBaja = [];
  
  // Preguntas de alta prioridad para datos esenciales inmediatos
  if (preguntas.datosDemograficos.includes("¿Qué edad tiene el paciente?")) {
    prioridadAlta.push("¿Qué edad tiene el paciente?");
  }
  
  if (preguntas.enfermedadActual.includes("¿Cuánto tiempo lleva con la cefalea?")) {
    prioridadAlta.push("¿Cuánto tiempo lleva con la cefalea?");
  }
  
  prioridadAlta.push(
    "¿Cuál es la intensidad del dolor en una escala del 1 al 10?",
    "¿Presenta síntomas asociados (náuseas, vómitos, fotofobia, fonofobia)?",
    "¿Ha tenido fiebre recientemente?",
    "¿Ha experimentado cambios en su estado de conciencia o confusión?"
  );
  
  // Preguntas de rigidez nucal y signos meníngeos son de alta prioridad en cefalea
  if (preguntas.examenFisico.includes("Evaluar rigidez nucal")) {
    prioridadAlta.push("Evaluar rigidez nucal");
  }
  
  if (preguntas.examenFisico.includes("Valorar signos meníngeos")) {
    prioridadAlta.push("Valorar signos meníngeos");
  }
  
  // Prioridad media - caracterización del dolor y factores modificantes
  prioridadMedia.push(
    "¿Dónde se localiza el dolor (frontal, temporal, occipital, generalizado)?",
    "¿Cómo describiría el tipo de dolor (pulsátil, opresivo, punzante)?",
    "¿Qué factores alivian o empeoran el dolor?",
    "¿Ha tomado algún medicamento para el dolor de cabeza? ¿Cuál fue la respuesta?",
    "¿Ha presentado alteraciones visuales?",
    "¿Ha notado debilidad o entumecimiento en alguna parte del cuerpo?"
  );
  
  // El resto son de menor prioridad para la evaluación inicial
  [
    ...preguntas.datosDemograficos, 
    ...preguntas.enfermedadActual,
    ...preguntas.medicamentos,
    ...preguntas.antecedentesMedicos,
    ...preguntas.antecedentesPersonales,
    ...preguntas.antecedentesFamiliares,
    ...preguntas.revisionPorSistemas,
    ...preguntas.examenFisico
  ].forEach(pregunta => {
    if (!prioridadAlta.includes(pregunta) && !prioridadMedia.includes(pregunta)) {
      prioridadBaja.push(pregunta);
    }
  });
  
  return { prioridadAlta, prioridadMedia, prioridadBaja };
}

// Función para generar recomendaciones y posibles diagnósticos diferenciales
function generarRecomendacionesPorSintomas(sintomaPrincipal) {
  const recomendaciones = {
    diagnosticosDiferenciales: [],
    estudiosa: [],
    recomendacionesGenerales: []
  };
  
  if (sintomaPrincipal === "Cefalea") {
    recomendaciones.diagnosticosDiferenciales = [
      "Cefalea tensional",
      "Migraña",
      "Cefalea en racimos",
      "Cefalea por abuso de medicamentos",
      "Cefalea secundaria a hipertensión arterial",
      "Cefalea por sinusitis",
      "Cefalea por trastornos de la articulación temporomandibular",
      "⚠️ ALERTA: Hemorragia subaracnoidea (si inicio súbito e intenso)",
      "⚠️ ALERTA: Meningitis (si hay fiebre y rigidez nucal)"
    ];
    
    recomendaciones.estudios = [
      "Se requiere completar la información clínica antes de recomendar estudios específicos",
      "Si hay banderas rojas (inicio súbito, progresión rápida, alteración del estado mental), considerar TAC cerebral urgente"
    ];
    
    recomendaciones.recomendacionesGenerales = [
      "Documentar detalladamente las características de la cefalea",
      "Realizar examen físico completo con énfasis en evaluación neurológica",
      "Considerar diario de cefalea para identificar patrones y desencadenantes",
      "Evaluar impacto en la calidad de vida del paciente"
    ];
  }
  
  return recomendaciones;
}

// Ejecutar el análisis del caso clínico
console.log("INFORMACIÓN INICIAL DEL CASO:\n");
console.log(`"${casoClinico.descripcion}"\n`);

console.log("ANALIZANDO INFORMACIÓN DISPONIBLE...\n");

// Detectar la información presente
const informacionPresente = detectarInformacionPresente(casoClinico.descripcion);

// Calcular porcentaje de completitud
const totalCampos = Object.keys(estructuraHistoriaClinica).reduce(
  (total, categoria) => total + estructuraHistoriaClinica[categoria].length, 0
);

let camposPresentes = 0;
Object.keys(informacionPresente).forEach(categoria => {
  camposPresentes += Object.keys(informacionPresente[categoria]).length;
});

const porcentajeCompletitud = Math.round((camposPresentes / totalCampos) * 100);

console.log(`COMPLETITUD DE LA HISTORIA CLÍNICA: ${porcentajeCompletitud}% (Muy incompleta)\n`);

console.log("INFORMACIÓN DETECTADA:");
Object.keys(informacionPresente).forEach(categoria => {
  const datosCategoria = informacionPresente[categoria];
  const camposCategoria = Object.keys(datosCategoria);
  
  if (camposCategoria.length > 0) {
    console.log(`  ${categoria}:`);
    camposCategoria.forEach(campo => {
      console.log(`    ✅ ${campo}: ${datosCategoria[campo]}`);
    });
  }
});

console.log("\nINFORMACIÓN FALTANTE CRÍTICA:");
[
  "datosDemograficos.edad",
  "datosDemograficos.genero",
  "enfermedadActual.tiempoEvolucion",
  "enfermedadActual.intensidad",
  "enfermedadActual.localizacion",
  "enfermedadActual.factoresModificantes",
  "antecedentesMedicos.patologicos",
  "examenFisico.signosVitales"
].forEach(campo => {
  const [categoria, subcampo] = campo.split('.');
  if (!informacionPresente[categoria][subcampo]) {
    console.log(`  ❌ ${subcampo}`);
  }
});

console.log("\n==== RECOMENDACIONES DEL ASISTENTE AIDUX ====\n");

// Generar preguntas para información faltante
const preguntas = generarPreguntasFaltantes(informacionPresente);
const preguntasPriorizadas = priorizarPreguntas(preguntas);

console.log("PREGUNTAS PRIORITARIAS (REQUIEREN RESPUESTA INMEDIATA):");
preguntasPriorizadas.prioridadAlta.forEach((pregunta, index) => {
  console.log(`  ${index + 1}. ⚠️ ${pregunta}`);
});

console.log("\nPREGUNTAS IMPORTANTES (SEGUNDA RONDA):");
preguntasPriorizadas.prioridadMedia.forEach((pregunta, index) => {
  console.log(`  ${index + 1}. ${pregunta}`);
});

console.log("\nPREGUNTAS COMPLEMENTARIAS:");
preguntasPriorizadas.prioridadBaja.slice(0, 5).forEach((pregunta, index) => {
  console.log(`  ${index + 1}. ${pregunta}`);
});
if (preguntasPriorizadas.prioridadBaja.length > 5) {
  console.log(`  ... y ${preguntasPriorizadas.prioridadBaja.length - 5} preguntas adicionales`);
}

console.log("\n==== POSIBLES DIAGNÓSTICOS DIFERENCIALES ====\n");
console.log("⚠️ ADVERTENCIA: El diagnóstico diferencial es preliminar y requiere más información");
console.log("para una evaluación adecuada.\n");

const recomendaciones = generarRecomendacionesPorSintomas("Cefalea");

console.log("DIAGNÓSTICOS A CONSIDERAR:");
recomendaciones.diagnosticosDiferenciales.forEach((dx, index) => {
  console.log(`  ${index + 1}. ${dx}`);
});

console.log("\n==== SIMULACIÓN DE ACTUALIZACIÓN DE HISTORIA CLÍNICA ====\n");

// Simulamos que el médico proporciona información adicional
const informacionAdicional = {
  descripcion: "Paciente femenina de 35 años con cefalea intensa de inicio súbito hace 6 horas. Describe el dolor como el 'peor dolor de cabeza de su vida', intensidad 10/10, holocraneano con predominio occipital. Asocia náuseas, vómito en 2 ocasiones y fotofobia. No ha tenido episodios similares antes. Actualmente toma anticonceptivos orales. Sin otros antecedentes relevantes. Al examen físico presenta TA 160/90, FC 95, rigidez nucal leve."
};

console.log("NUEVA INFORMACIÓN PROPORCIONADA:");
console.log(`"${informacionAdicional.descripcion}"\n`);

console.log("ANÁLISIS ACTUALIZADO:");
console.log("  ✅ Datos demográficos completos: Mujer, 35 años");
console.log("  ✅ Caracterización completa del dolor: Súbito, intenso (10/10), holocraneano, occipital");
console.log("  ✅ Síntomas asociados: Náuseas, vómitos, fotofobia");
console.log("  ✅ Examen físico: TA 160/90, FC 95, rigidez nucal leve");
console.log("  ✅ Medicamentos actuales: Anticonceptivos orales");

console.log("\n⚠️ ¡ALERTA! Se han detectado BANDERAS ROJAS:\n");
console.log("  • Cefalea descrita como 'la peor de su vida'");
console.log("  • Inicio súbito e intenso");
console.log("  • Rigidez nucal");
console.log("  • Hipertensión arterial");

console.log("\nDIAGNÓSTICO DIFERENCIAL URGENTE:");
console.log("  1. 🔴 Hemorragia subaracnoidea (ALTA PROBABILIDAD) - EMERGENCIA");
console.log("  2. 🟠 Meningitis");
console.log("  3. 🟡 Migraña con aura");

console.log("\nACCIÓN INMEDIATA RECOMENDADA:");
console.log("  • ⚠️ Derivación inmediata a urgencias");
console.log("  • ⚠️ TAC cerebral sin contraste URGENTE");
console.log("  • Valoración por neurología");
console.log("  • No administrar analgésicos hasta evaluación completa");

console.log("\n===== FIN DE LA SIMULACIÓN =====\n"); 