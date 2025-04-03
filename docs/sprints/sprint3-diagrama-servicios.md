# Diagrama de Arquitectura - Sistema de Evaluación de Evidencia Clínica

## Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                       INTERFAZ DE USUARIO                               │
│                                                                         │
│  ┌───────────────┐     ┌────────────────┐     ┌────────────────────┐   │
│  │               │     │                │     │                    │   │
│  │ EvidenceBadge │     │ AlertaCalidad  │     │ Dashboard Médico   │   │
│  │               │     │                │     │                    │   │
│  └───────┬───────┘     └────────┬───────┘     └─────────┬──────────┘   │
│          │                      │                       │              │
└──────────┼──────────────────────┼───────────────────────┼──────────────┘
           │                      │                       │
┌──────────┼──────────────────────┼───────────────────────┼──────────────┐
│          │                      │                       │              │
│          ▼                      ▼                       ▼              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │                   CAPA DE INTEGRACIÓN                           │   │
│  │                                                                 │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │                                                        │    │   │
│  │  │            EMRAIIntegrationService                     │    │   │
│  │  │                                                        │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                                                                 │   │
│  └────┬──────────────────────────┬───────────────────────┬─────────┘   │
│       │                          │                       │             │
│       ▼                          ▼                       ▼             │
│  ┌──────────────┐      ┌───────────────────┐    ┌───────────────────┐ │
│  │              │      │                   │    │                   │ │
│  │ AIService    │      │ EMRAdapter        │    │ CacheService      │ │
│  │              │      │                   │    │                   │ │
│  └──────┬───────┘      └─────────┬─────────┘    └─────────┬─────────┘ │
│         │                        │                        │           │
└─────────┼────────────────────────┼────────────────────────┼───────────┘
          │                        │                        │
┌─────────┼────────────────────────┼────────────────────────┼───────────┐
│         │                        │                        │           │
│         ▼                        ▼                        ▼           │
│ ┌──────────────────┐    ┌────────────────────┐   ┌───────────────────┐│
│ │                  │    │                    │   │                   ││
│ │NUEVOS SERVICIOS  │    │  SISTEMA EMR       │   │  SISTEMA DE CACHÉ ││
│ │DE EVALUACIÓN     │    │                    │   │                   ││
│ │                  │    │                    │   │                   ││
│ │┌────────────────┐│    │                    │   │                   ││
│ ││EvidenceEvalua- ││    │                    │   │┌─────────────────┐││
│ ││tionService     ││    │                    │   ││InvalidaciónIn-  │││
│ │└────────────────┘│    │                    │   ││teligenteCache   │││
│ │                  │    │                    │   │└─────────────────┘││
│ │┌────────────────┐│    │                    │   │                   ││
│ ││MedicalSource-  ││    │                    │   │┌─────────────────┐││
│ ││Verifier        ││    │                    │   ││PriorizaciónCache│││
│ │└────────────────┘│    │                    │   │└─────────────────┘││
│ │                  │    │                    │   │                   ││
│ └──────┬───────────┘    └──────────┬─────────┘   └────────┬──────────┘│
│        │                           │                      │           │
└────────┼───────────────────────────┼──────────────────────┼───────────┘
         │                           │                      │
┌────────┼───────────────────────────┼──────────────────────┼───────────┐
│        │                           │                      │           │
│        ▼                           ▼                      ▼           │
│ ┌─────────────────┐      ┌─────────────────────┐  ┌──────────────────┐│
│ │                 │      │                     │  │                  ││
│ │ Bases Médicas   │      │ Sistemas EMR        │  │ Almacenamiento   ││
│ │ (PubMed,        │      │ Externos            │  │ de Caché         ││
│ │  Cochrane, etc) │      │                     │  │                  ││
│ │                 │      │                     │  │                  ││
│ └─────────────────┘      └─────────────────────┘  └──────────────────┘│
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Descripción de Componentes

### 1. Capa de Interfaz de Usuario
- **EvidenceBadge**: Componente visual que muestra el nivel de evidencia (A-D) con códigos de color.
- **AlertaCalidad**: Componente que alerta cuando la evidencia no alcanza un umbral mínimo.
- **Dashboard Médico**: Vista principal para profesionales médicos con información integrada.

### 2. Capa de Integración
- **EMRAIIntegrationService**: Orquesta la comunicación entre los sistemas EMR, AI y los nuevos servicios de evaluación.

### 3. Servicios Principales
- **AIService**: Servicio existente que proporciona análisis de IA para consultas médicas.
- **EMRAdapter**: Adaptador para los diferentes sistemas EMR.
- **CacheService**: Gestiona el almacenamiento en caché de las consultas frecuentes.

### 4. Nuevos Servicios de Evaluación de Evidencia
- **EvidenceEvaluationService**: Evalúa y clasifica la calidad de la evidencia en niveles.
- **MedicalSourceVerifier**: Verifica las fuentes citadas contra bases de datos médicas.

### 5. Sistema de Caché Mejorado
- **InvalidaciónInteligenteCache**: Implementa TTL variable y etiquetas para invalidación selectiva.
- **PriorizaciónCache**: Gestiona qué consultas permanecen en caché basado en relevancia y frecuencia.

### 6. Sistemas Externos
- **Bases Médicas**: PubMed, Cochrane, etc. para verificación de fuentes.
- **Sistemas EMR Externos**: Historias clínicas electrónicas externas.
- **Almacenamiento de Caché**: Sistema de almacenamiento para respuestas cacheadas.

## Flujo de Datos

1. La interfaz de usuario solicita información a través de la capa de integración.
2. La capa de integración coordina entre EMRAdapter y AIService.
3. Las respuestas de IA son evaluadas por EvidenceEvaluationService y MedicalSourceVerifier.
4. El CacheService aplica estrategias de invalidación y priorización.
5. Los resultados finales, con niveles de evidencia, se muestran en la interfaz de usuario.

## Consideraciones Técnicas

- **Rendimiento**: Las operaciones de verificación de evidencia deben ejecutarse de manera asíncrona para no bloquear la experiencia del usuario.
- **Escalabilidad**: Los servicios de evaluación deben escalarse horizontalmente para manejar aumento de carga.
- **Seguridad**: Todas las consultas a bases médicas externas deben estar debidamente autenticadas y los datos sensibles encriptados.
- **Monitoreo**: Implementar métricas para seguimiento de calidad de evidencia y rendimiento del sistema de caché.
