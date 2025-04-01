# MapleHealth AI

Una plataforma de inteligencia artificial para la asistencia clínica en tiempo real, diseñada para transformar la atención médica mediante tecnología avanzada adaptada a las necesidades de los profesionales de la salud.

## Nuestra Visión

MapleHealth AI busca posicionarse como el puente inteligente entre los sistemas médicos existentes y los profesionales de la salud, potenciando la práctica clínica sin reemplazar el criterio médico. En un mundo donde la información médica crece exponencialmente, ofrecemos herramientas que permiten a los médicos tomar decisiones más informadas y eficientes.

## Características Principales

- **Copiloto Clínico**: Asistencia contextual inteligente durante la consulta médica.
- **Análisis de EMR**: Procesamiento avanzado de registros médicos electrónicos con detección de patrones, contradicciones y alertas.
- **Recomendaciones Basadas en Evidencia**: Sugerencias de tratamientos y diagnósticos respaldados por literatura científica actualizada.
- **Adaptadores EMR Universales**: Integración sin fricción con todos los principales sistemas de registros médicos.
- **Apoyo a la Decisión Clínica**: Herramientas que asisten en el diagnóstico diferencial y planificación de tratamiento.

## Nuestra Diferenciación en el Mercado

A diferencia de otras soluciones de IA en salud, MapleHealth AI:

1. **Funciona como una Capa Universal**: Nos integramos con cualquier sistema EMR existente, sin requerir cambios en la infraestructura actual.
2. **Contextualiza en Tiempo Real**: Proporcionamos asistencia durante la consulta, adaptándonos a cada etapa del proceso clínico.
3. **Prioriza la Interoperabilidad**: Diseñados para funcionar en ecosistemas de salud heterogéneos.
4. **Mantiene al Médico en Control**: Somos un asistente, no un reemplazo. Todas las decisiones finales permanecen en manos del profesional.
5. **Enfoque en la Experiencia Clínica**: Desarrollado con y para médicos, enfocados en los flujos de trabajo reales.

## Arquitectura

Nuestra arquitectura está diseñada para ser:

- **Modular**: Componentes independientes que pueden evolucionar por separado.
- **Escalable**: Preparada para gestionar desde pequeñas clínicas hasta grandes sistemas hospitalarios.
- **Segura**: Cumplimiento estricto con regulaciones de protección de datos médicos (HIPAA, GDPR, etc.).
- **Adaptable**: Capacidad para integrarse con sistemas legacy y nuevas tecnologías.

### Componentes Clave:

- **Sistema de Adaptadores EMR**: Capa de integración con diferentes sistemas de registros médicos.
- **Motor de IA Clínica**: Procesamiento avanzado de datos médicos y generación de insights.
- **Copiloto de Consulta**: Asistencia contextual durante las interacciones médico-paciente.
- **Módulo de Evidencia Médica**: Conexión con fuentes actualizadas de literatura científica.

## Adaptadores EMR Implementados

MapleHealth AI puede integrarse con diversos sistemas de Registro Médico Electrónico (EMR) gracias a nuestra arquitectura de adaptadores. Actualmente, ofrecemos integración con:

### Adaptadores para Canadá

- **OSCAR EMR**: Sistema de código abierto ampliamente utilizado en Ontario y otras provincias canadienses.
- **EPIC**: Uno de los sistemas EMR más utilizados en hospitales y grandes centros médicos de Canadá.

### Adaptadores para España

- **ClinicCloud**: Sistema EMR popular en clínicas privadas y consultas médicas particulares en España.

### Adaptador Genérico

- **GenericEMRAdapter**: Para desarrollo, pruebas o simulación en entornos donde no se dispone de acceso a un sistema EMR real.

## Cómo Utilizar los Adaptadores EMR

Los adaptadores EMR se gestionan a través de la clase `EMRAdapterFactory`, que proporciona una interfaz unificada para acceder a cualquier adaptador:

```typescript
import { EMRAdapterFactory } from './src/services/emr/EMRAdapterFactory';

// Obtener un adaptador existente
const oscarAdapter = EMRAdapterFactory.getAdapter('OSCAR');

// Crear una nueva instancia con configuración personalizada
const clinicCloudAdapter = EMRAdapterFactory.getAdapter('CLINICCLOUD', {
  apiUrl: 'https://api.cliniccloud.es',
  apiKey: 'tu-api-key',
  clinicId: 'id-de-tu-clinica'
});

// Verificar conexión
const isConnected = await clinicCloudAdapter.testConnection();

// Obtener datos de un paciente
const patientData = await oscarAdapter.getPatientData('123456');

// Buscar pacientes
const searchResults = await oscarAdapter.searchPatients({
  name: 'García'
}, 10);

// Obtener historial médico
const patientHistory = await oscarAdapter.getPatientHistory('123456', {
  startDate: new Date('2023-01-01'),
  endDate: new Date()
});
```

