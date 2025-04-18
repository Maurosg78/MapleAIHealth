/**
 * Utilidad para generar informes de fisioterapia adaptados al formato español
 * Permite crear diferentes tipos de informes basados en datos del paciente
 */

import { 
  SpanishPhysiotherapySOAP, 
  SpanishPatientInfo,
  SpanishTreatmentSummary
} from '../types/spanishPhysiotherapyTypes';

import {
  obtenerRecomendacionesCIE10
} from '../references/fisioterapiaValenciana';

import {
  obtenerEjerciciosPorPatologia
} from '../references/ejerciciosTerapeuticos';

/**
 * Genera un informe de valoración inicial de fisioterapia
 * @param paciente Datos del paciente
 * @param soap Datos de valoración en formato SOAP
 * @returns Informe de valoración inicial formateado
 */
export function generarInformeValoracionInicial(
  paciente: SpanishPatientInfo,
  soap: SpanishPhysiotherapySOAP
): string {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  // Obtener recomendaciones si hay código CIE-10
  let recomendaciones = '';
  if (soap.análisis.códigoCIE10) {
    const datosRecomendaciones = obtenerRecomendacionesCIE10(soap.análisis.códigoCIE10);
    if (datosRecomendaciones.encontrado) {
      recomendaciones = `
RECOMENDACIONES ESPECÍFICAS PARA ${soap.análisis.códigoCIE10}:
- ${datosRecomendaciones.recomendaciones.recomendaciones.join('\n- ')}

PRECAUCIONES:
${datosRecomendaciones.recomendaciones.precauciones}

TIEMPO ESTIMADO DE RECUPERACIÓN:
${datosRecomendaciones.recomendaciones.tiempoRecuperación}
`;
    }
  }
  
  return `
INFORME DE VALORACIÓN INICIAL DE FISIOTERAPIA
=============================================
Fecha: ${fecha}

DATOS DEL PACIENTE
-----------------
Nombre: ${paciente.nombre} ${paciente.apellidos}
Fecha nacimiento: ${paciente.fechaNacimiento}
ID: ${paciente.dni || paciente.nie || paciente.cip || 'No consta'}
Sistema sanitario: ${paciente.sistemaSanitario}
${paciente.aseguradora ? `Aseguradora: ${paciente.aseguradora}` : ''}
${paciente.mutua ? `Mutua: ${paciente.mutua}` : ''}

Facultativo remitente: ${paciente.médico.nombreCompleto} (${paciente.médico.especialidad})
${paciente.centroRemitente ? `Centro: ${paciente.centroRemitente}` : ''}

MOTIVO DE CONSULTA
-----------------
${soap.subjetivo.motivoConsulta}

ANAMNESIS
---------
${soap.subjetivo.sintomatología}

Antecedentes:
${soap.subjetivo.antecedentes.patológicos.length > 0 ? '- Patológicos: ' + soap.subjetivo.antecedentes.patológicos.join(', ') : '- Sin antecedentes patológicos relevantes'}
${soap.subjetivo.antecedentes.quirúrgicos.length > 0 ? '- Quirúrgicos: ' + soap.subjetivo.antecedentes.quirúrgicos.join(', ') : '- Sin antecedentes quirúrgicos'}
${soap.subjetivo.antecedentes.familiares.length > 0 ? '- Familiares: ' + soap.subjetivo.antecedentes.familiares.join(', ') : '- Sin antecedentes familiares relevantes'}

Medicación: ${soap.subjetivo.medicación.length > 0 ? soap.subjetivo.medicación.join(', ') : 'No refiere'}

${soap.subjetivo.pruebasDiagnósticas.length > 0 ? 'Pruebas diagnósticas:\n' + soap.subjetivo.pruebasDiagnósticas.map(p => `- ${p.tipo} (${p.fecha}): ${p.resultado}`).join('\n') : 'Sin pruebas diagnósticas previas'}

Hábitos de vida:
- Actividad: ${soap.subjetivo.hábitosVida.actividad}
- Profesión: ${soap.subjetivo.hábitosVida.profesión}
- Deportes: ${soap.subjetivo.hábitosVida.deportes || 'No practica'}
- Hábitos perjudiciales: ${soap.subjetivo.hábitosVida.hábitosPerjudiciales || 'No refiere'}

EXPLORACIÓN FÍSICA
----------------
Inspección: ${soap.objetivo.inspección}

Palpación: ${soap.objetivo.palpación}

Balance articular:
${soap.objetivo.balanceArticular.map(b => `- ${b.región}: Activo=${b.activo}, Pasivo=${b.pasivo}${b.doloroso ? ' (Doloroso)' : ''}`).join('\n')}

Balance muscular:
${soap.objetivo.balanceMuscular.map(b => `- ${b.grupo}: ${b.valor} (${b.observaciones})`).join('\n')}

Tests específicos:
${soap.objetivo.testEspecíficos.map(t => `- ${t.nombre}: ${t.resultado} ${t.positivo ? '(+)' : '(-)'}`).join('\n')}

Escalas validadas:
${soap.objetivo.escalasValidadas.map(e => `- ${e.nombre}: ${e.puntuación} (${e.interpretación})`).join('\n')}

DIAGNÓSTICO DE FISIOTERAPIA
--------------------------
${soap.análisis.diagnósticoFisioterapia}
${soap.análisis.códigoCIE10 ? `Código CIE-10: ${soap.análisis.códigoCIE10}` : ''}

Limitaciones funcionales:
${soap.análisis.limitacionesFuncionales.map(l => `- ${l}`).join('\n')}

Pronóstico: ${soap.análisis.pronóstico}

PLAN DE TRATAMIENTO
-----------------
Objetivos:
- A corto plazo: ${soap.plan.objetivos.corto.join(', ')}
- A medio plazo: ${soap.plan.objetivos.medio.join(', ')}
- A largo plazo: ${soap.plan.objetivos.largo.join(', ')}

Tratamiento propuesto:
${soap.plan.técnicas.map(t => `- ${t.nombre}${t.parámetros ? ` (${t.parámetros})` : ''}: ${t.frecuencia}`).join('\n')}

Recomendaciones:
${soap.plan.recomendaciones.map(r => `- ${r}`).join('\n')}

${soap.plan.planEjercicios ? `Plan de ejercicios: ${soap.plan.planEjercicios}` : ''}

Frecuencia de sesiones: ${soap.plan.frecuenciaSesiones}
Duración estimada del tratamiento: ${soap.plan.duraciónEstimadaTratamiento}

${recomendaciones}

Fisioterapeuta: ______________________
Nº Colegiado: _______________________

Firma:


`;
}

