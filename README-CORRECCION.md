# Guía de Corrección de Errores - MapleAIHealth

## Estrategia implementada el 3 de abril de 2025

1. **Restauración selectiva**: Se restauraron componentes clave desde la rama estable `fix/error-correction-20250402`
2. **Correcciones de tipos en EPICAdapter.ts**: 
   - Manejo de IDs indefinidos con `crypto.randomUUID()`
   - Tipos específicos para valores de retorno
   - Aserciones de tipo para literales de cadena
3. **Reconstrucción de archivos con errores de sintaxis**:
   - Servicios AI: Reconstruidos con implementaciones mínimas funcionales
   - Interfaces EMR: Simplificadas para mantener compatibilidad

## Problemas comunes y soluciones

### 1. Importaciones incorrectas
```typescript
// Incorrecto
import { 
} from "../lib/api"
id: string

// Correcto
import { HttpService } from "../lib/api";

export interface MyType {
  id: string;
}
```

### 2. IDs indefinidos
```typescript
// Correcto
id: patient.id || crypto.randomUUID()
```

### 3. Tipos específicos
```typescript
// Correcto
return "active" as const;
```

## Procedimiento para macOS M1

1. **Aumentar límites de sistema**:
   ```bash
   ulimit -n 4096  # Aumentar límite de archivos
   ```

2. **Restaurar desde rama estable**:
   ```bash
   git checkout rama-estable -- src/components/
   ```

3. **Aplicar correcciones incrementales**:
   ```bash
   ./scripts/fix-specific-issues.sh
   ```
