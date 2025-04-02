# 📋 Plan para la Segunda Iteración de Correcciones

## Análisis de la Primera Iteración

Tras ejecutar `workflow-automation.sh`, hemos identificado algunos desafíos importantes:

1. **Aumento de errores detectados**: De 173 a 268 errores, un incremento del 54%.
2. **Problemas con componentes de Chakra UI**: Múltiples errores de importación en `EMRPatientSearch.tsx`.
3. **Inconsistencias de tipos**: Problemas con interfaces en adaptadores EMR.
4. **Errores de configuración**: Posibles problemas con la configuración de TypeScript.

## Causas Raíz Identificadas

1. **Configuración incorrecta de TypeScript**:
   - Los errores de `moduleResolution` indican problemas en la configuración de TypeScript
   - La bandera `--jsx` falta en la compilación

2. **Interfaces incompletas**:
   - Al reemplazar `any` por tipos más específicos, aparecen discrepancias entre interfaces
   - Propiedades declaradas múltiples veces con distintos modificadores

3. **Dependencias incompatibles**:
   - Versiones de `@chakra-ui/react` y `@ark-ui/react` no compatibles con la configuración actual

## Plan de Corrección

### 1. Corregir Configuración de TypeScript (Prioridad Alta)

```bash
# Actualizar tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowJs": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "vite.config.ts"]
}
EOF
```

### 2. Corregir Duplicación de Importaciones (Prioridad Alta)

Script dedicado para `EMRPatientSearch.tsx`:

```bash
# Crear el script fix-imports.sh
cat > scripts/fix-imports.sh << 'EOF'
#!/bin/bash

# Corrige problemas de importación duplicada en componentes
TARGET_FILE="src/components/examples/EMRPatientSearch.tsx"

if [ ! -f "$TARGET_FILE" ]; then
  echo "Archivo no encontrado: $TARGET_FILE"
  exit 1
fi

# Crear backup
cp "$TARGET_FILE" "$TARGET_FILE.bak"

# Eliminar imports duplicados y corregir importación de Chakra UI
cat > "$TARGET_FILE" << 'END'
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import { EMRService } from '../../services/emr/EMRService';
import { EMRAdapter, EMRPatientSearchResult } from '../../services/emr/EMRAdapter';
import { EMRConfigService } from '../../services/emr/EMRConfigService';

// Continuar con el resto del archivo...
END

# Obtener el resto del contenido del archivo original a partir de la línea 70
tail -n +70 "$TARGET_FILE.bak" >> "$TARGET_FILE"

echo "Corregidos problemas de importación en $TARGET_FILE"
EOF

chmod +x scripts/fix-imports.sh
```

### 3. Corregir Interfaces en Adaptadores (Prioridad Media)

Crear un script para corregir interfaces en los adaptadores:

```bash
# Crear script fix-interfaces.sh
cat > scripts/fix-interfaces.sh << 'EOF'
#!/bin/bash

# Corrige interfaces en los adaptadores EMR

# Directorio para guardar backups
BACKUP_DIR="reports/backups-interfaces-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Corregir ClinicCloudAdapter.ts
CLINIC_ADAPTER="src/services/emr/implementations/ClinicCloudAdapter.ts"
if [ -f "$CLINIC_ADAPTER" ]; then
  cp "$CLINIC_ADAPTER" "$BACKUP_DIR/$(basename $CLINIC_ADAPTER)"

  # Corregir propiedades con modificadores inconsistentes
  sed -i '' 's/diagnosticos: {/readonly diagnosticos: {/g' "$CLINIC_ADAPTER"
  sed -i '' 's/fechaFin: /readonly fechaFin: /g' "$CLINIC_ADAPTER"
  sed -i '' 's/instrucciones: /readonly instrucciones: /g' "$CLINIC_ADAPTER"
  sed -i '' 's/descripcion: /readonly descripcion: /g' "$CLINIC_ADAPTER"
  sed -i '' 's/consultaId: /readonly consultaId: /g' "$CLINIC_ADAPTER"

  echo "Corregidas interfaces en $CLINIC_ADAPTER"
fi

# Corregir OSCARAdapter.ts
OSCAR_ADAPTER="src/services/emr/implementations/OSCARAdapter.ts"
if [ -f "$OSCAR_ADAPTER" ]; then
  cp "$OSCAR_ADAPTER" "$BACKUP_DIR/$(basename $OSCAR_ADAPTER)"

  # Corregir tipos de retorno
  sed -i '' 's/fullName:/readonly fullName:/g' "$OSCAR_ADAPTER"
  sed -i '' 's/MedicalHistoryResult/{ allergies?: string[]; chronicConditions?: string[]; medications?: { name: string; dosage: string; frequency: string; startDate?: string; endDate?: string; }[]; surgeries?: { procedure: string; date: string; notes?: string; }[]; familyHistory?: Record<string, string[]>; }/g' "$OSCAR_ADAPTER"

  echo "Corregidas interfaces en $OSCAR_ADAPTER"
fi
EOF

chmod +x scripts/fix-interfaces.sh
```

### 4. Actualizar Workflow para la Segunda Iteración

```bash
# Crear script para segunda iteración
cat > scripts/workflow-iteration2.sh << 'EOF'
#!/bin/bash

# Script para segunda iteración de correcciones

echo "=== Segunda Iteración de Correcciones ==="
echo "Fecha: $(date)"

# 1. Corregir configuración de TypeScript
echo "1. Corrigiendo configuración de TypeScript..."
# El tsconfig.json ya debe estar actualizado manualmente

# 2. Corregir problemas de importación
echo "2. Corrigiendo problemas de importación..."
./scripts/fix-imports.sh

# 3. Corregir interfaces
echo "3. Corrigiendo interfaces..."
./scripts/fix-interfaces.sh

# 4. Verificar mejoras
echo "4. Verificando mejoras..."
./scripts/error-check.sh

echo "=== Completada Segunda Iteración ==="
EOF

chmod +x scripts/workflow-iteration2.sh
```

## Acciones Manuales Requeridas

Antes de ejecutar la segunda iteración, se recomienda realizar las siguientes acciones manuales:

1. **Revisión de dependencias**:
   ```bash
   npm list @chakra-ui/react @ark-ui/react
   ```
   Considerar actualizar o fijar versiones específicas si hay conflictos.

2. **Corregir EMRPatientSearch.tsx manualmente**:
   - Revisar estructura del componente
   - Asegurar que las propiedades requeridas estén definidas
   - Verificar tipos de props

3. **Unificar tipos en adaptadores EMR**:
   - Revisar y unificar interfaces entre los adaptadores
   - Asegurar consistencia en propiedades y tipos

## Agenda de Seguimiento

1. Ejecutar scripts de corrección para segunda iteración
2. Evaluar progreso y reducción de errores
3. Asignar tareas específicas para correcciones manuales
4. Documentar lecciones aprendidas para prevención futura

## Métricas de Éxito

- Reducción de errores críticos por debajo de 50
- Eliminación completa de errores de duplicación
- Funcionamiento correcto de `EMRPatientSearch.tsx`
