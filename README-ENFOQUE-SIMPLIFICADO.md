# Enfoque Simplificado para MapleAIHealth

## Estrategia de simplificación radical

Debido a la gran cantidad de errores persistentes (914 errores en 100 archivos), hemos optado por un enfoque de simplificación radical:

1. **Volver a la rama estable**: Partimos de `fix/error-correction-20250402` como base
2. **Reconstrucción mínima**: Implementamos solo los componentes y servicios esenciales
3. **Arquitectura simplificada**: Reducimos las dependencias entre módulos

## Pasos implementados

1. **Respaldo completo**: Preservamos el código original en carpetas de backup
2. **Componentes básicos**: Reconstruimos los componentes UI fundamentales
3. **Servicios esenciales**: Implementamos solo la funcionalidad crítica de EMR/AI

## Próximos pasos recomendados

1. Desarrollar con TDD (Test-Driven Development) para evitar errores futuros
2. Añadir componentes y servicios incrementalmente, verificando en cada paso
3. Implementar validaciones de tipos estrictas en CI/CD

## Requisitos para macOS M1

- Node.js optimizado para ARM64
- Incrementar límites de sistema cuando sea necesario: `ulimit -n 4096`
- Utilizar herramientas compatibles con macOS para scripts (comandos `sed` específicos, etc.)