/**
 * Genera un informe de alta de fisioterapia
 * @param paciente Datos del paciente
 * @param resumenTratamiento Resumen del tratamiento realizado
 * @returns Informe de alta formateado
 */
export function generarInformeAlta(
  paciente: SpanishPatientInfo,
  resumenTratamiento: SpanishTreatmentSummary
): string {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  return `
INFORME DE ALTA DE FISIOTERAPIA
==============================
Fecha: ${fecha}

DATOS DEL PACIENTE
-----------------
Nombre: ${paciente.nombre} ${paciente.apellidos}
Fecha nacimiento: ${paciente.fechaNacimiento}
ID: ${paciente.dni || paciente.nie || paciente.cip || 'No consta'}
Sistema sanitario: ${paciente.sistemaSanitario}

RESUMEN DEL TRATAMIENTO
----------------------
Fecha de inicio: ${resumenTratamiento.fechaInicio}
Fecha de fin: ${resumenTratamiento.fechaFin}
Número de sesiones: ${resumenTratamiento.numSesiones}

Técnicas aplicadas:
${resumenTratamiento.técnicasAplicadas.join(', ')}

EVOLUCIÓN
--------
Dolor: ${resumenTratamiento.evolución.dolor}
Función: ${resumenTratamiento.evolución.función}

Objetivos conseguidos:
${resumenTratamiento.evolución.objetivosConseguidos.map(o => `- ${o}`).join('\n')}

Objetivos pendientes:
${resumenTratamiento.evolución.objetivosPendientes.length > 0 ? 
  resumenTratamiento.evolución.objetivosPendientes.map(o => `- ${o}`).join('\n') : 
  'Se han conseguido todos los objetivos propuestos'}

RECOMENDACIONES AL ALTA
---------------------
${resumenTratamiento.recomendacionesAlta.map(r => `- ${r}`).join('\n')}

Pronóstico: ${resumenTratamiento.pronóstico}

${resumenTratamiento.revisión ? `Se recomienda revisión en: ${resumenTratamiento.revisión}` : 'No se considera necesaria revisión posterior.'}

Fisioterapeuta: ______________________
Nº Colegiado: _______________________

Firma:


`;
}

