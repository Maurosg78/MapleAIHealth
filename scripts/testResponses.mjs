// testResponses.mjs - Pruebas de clasificación de respuestas
import ResponseMiddleware from './responseMiddleware.mjs';
import config from '../config/response.config.mjs';

async function testClassification() {
  console.log('=== Sistema de Clasificación Automática de Respuestas ===\n');
  console.log(`Configuración actual:`);
  console.log(`- Máximo consultas thinking consecutivas: ${config.maxConsecutiveThinking}`);
  console.log(`- Umbral de confianza auto: ${config.autoThreshold}\n`);

  const testCases = [
    // Casos de modo auto (alta confianza)
    { query: "hola", expectedMode: "auto" },
    { query: "gracias", expectedMode: "auto" },
    { query: "ok", expectedMode: "auto" },
    { query: "sí", expectedMode: "auto" },
    { query: "no", expectedMode: "auto" },
    { query: "adiós", expectedMode: "auto" },
    
    // Casos de modo thinking
    { query: "necesito implementar un nuevo sistema de caché", expectedMode: "thinking" },
    { query: "hay un error en el workflow de GitHub", expectedMode: "thinking" },
    { query: "cómo puedo optimizar el rendimiento de la API", expectedMode: "thinking" },
    { query: "problema con la autenticación del usuario", expectedMode: "thinking" },
    
    // Casos mixtos para probar alternancia
    { query: "ok, entiendo el problema", expectedMode: "auto" },
    { query: "necesito más información sobre el error", expectedMode: "thinking" },
    { query: "gracias por la explicación", expectedMode: "auto" },
    
    // Casos para forzar modo auto después de múltiples thinking
    { query: "analiza el rendimiento del sistema", expectedMode: "thinking" },
    { query: "optimiza la consulta de base de datos", expectedMode: "thinking" },
    { query: "revisa el log de errores", expectedMode: "thinking" },
    { query: "necesito revisar más logs", expectedMode: "auto" } // Debería forzar auto
  ];

  let successCount = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      const result = await ResponseMiddleware.processQuery(testCase.query);
      const success = result.mode === testCase.expectedMode;
      
      console.log(`\nPrueba: "${testCase.query}"`);
      console.log(`Modo esperado: ${testCase.expectedMode}`);
      console.log(`Modo obtenido: ${result.mode}`);
      console.log(`Confianza: ${result.confidence}`);
      if (result.response) {
        console.log(`Respuesta: "${result.response}"`);
      }
      console.log(`Consultas thinking consecutivas: ${result.context.consecutiveThinking}`);
      console.log(`Resultado: ${success ? '✅ PASS' : '❌ FAIL'}`);

      if (success) successCount++;
    } catch (error) {
      console.error(`Error en prueba "${testCase.query}":`, error);
      totalTests--;
    }
  }

  // Resumen final
  console.log('\n=== Resumen de Pruebas ===');
  console.log(`Total de pruebas: ${totalTests}`);
  console.log(`Pruebas exitosas: ${successCount}`);
  console.log(`Porcentaje de éxito: ${((successCount / totalTests) * 100).toFixed(2)}%`);
}

// Ejecutar pruebas
testClassification().catch(console.error); 