### Configuración de Adaptadores

Cada adaptador requiere parámetros específicos para su configuración:

#### OSCAR EMR

```typescript
const oscarAdapter = EMRAdapterFactory.getAdapter('OSCAR', {
  baseUrl: 'https://oscar-instance.hospital.ca',
  username: 'usuario-oscar',
  password: 'contraseña-segura',
  clinicId: 'id-clinica'
});
```

#### ClinicCloud

```typescript
const clinicCloudAdapter = EMRAdapterFactory.getAdapter('CLINICCLOUD', {
  apiUrl: 'https://api.cliniccloud.es',
  apiKey: 'tu-api-key',
  clinicId: 'id-de-tu-clinica',
  clientId: 'oauth-client-id',      // Opcional, para OAuth
  clientSecret: 'oauth-client-secret' // Opcional, para OAuth
});
```

#### EPIC

```typescript
const epicAdapter = EMRAdapterFactory.getAdapter('EPIC', {
  baseUrl: 'https://epic-fhir-api.hospital.org',
  apiKey: 'tu-api-key',
  clientId: 'tu-client-id',         // Para OAuth2
  clientSecret: 'tu-client-secret'  // Para OAuth2
});
```

### Listar Adaptadores Disponibles

Para obtener los adaptadores disponibles:

```typescript
// Obtener lista de IDs de adaptadores
const adapterIds = EMRAdapterFactory.getAvailableAdapters();

// Obtener información detallada
const adaptersInfo = EMRAdapterFactory.getAdaptersInfo();
```

## Requisitos Técnicos

- Node.js >= 18.x
- TypeScript 5.x
- React 18.x
- Next.js 14.x

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/yourusername/maplehealth-ai.git

# Instalar dependencias
cd maplehealth-ai
npm install

# Iniciar entorno de desarrollo
npm run dev
```

## Nuestra Visión para el Futuro de la Medicina

En MapleHealth AI, creemos que el futuro de la atención médica no está en reemplazar a los profesionales, sino en potenciar sus capacidades con herramientas inteligentes que:

- Reduzcan la carga administrativa para devolver tiempo a la relación médico-paciente.
- Democraticen el acceso a conocimiento médico especializado.
- Reduzcan errores diagnósticos y terapéuticos mediante sistemas de apoyo a la decisión.
- Personalicen los tratamientos basados en la evidencia científica más reciente.

Estamos construyendo el futuro donde la tecnología y la medicina se unen para ofrecer una atención más humana, precisa y accesible.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, revisa nuestras guías de contribución antes de enviar un pull request.

## Licencia

Este proyecto está licenciado bajo [LICENCIA] - ver el archivo LICENSE para más detalles.

## Funcionalidades Principales

### Sistema de Vigilancia de Errores

Maple AI Health incluye un sistema de vigilancia de errores que clasifica automáticamente los problemas detectados según su severidad y prioridad, permitiendo al equipo de desarrollo centrarse en resolver los más críticos primero.

#### Clasificación de Prioridad

Los errores se clasifican en las siguientes categorías:

- **BLOCKER**: Errores críticos que bloquean funcionalidad principal y deben atenderse inmediatamente.
- **CRITICAL**: Errores graves que afectan funcionalidad importante pero permiten operación limitada.
- **MAJOR**: Errores moderados que afectan funcionalidad secundaria.
- **MINOR**: Errores menores que no afectan funcionalidad principal.
- **INFO**: Advertencias que no afectan funcionalidad pero podrían indicar problemas futuros.

#### Sistema de Monitoreo de Linting

El sistema incluye un monitoreo específico para errores de linting que permite:

- Priorizar los errores que bloquean la compilación
- Separar errores puramente estéticos de aquellos que afectan la lógica
- Agrupar errores por categorías (TypeScript, ESLint, SonarQube, etc.)
- Generar planes de acción para abordar los errores en orden de importancia

#### Uso Básico

```typescript
import { monitorService, ErrorSeverity, ErrorCategory } from './services/ai';

// Registrar un error
monitorService.captureError({
  message: "Error en la conexión con la API",
  category: ErrorCategory.API,
  severity: ErrorSeverity.HIGH,
  component: "PatientService"
});

// Utilidad para excepciones
import { captureException } from './services/ai';

try {
  // Código que puede generar error
} catch (error) {
  captureException(error, {
    category: ErrorCategory.API,
    severity: ErrorSeverity.MEDIUM,
    component: "AuthService"
  });
}
```

Para errores de linting:

```typescript
import { lintingErrorService, LintingErrorType } from './services/ai';

// Importar errores de SonarQube
lintingErrorService.importSonarQubeErrors(sonarIssues);

// Obtener plan de acción
const plan = lintingErrorService.generateActionPlan();
console.log(`Errores a atender urgentemente: ${plan.immediateAttention.length}`);
```