/**
 * Genera un consentimiento informado para técnicas invasivas
 * @param paciente Datos del paciente
 * @param técnica Nombre de la técnica invasiva
 * @param información Información específica de la técnica
 * @returns Documento de consentimiento informado
 */
export function generarConsentimientoInformado(
  paciente: SpanishPatientInfo,
  técnica: string,
  información: {
    descripción: string;
    beneficios: string[];
    riesgos: string[];
    alternativas: string[];
  }
): string {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  return `
DOCUMENTO DE CONSENTIMIENTO INFORMADO PARA ${técnica.toUpperCase()}
=================================================================
Fecha: ${fecha}

DATOS DEL PACIENTE
-----------------
Nombre: ${paciente.nombre} ${paciente.apellidos}
Fecha nacimiento: ${paciente.fechaNacimiento}
ID: ${paciente.dni || paciente.nie || paciente.cip || 'No consta'}

DATOS DEL FISIOTERAPEUTA
-----------------------
Nombre: ______________________
Nº Colegiado: _________________

INFORMACIÓN SOBRE LA TÉCNICA
---------------------------
${información.descripción}

Beneficios esperados:
${información.beneficios.map(b => `- ${b}`).join('\n')}

Riesgos/efectos secundarios:
${información.riesgos.map(r => `- ${r}`).join('\n')}

Alternativas terapéuticas:
${información.alternativas.map(a => `- ${a}`).join('\n')}

DECLARACIÓN DE CONSENTIMIENTO
----------------------------
Yo, ${paciente.nombre} ${paciente.apellidos}, con DNI/NIE ${paciente.dni || paciente.nie || 'No consta'}, 
DECLARO que he sido informado/a por el fisioterapeuta de los riesgos y beneficios de la técnica propuesta, 
he comprendido la información, he podido realizar preguntas y aclarar dudas, y doy mi consentimiento para que 
se me realice la técnica de ${técnica}.

Entiendo que puedo revocar este consentimiento en cualquier momento antes de la realización de la técnica 
sin necesidad de dar explicaciones y sin que ello repercuta en mis cuidados posteriores.

Firma del paciente:                   Firma del fisioterapeuta:


_______________________               _______________________

En ___________________, a ${fecha.split('/')[0]} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][parseInt(fecha.split('/')[1])-1]} de ${fecha.split('/')[2]}
`;
}

/**
 * Genera un programa de ejercicios personalizado según patología
 * @param paciente Datos del paciente
 * @param codigoCIE10 Código diagnóstico CIE-10
 * @returns Documento con programa de ejercicios personalizado
 */
