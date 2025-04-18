# 🍁 MapleAI Health - Seguimiento de Progreso

## Visión General

Este documento rastrea el estado de los sprints para los componentes AIDUX EMR y AIDUX Assistant.

> **Nota Importante**: Aunque el MVP se centra en fisioterapia MSK, toda la arquitectura se diseña para ser expandible a múltiples especialidades médicas y adaptable a diferentes regiones (España inicialmente, luego Canadá/EE.UU).

**Última Actualización:** 18 de Mayo de 2024

---

## 🏥 AIDUX EMR

### Milestone 2: MVP Fisioterapia EMR (Sprints 4-7)

**Sprint 4: Módulo Base de Fisioterapia**
*   **Objetivo:** Implementar estructura SOAP y evaluación física MSK básica con arquitectura expandible.
*   **Estado:** ✅ COMPLETADO
*   **Tareas Clave:**
    *   [x] E1: Estructura SOAP específica MSK (arquitectura adaptable a otras especialidades)
    *   [x] E2: Campos evaluación física MSK (framework genérico de evaluación)
    *   [x] E3: Registro mediciones ROM/fuerza (sistema de métricas extensible)
    *   [x] E4: Sistema seguimiento visual básico (componente reutilizable)

**Sprint 5: Gestión de Planes de Tratamiento**
*   **Objetivo:** Implementar biblioteca de ejercicios y planificación de sesiones.
*   **Estado:** 🔄 EN PROGRESO
*   **Tareas Clave:**
    *   [ ] E5: Biblioteca ejercicios básicos MSK (arquitectura para expansión)
    *   [ ] E6: Planificación de sesiones (framework genérico de planificación)
    *   [ ] E7: Documentación resultados funcionales (métricas adaptables)
    *   [ ] E8: Componente seguimiento visual (visualización configurable)

**Sprint 6: Documentación Clínica**
*   **Objetivo:** Generar informes, certificados y exportación de planes.
*   **Estado:** ⏳ No Iniciado
*   **Tareas Clave:**
    *   [ ] E9: Generador informes médicos (sistema de plantillas extensible)
    *   [ ] E10: Creación certificados asistencia (adaptable a requisitos regionales)
    *   [ ] E11: Exportación planes ejercicios (formato estandarizado)
    *   [ ] E12: Personalización plantillas (sistema configurable)

**Sprint 7: Sistema de Facturación Español**
*   **Objetivo:** Implementar sistema de facturación básico adaptado a normativa española con arquitectura extensible.
*   **Estado:** ⏳ No Iniciado
*   **Tareas Clave:**
    *   [ ] E13: Generación de facturas según normativa española
    *   [ ] E14: Gestión de IVA y exenciones para servicios médicos
    *   [ ] E15: Sistema de numeración y registro fiscal
    *   [ ] E16: Arquitectura extensible para futuras regiones (Canadá/EE.UU)

---

## 🤖 AIDUX Assistant

### Milestone 3: MVP Fisioterapia Assistant (Sprints 8-11)

**Sprint 8: Arquitectura Base del Asistente**
*   **Objetivo:** Implementar framework del agente y conexión con modelo base.
*   **Estado:** ⏳ No Iniciado
*   **Tareas Clave:**
    *   [ ] A1: Framework agente expandible (LangChain/LlamaIndex)
    *   [ ] A2: Integración Claude (arquitectura adaptable a múltiples LLMs)
    *   [ ] A3: Sistema prompts/contexto (templating para múltiples especialidades)
    *   [ ] A4: Interfaz chat integrada (componente reutilizable)

**Sprint 9: Funcionalidades Clínicas**
*   **Objetivo:** Reconocimiento entidades médicas, estructuración SOAP, banderas rojas.
*   **Estado:** ⏳ No Iniciado
*   **Tareas Clave:**
    *   [ ] A5: Reconocimiento entidades médicas Fisio (base expandible)
    *   [ ] A6: Estructuración notas en SOAP (framework genérico adaptable)
    *   [ ] A7: Detección banderas rojas MSK (sistema extensible de alertas)
    *   [ ] A8: Sugerencias contextuales básicas (arquitectura modular)

**Sprint 10: Integración con EMR**
*   **Objetivo:** Comunicación bidireccional EMR-Assistant, lectura/escritura asistida.
*   **Estado:** ⏳ No Iniciado
*   **Tareas Clave:**
    *   [ ] A9: API bidireccional EMR-Assistant (framework genérico de comunicación)
    *   [ ] A10: Lectura contexto paciente (acceso estándar a datos)
    *   [ ] A11: Escritura asistida en EMR (sistema abstracción de escritura)
    *   [ ] A12: Confirmación acciones críticas (protocolos de seguridad)

**Sprint 11: Pruebas y Optimización**
*   **Objetivo:** Validar con casos reales, optimizar costos y rendimiento.
*   **Estado:** ⏳ No Iniciado
*   **Tareas Clave:**
    *   [ ] A13: Pruebas con casos clínicos reales (framework de validación)
    *   [ ] A14: Optimización consumo tokens (estrategias adaptativas)
    *   [ ] A15: Implementación cache (sistema eficiente y seguro)
    *   [ ] A16: Sistema feedback usuario (métricas de calidad)

---

## 🚀 Roadmap Futuro (Post-MVP)

**Expansión de Especialidades**
* Adaptación a Medicina General
* Adaptación a otras especialidades (Traumatología, Neurología, etc.)
* Framework común para todas las especialidades

**Expansión Geográfica**
* Adaptación a requisitos de Canadá
* Adaptación a requisitos de EE.UU.
* Sistema multi-región completamente configurable

**Integración con Aseguradoras**
* Paneles específicos para aseguradoras
* Métricas de reducción de riesgo
* Sistema de auditoría para validación de calidad

**Gestión Avanzada**
* Sistema completo de agenda
* Gestión financiera avanzada
* Analytics y Business Intelligence

--- 