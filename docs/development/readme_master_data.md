# MapleAI Health - Documentación Centralizada

## Introducción

MapleAI Health es una plataforma inteligente para profesionales de la salud que combina un sistema de registro médico electrónico (EMR) con asistencia de IA para toma de decisiones clínicas basadas en evidencia. Este documento centraliza y organiza toda la documentación relevante del proyecto.

## Índice General

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Estado Actual del Desarrollo](#estado-actual-del-desarrollo)
3. [MVP y Planificación](#mvp-y-planificación)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Decisiones Técnicas](#decisiones-técnicas)
6. [Sprints Completados](#sprints-completados)
7. [Sprints Actuales](#sprints-actuales)
8. [Próximos Pasos](#próximos-pasos)

## Visión General del Proyecto

MapleAI Health es un sistema de registros médicos electrónicos (EMR) enfocado en asistencia por IA para profesionales de la salud. Se compone de:

- **Sistema EMR**: Gestión completa de pacientes y registros médicos
- **Motor de Búsqueda de Evidencia**: Conexión con bases de datos médicas como PubMed y Cochrane
- **Asistente IA**: Integración con modelos de IA para apoyar decisiones clínicas
- **Dashboard Clínico**: Visualización de datos y evidencia médica

El objetivo principal es mejorar la calidad de atención médica mediante el apoyo basado en evidencia y automatización inteligente.

## Estado Actual del Desarrollo

Actualmente, el proyecto está en fase de desarrollo del MVP, organizado en tres sprints secuenciales:

1. **Sprint 1: MVP Core** - Infraestructura y Sistema Base (en curso)
2. **Sprint 2: MVP Clínico** - Gestión de Evidencia Médica (planificado)
3. **Sprint 3: MVP Asistente** - IA y Experiencia de Usuario (planificado)

Los sprints anteriores (pre-MVP) ya completados:
- Sprint 1: Funcionalidades Base (finalizado 28/Feb/2024)
- Sprint 2: Servicios de IA (finalizado 14/Mar/2024)
- Sprint 3: Sistema de Evidencia Clínica (finalizado 28/Mar/2024)

## MVP y Planificación

### Componentes del MVP

El MVP está estructurado en tres sprints con los siguientes componentes principales:

#### Sprint 1: MVP Core (05/05/2025)
- Sistema de Autenticación y Autorización
- Configuración de APIs Médicas
- Sistema de Gestión de Pacientes (Base)

#### Sprint 2: MVP Clínico (19/05/2025)
- Optimización de Sistema de Caché
- Dashboard de Información Clínica
- Componente de Visualización de Evidencia

#### Sprint 3: MVP Asistente (02/06/2025)
- Integración de Asistente IA
- Sistema de Registro de Interacciones
- Mejora de UX/UI General

## Componentes del Sistema

### Registro Médico Electrónico (EMR)
- Gestión de pacientes
- Documentación SOAP
- Historial clínico
- Gestión de planes de tratamiento

### Asistente Clínico Inteligente
El módulo de asistencia por IA incluye:
- Panel de sugerencias inteligentes
- Detección de patrones en documentación SOAP
- Recomendaciones contextuales
- Integración con el flujo de trabajo clínico

### Sistema de Búsqueda de Evidencia
- Conexión con APIs médicas (PubMed, Cochrane)
- Sistema de caché optimizado
- Visualización de evidencia médica
- Evaluación de calidad de evidencia

## Decisiones Técnicas

### Tecnologías Principales
- Frontend: React con TypeScript
- Gestión de Estado: React Hooks/Context
- UI: Tailwind CSS
- Backend: Node.js con Express
- Base de Datos: MongoDB
- Búsqueda: Elasticsearch
- IA: Integración con modelos avanzados de procesamiento de lenguaje natural

### Optimización de Caché
El sistema implementa una estrategia de caché sofisticada para mejorar el rendimiento de búsqueda con:
- Priorización inteligente
- Invalidación estratégica
- Compresión de datos
- Métricas de rendimiento

## Sprints Completados

### Sprint 1: Funcionalidades Base (28/Feb/2024)
- ✅ Sistema de recomendaciones inicial
- ✅ Adaptadores de fichas clínicas
- ✅ Validación de técnicas fisioterapéuticas
- ✅ Sistema de consentimiento informado
- ✅ Motor de búsqueda de evidencia científica

### Sprint 2: Servicios de IA (14/Mar/2024)
- ✅ Sistema de pruebas para servicios de IA
- ✅ Servicio principal de IA
- ✅ Solución de problemas de linting y tipos
- ✅ Documentación técnica de servicios de IA

### Sprint 3: Sistema de Evidencia Clínica (28/Mar/2024)
- ✅ Dashboard de Información Clínica
- ✅ Servicio de Priorización de Caché
- ✅ Estrategia de Invalidación de Caché
- ✅ Componente de Visualización de Evidencia
- ✅ Servicio de Verificación de Fuentes Médicas
- ✅ Servicio de Evaluación de Evidencia Clínica

## Sprints Actuales

### Sprint 9: Sistema de Registro y Análisis (29/Mar/2024 - 11/Abr/2024)
- Sistema de Registro y Análisis de Interacciones
- Sistema de Registro de Interacciones
- Dashboard de Análisis de Impacto
- API de Registro y Consulta

## Próximos Pasos

1. Completar el Sprint 9 actual
2. Iniciar la implementación del MVP siguiendo la estructura de 3 sprints
3. Integrar completamente el asistente IA con el sistema EMR
4. Mejorar la experiencia de usuario general
5. Implementar pruebas exhaustivas del sistema

---

**Última actualización:** Abril 2024 