export function generarProgramaEjercicios(
  paciente: SpanishPatientInfo,
  codigoCIE10: string
): string {
  const fecha = new Date().toLocaleDateString('es-ES');
  const ejercicios = obtenerEjerciciosPorPatologia(codigoCIE10);
  const datosPatologia = obtenerRecomendacionesCIE10(codigoCIE10);
  
  let descripcionPatologia = '';
  if (datosPatologia.encontrado) {
    descripcionPatologia = datosPatologia.recomendaciones.precauciones;
  } else if (!datosPatologia.encontrado && datosPatologia.categoría !== 'No encontrada') {
    descripcionPatologia = datosPatologia.descripción;
  }
  
  return `
PROGRAMA DE EJERCICIOS TERAPÉUTICOS
=================================
Fecha: ${fecha}

DATOS DEL PACIENTE
-----------------
Nombre: ${paciente.nombre} ${paciente.apellidos}
${codigoCIE10 ? `Diagnóstico: ${codigoCIE10} ${descripcionPatologia ? '- ' + descripcionPatologia : ''}` : ''}

INSTRUCCIONES GENERALES
---------------------
- Realizar los ejercicios preferiblemente en un entorno tranquilo y con ropa cómoda
- Respetar las series, repeticiones y tiempos de descanso indicados
- No realizar los ejercicios que provoquen dolor agudo
- Ante cualquier duda, consultar con su fisioterapeuta
- Es normal sentir fatiga muscular o ligeras molestias durante las primeras sesiones

${ejercicios.length > 0 ? 'EJERCICIOS RECOMENDADOS\n----------------------\n' + 
ejercicios.map((ejercicio, i) => 
`EJERCICIO ${i+1}: ${ejercicio.nombre}

Descripción: ${ejercicio.descripción}

Ejecución:
${ejercicio.ejecución.map((paso, j) => `${j+1}. ${paso}`).join('\n')}

Dosificación:
- Series: ${ejercicio.dosificación.series}
- Repeticiones: ${ejercicio.dosificación.repeticiones}
${ejercicio.dosificación.tiempo ? `- Tiempo: ${ejercicio.dosificación.tiempo}` : ''}
- Frecuencia: ${ejercicio.dosificación.frecuencia}

${ejercicio.advertencias && ejercicio.advertencias.length > 0 ? 'Advertencias:\n' + ejercicio.advertencias.map(a => `- ${a}`).join('\n') + '\n' : ''}
${ejercicio.variantes && ejercicio.variantes.length > 0 ? 'Variantes:\n' + ejercicio.variantes.map(v => `- ${v.nombre}: ${v.descripción}`).join('\n') + '\n' : ''}

----------------------------------------
`).join('\n') : 'No se han encontrado ejercicios específicos para el código diagnóstico proporcionado.'}

Fisioterapeuta: ______________________
Nº Colegiado: _______________________

Firma:


`;
}

/**
 * Genera un formulario de evaluación de escala EVA para dolor
 * @returns Formulario de escala EVA formateado
 */
export function generarFormularioEVA(): string {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  return `
ESCALA VISUAL ANALÓGICA (EVA) PARA VALORACIÓN DEL DOLOR
=====================================================
Fecha: ${fecha}

DATOS DEL PACIENTE
-----------------
Nombre: ___________________________________________________

Instrucciones: Marque en la siguiente línea el punto que mejor describa su dolor, 
donde 0 representa "ningún dolor" y 10 representa "el peor dolor imaginable"

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  0      1      2      3      4      5      6      7      8      9      10  │
│  │      │      │      │      │      │      │      │      │      │      │   │
│  │      │      │      │      │      │      │      │      │      │      │   │
│  Sin dolor                    Dolor moderado            Máximo dolor       │
│                                                                           │
└─────────────────────────────────────────────────────────┘

LOCALIZACIÓN DEL DOLOR (marcar sobre el dibujo):
┌───────────────────┐   ┌───────────────────┐
│        ○          │   │        ○          │
│       /|\\         │   │       /|\\         │
│      / | \\        │   │      / | \\        │
│     o  |  o       │   │     o  |  o       │
│    /|  |  |\\      │   │    /|  |  |\\      │
│   / |  |  | \\     │   │   / |  |  | \\     │
│     |  |  |       │   │     |  |  |       │
│     |  |  |       │   │     |  |  |       │
│    /   |   \\      │   │    /   |   \\      │
│   /    |    \\     │   │   /    |    \\     │
│  o     |     o    │   │  o     |     o    │
│ /      |      \\   │   │ /      |      \\   │
└───────────────────┘   └───────────────────┘
       ANTERIOR              POSTERIOR

CARACTERÍSTICAS DEL DOLOR
-----------------------
Tipo de dolor:
□ Punzante  □ Quemante  □ Opresivo  □ Pulsátil  □ Eléctrico  □ Sordo

Factores que aumentan el dolor:
_______________________________________________________

Factores que alivian el dolor:
_______________________________________________________

EVOLUCIÓN DEL DOLOR
-----------------
Fecha inicial: ___/___/___   EVA inicial: ____
Fecha actual:  ___/___/___   EVA actual:  ____

Observaciones:
_______________________________________________________
_______________________________________________________

Fisioterapeuta: ______________________
Nº Colegiado: _______________________

Firma:


`;
}

