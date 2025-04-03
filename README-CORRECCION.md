# Directrices para Corrección de Errores - MapleAIHealth

## Principios para la Corrección de Errores

1. **Trabajar por paquetes funcionales**:
   - Servicios EMR
   - Servicios AI
   - Componentes UI
   - Servicios de Pacientes

2. **Crear respaldos antes de modificar**:
   ```bash
   mkdir -p backups/fix-YYYYMMDD
   rsync -a src/ backups/fix-YYYYMMDD/
   ```

3. **Correcciones comunes**:

   **IDs indefinidos**:
   ```typescript
   // Correcto
   id: objeto.id || crypto.randomUUID()
   ```

   **Importaciones React**:
   ```typescript
   // Al inicio de archivos TSX
   import React from "react";
   ```

   **Interfaces exportadas**:
   ```typescript
   export interface ComponentProps { ... }
   ```

## Procedimiento de Emergencia

Si hay demasiados errores:

1. Volver a la rama estable:
   ```bash
   git checkout fix/error-correction-20250402
   ```

2. Crear nueva rama:
   ```bash
   git checkout -b fix/nuevas-correcciones
   ```

3. Corregir archivos por categorías
