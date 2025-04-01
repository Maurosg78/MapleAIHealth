# Guía de Pruebas para MapleHealth AI

Este documento describe cómo ejecutar y crear pruebas para los adaptadores EMR en MapleHealth AI.

## Configuración de Pruebas

El proyecto utiliza Jest como marco de pruebas principal para los adaptadores EMR. La configuración se encuentra en `jest.config.js` en la raíz del proyecto.

## Requisitos

Asegúrate de tener instaladas todas las dependencias necesarias:

```bash
npm install
```

## Ejecución de Pruebas

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas en modo watch (desarrollo)

```bash
npm run test:watch
```

### Ejecutar pruebas con cobertura

```bash
npm run test:coverage
```

### Ejecutar sólo las pruebas de adaptadores EMR

```bash
npm run test:emr
```

## Estructura de las Pruebas

Las pruebas se organizan de la siguiente manera:

```
src/
└── __tests__/
    └── services/
        └── emr/
            ├── mocks/                        # Datos y servicios mock para pruebas
            │   ├── MockEMRResponses.ts       # Datos simulados de respuestas de API
            │   └── MockHttpService.ts        # Servicio HTTP simulado
            ├── OSCARAdapter.test.ts          # Pruebas para OSCAR EMR
            ├── ClinicCloudAdapter.test.ts    # Pruebas para ClinicCloud
            ├── EPICAdapter.test.ts           # Pruebas para EPIC
            ├── GenericEMRAdapter.test.ts     # Pruebas para el adaptador genérico
            └── EMRAdapterFactory.test.ts     # Pruebas para la fábrica de adaptadores
```

## Mocks y Fixtures

Para evitar dependencias externas en las pruebas, utilizamos mocks para simular:

1. **Respuestas de API**: Los archivos en `mocks/MockEMRResponses.ts` contienen datos simulados que representan las respuestas de las diferentes APIs de sistemas EMR.

2. **Servicio HTTP**: `mocks/MockHttpService.ts` simula las llamadas HTTP a los servicios externos, permitiendo probar la lógica de los adaptadores sin realizar conexiones reales.

## Ejemplo de Prueba

```typescript
// Ejemplo de prueba para un adaptador EMR
describe('OSCARAdapter', () => {
  let adapter: OSCARAdapter;
  let mockHttp: MockHttpService;

  beforeEach(() => {
    // Creamos un mock del servicio HTTP
    mockHttp = new MockHttpService();

    // Creamos una instancia del adaptador con el mock
    adapter = new OSCARAdapter({
      baseUrl: 'https://oscar-test.example.ca',
      username: 'testuser',
      password: 'testpass',
      clinicId: 'clinic123'
    });

    // Reemplazamos el método httpService privado con nuestro mock
    (adapter as unknown as { httpService: MockHttpService }).httpService = mockHttp;
  });

  it('debería obtener datos del paciente correctamente', async () => {
    // Preparamos el mock para la autenticación
    jest.spyOn(mockHttp, 'authenticateOscar').mockResolvedValue('mock-token');
    // Preparamos el mock para la obtención de datos
    jest.spyOn(mockHttp, 'get').mockResolvedValue(oscarPatientData);

    // Ejecutamos el método a probar
    const patientData = await adapter.getPatientData('12345');

    // Verificaciones
    expect(patientData).toHaveProperty('fullName');
    expect(patientData.id).toBe('12345');
  });
});
```

## Buenas Prácticas

1. **Aislamiento**: Cada prueba debe ejecutarse de forma aislada, sin depender del estado dejado por otras pruebas.

2. **Claridad**: Cada prueba debe tener un nombre claro que describa lo que prueba y lo que se espera.

3. **Estructura**: Utiliza describe para agrupar pruebas relacionadas y beforeEach/afterEach para configuración y limpieza.

4. **Cobertura**: Intenta cubrir casos de éxito y casos de error para cada método.

5. **Evitar dependencias externas**: Utiliza mocks para simular servicios externos y no depender de conexiones a internet o APIs reales en las pruebas.

## Añadir Nuevas Pruebas

Al implementar un nuevo adaptador EMR, debes crear las correspondientes pruebas unitarias siguiendo estos pasos:

1. Crear un archivo de prueba en `src/__tests__/services/emr/` con el nombre `[NuevoSistema]Adapter.test.ts`.

2. Añadir datos mock para el nuevo sistema en `mocks/MockEMRResponses.ts`.

3. Actualizar `mocks/MockHttpService.ts` para soportar las llamadas al nuevo sistema.

4. Implementar pruebas para todos los métodos del adaptador.

5. Actualizar las pruebas de `EMRAdapterFactory.test.ts` para incluir el nuevo adaptador.

## Resolución de Problemas

### Errores de TypeScript en Pruebas

Si encuentras errores de tipos en las pruebas:

1. Asegúrate de que los tipos de los datos mock coinciden con lo que espera el adaptador.
2. Utiliza `as unknown as [Tipo]` para casos donde sea necesario hacer casting de tipos en las pruebas.

### Pruebas Asíncronas Fallidas

Si las pruebas asíncronas fallan con timeout:

1. Verifica que todas las promesas se resuelven en las pruebas.
2. Comprueba que los mocks están configurados correctamente.
3. Asegúrate de utilizar `async/await` o `done` para manejar correctamente la asincronía.

## Mantenimiento

Es importante mantener las pruebas actualizadas cuando se modifican los adaptadores. Asegúrate de:

1. Actualizar los datos mock si cambia la estructura de datos esperada.
2. Añadir pruebas para nuevos métodos o funcionalidades.
3. Revisar la cobertura de pruebas regularmente para identificar áreas no cubiertas.
