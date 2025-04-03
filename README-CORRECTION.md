# Guía de Corrección de Errores para MapleAIHealth

Este documento proporciona directrices para la corrección de errores en el proyecto MapleAIHealth, especialmente diseñado para entornos macOS M1.

## Requisitos del Sistema

- macOS M1 2020 o superior
- Node.js 16.x o superior
- npm 8.x o superior

## Principios para Correcciones Futuras

1. **Organización por Paquetes**: Siempre corregir errores en paquetes lógicos relacionados (no por archivos individuales aislados):
   - Tipos e interfaces primero
   - Servicios AI
   - Servicios EMR
   - Servicios de pacientes
   - Componentes UI
   - Archivos de test

2. **Respaldos Obligatorios**: Siempre crear respaldos antes de realizar correcciones:
   ```bash
   # Ejemplo de comando para crear respaldos
   timestamp=$(date +"%Y%m%d_%H%M%S")
   mkdir -p backups/pre-fix-$timestamp
   rsync -a src/ backups/pre-fix-$timestamp/
   ```

3. **Evitar Correcciones Masivas Automatizadas**: No ejecutar scripts de corrección automatizada sin supervisión.

4. **Verificación Incremental**: Verificar el impacto de cada grupo de correcciones antes de continuar:
   ```bash
   # Verificar errores en archivos específicos
   npm run type-check -- --files src/services/ai/types.ts
   ```

5. **Creación de Ramas**: Siempre trabajar en una rama separada para las correcciones:
   ```bash
   git checkout -b fix/[categoria]-[fecha]
   ```

## Script de Corrección Recomendado

El script `scripts/fix-critical-errors.sh` implementa estos principios y corrige errores de manera organizada:

```bash
# Ejecutar el script de corrección
./scripts/fix-critical-errors.sh
```

## Errores Comunes y Soluciones

### 1. Errores de Importación React en archivos TSX

**Problema**: Archivos TSX sin importación de React.
**Solución**: Añadir `import React from "react";` al principio del archivo.

### 2. Errores de IDs Indefinidos

**Problema**: IDs pueden ser undefined en operaciones.
**Solución**: Usar `crypto.randomUUID()` como fallback:
```typescript
id: entity.id || crypto.randomUUID()
```

### 3. Errores de Mapeo de Status

**Problema**: Valores de status incorrectos.
**Solución**: Usar aserciones de tipo:
```typescript
return "active" as const;
```

### 4. Errores de Interfaz no Exportada

**Problema**: Interfaces sin exportar.
**Solución**: Añadir `export` a las definiciones de interfaces:
```typescript
export interface ComponentProps {
  // propiedades
}
```

## Procedimiento de Emergencia

Si el proyecto tiene muchos errores críticos, sigue estos pasos:

1. Vuelve a la última versión estable: `git checkout [commit-estable]`
2. Crea una nueva rama: `git checkout -b fix/emergency-[fecha]`
3. Ejecuta el script de corrección: `./scripts/fix-critical-errors.sh`
4. Verifica los errores restantes: `npm run type-check`
5. Corrige manualmente cualquier error restante
6. Haz commit de los cambios: `git commit -am "fix: corrección de emergencia"`

## Contacto para Soporte

Si encuentras problemas críticos que no puedes resolver, contacta al equipo de desarrollo:

- Email: desarrollo@mapleaihealth.com
- Slack: #maple-tech-support
