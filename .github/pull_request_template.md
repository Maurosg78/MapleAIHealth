# Descripción

Este PR implementa el componente Button (#6) como parte del Sprint 1.

## Cambios

- Implementación del componente Button con variantes y estados
- Configuración de pruebas con Vitest y Testing Library
- Documentación completa del componente
- Utilidades para manejo de clases CSS

## Criterios de Aceptación

- [x] Implementar variantes (primary, secondary, outline, ghost, link)
- [x] Implementar estados (default, hover, active, disabled, loading)
- [x] Implementar tamaños (sm, md, lg)
- [x] Agregar soporte para iconos
- [x] Implementar loading state
- [x] Crear tests unitarios
- [x] Documentar uso y props

## Testing

Se han implementado los siguientes tests:

- Renderizado básico
- Variantes y tamaños
- Estados (loading, disabled)
- Eventos (click)
- Iconos (left, right)

Para ejecutar los tests:

```bash
npm test
```

## Documentación

La documentación completa del componente se encuentra en:
`src/components/common/Button.mdx`

## Screenshots

[Si aplica, agregar screenshots del componente]

## Checklist

- [x] El código sigue las convenciones del proyecto
- [x] Los tests están completos y pasan
- [x] La documentación está actualizada
- [x] No hay errores de linting
- [x] Los cambios son compatibles con el sistema de diseño
- [x] El componente es accesible