/**
 * Genera un informe de evolución de fisioterapia
 * @param paciente Datos del paciente 
 * @param diagnostico Diagnóstico de fisioterapia
 * @param fechaInicio Fecha de inicio del tratamiento
 * @param sesionActual Número de sesión actual
 * @param evolucion Descripción de la evolución
 * @returns Informe de evolución formateado
 */
export function generarInformeEvolucion(
  paciente: SpanishPatientInfo,
  diagnostico: string,
  fechaInicio: string,
  sesionActual: number,
  evolucion: {
    subjetivo: string;
    objetivo: string;
    cambiosPlan?: string;
    observaciones?: string;
  }
): string {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  return `
NOTA DE EVOLUCIÓN DE FISIOTERAPIA
===============================
Fecha: ${fecha}
Sesión Nº: ${sesionActual}

DATOS DEL PACIENTE
-----------------
Nombre: ${paciente.nombre} ${paciente.apellidos}
Fecha de inicio del tratamiento: ${fechaInicio}
Diagnóstico: ${diagnostico}

EVOLUCIÓN
--------
Valoración subjetiva:
${evolucion.subjetivo}

Valoración objetiva:
${evolucion.objetivo}

${evolucion.cambiosPlan ? `Cambios en el plan de tratamiento:\n${evolucion.cambiosPlan}\n` : ''}
${evolucion.observaciones ? `Observaciones:\n${evolucion.observaciones}\n` : ''}

Fisioterapeuta: ______________________
Nº Colegiado: _______________________

Firma:


`;
}

/**
 * Genera un calendario de ejercicios semanal
 * @param ejercicios Lista de ejercicios a programar
 * @returns Calendario semanal de ejercicios formateado
 */
export function generarCalendarioEjercicios(
  ejercicios: Array<{
    nombre: string;
    diasSemana: Array<'L'|'M'|'X'|'J'|'V'|'S'|'D'>;
    series: number;
    repeticiones: number;
    observaciones?: string;
  }>
): string {
  const fecha = new Date().toLocaleDateString('es-ES');
  
  return `
CALENDARIO SEMANAL DE EJERCICIOS
==============================
Fecha de inicio: ${fecha}

INSTRUCCIONES
-----------
- Marque cada ejercicio realizado con una ✓
- Registre cualquier incidencia al realizar los ejercicios
- Si un ejercicio produce dolor, reduzca la intensidad o consulte con su fisioterapeuta

┌───────────────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐
│  EJERCICIO    │   L   │   M   │   X   │   J   │   V   │   S   │   D   │
├───────────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
${ejercicios.map(e => 
`│ ${e.nombre.padEnd(13, ' ')} │   ${e.diasSemana.includes('L') ? 'X' : ' '}   │   ${e.diasSemana.includes('M') ? 'X' : ' '}   │   ${e.diasSemana.includes('X') ? 'X' : ' '}   │   ${e.diasSemana.includes('J') ? 'X' : ' '}   │   ${e.diasSemana.includes('V') ? 'X' : ' '}   │   ${e.diasSemana.includes('S') ? 'X' : ' '}   │   ${e.diasSemana.includes('D') ? 'X' : ' '}   │`).join('\n├───────────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤\n')}
└───────────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘

DOSIFICACIÓN
----------
${ejercicios.map(e => `- ${e.nombre}: ${e.series} series x ${e.repeticiones} repeticiones ${e.observaciones ? `(${e.observaciones})` : ''}`).join('\n')}

OBSERVACIONES SEMANALES
---------------------
Lunes:    ________________________________________________
Martes:   ________________________________________________
Miércoles:________________________________________________
Jueves:   ________________________________________________
Viernes:  ________________________________________________
Sábado:   ________________________________________________
Domingo:  ________________________________________________

Fisioterapeuta: ______________________
Nº Colegiado: _______________________
`; 