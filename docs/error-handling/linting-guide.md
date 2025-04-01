# Guía de Corrección de Errores de Linting

Esta guía proporciona ejemplos de errores comunes de linting en nuestro proyecto MapleAIHealth y cómo corregirlos correctamente.

## Tipos de Errores por Prioridad

Seguimos la misma clasificación de prioridad descrita en el sistema de vigilancia de errores.

## Errores Críticos

### 1. Uso de `any` explícito

**Problema:**
```typescript
function procesarDatos(datos: any): any {
  return datos.procesar();
}
```

**Solución:**
```typescript
interface DatosProcesables {
  procesar(): ResultadoProcesado;
}

interface ResultadoProcesado {
  // ...propiedades del resultado
}

function procesarDatos(datos: DatosProcesables): ResultadoProcesado {
  return datos.procesar();
}
```

### 2. Variables no utilizadas

**Problema:**
```typescript
function calcularTotal(items: Item[], impuesto: number): number {
  const fecha = new Date(); // Variable no utilizada
  return items.reduce((sum, item) => sum + item.precio, 0);
}
```

**Solución:**
```typescript
function calcularTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.precio, 0);
}
```

### 3. Operador lógico OR en lugar de nullish coalescing

**Problema:**
```typescript
const nombre = usuario.nombre || 'Usuario sin nombre';
```

**Solución:**
```typescript
const nombre = usuario.nombre ?? 'Usuario sin nombre';
```

## Errores Importantes

### 1. Propiedades anidadas sin encadenamiento opcional

**Problema:**
```typescript
if (paciente && paciente.historial && paciente.historial.consultas) {
  // Usar consultas
}
```

**Solución:**
```typescript
if (paciente?.historial?.consultas) {
  // Usar consultas
}
```

### 2. Funciones sin tipo de retorno explícito

**Problema:**
```typescript
function obtenerPaciente(id: string) {
  return servicio.getPaciente(id);
}
```

**Solución:**
```typescript
function obtenerPaciente(id: string): Promise<Paciente | null> {
  return servicio.getPaciente(id);
}
```

### 3. Uso de `var` en lugar de `const` o `let`

**Problema:**
```typescript
var contador = 0;
for (var i = 0; i < items.length; i++) {
  // ...
}
```

**Solución:**
```typescript
const contador = 0; // O let si necesita cambiar
for (let i = 0; i < items.length; i++) {
  // ...
}
```

## Errores Menores

### 1. Inconsistencia en comillas

**Problema:**
```typescript
const nombre = "Juan";
const apellido = 'Pérez';
```

**Solución:**
```typescript
const nombre = 'Juan';
const apellido = 'Pérez';
```

### 2. Espacios en blanco inconsistentes

**Problema:**
```typescript
function suma(a:number,b:number):number{
  return a+b;
}
```

**Solución:**
```typescript
function suma(a: number, b: number): number {
  return a + b;
}
```

### 3. Punto y coma faltantes

**Problema:**
```typescript
const valor = 10
console.log(valor)
```

**Solución:**
```typescript
const valor = 10;
console.log(valor);
```

## Guía de Corrección para Errores Específicos en el Proyecto

### Reemplazo del Operador `||` por `??`

El operador `||` devuelve el segundo operando si el primero es "falsy" (incluyendo `0`, `''`, `false`).
El operador `??` devuelve el segundo operando solo si el primero es `null` o `undefined`.

**Cuándo usar `??`:**
- Cuando trabajamos con valores que podrían ser `null` o `undefined` pero queremos conservar otros valores "falsy" válidos como `0` o cadenas vacías.

**Ejemplo:**
```typescript
// Incorrecto: Si config.maxRetries es 0, se usará el valor por defecto
const maxRetries = config.maxRetries || 3;

// Correcto: Solo si config.maxRetries es null o undefined, se usará el valor por defecto
const maxRetries = config.maxRetries ?? 3;
```

### Uso de Encadenamiento Opcional (`?.`)

El encadenamiento opcional (`?.`) permite leer el valor de una propiedad ubicada profundamente sin tener que validar explícitamente que cada referencia en la cadena sea válida.

**Ejemplo:**
```typescript
// Incorrecto: Verificaciones anidadas
if (response && response.data && response.data.patient) {
  const name = response.data.patient.name;
}

// Correcto: Uso de encadenamiento opcional
const name = response?.data?.patient?.name;
```

### Corrección de Tipos `any`

**Pasos para eliminar `any`:**

1. **Identificar la estructura del objeto:**
   ```typescript
   // De:
   function processPatient(patient: any): any {
     return {
       id: patient.id,
       fullName: `${patient.firstName} ${patient.lastName}`
     };
   }

   // A:
   interface Patient {
     id: string;
     firstName: string;
     lastName: string;
   }

   interface ProcessedPatient {
     id: string;
     fullName: string;
   }

   function processPatient(patient: Patient): ProcessedPatient {
     return {
       id: patient.id,
       fullName: `${patient.firstName} ${patient.lastName}`
     };
   }
   ```

2. **Usar genéricos cuando sea apropiado:**
   ```typescript
   // De:
   function getFirstItem(array: any[]): any {
     return array[0];
   }

   // A:
   function getFirstItem<T>(array: T[]): T | undefined {
     return array[0];
   }
   ```

3. **Usar tipos de utilidad:**
   ```typescript
   // De:
   function updatePatient(id: string, data: any): Promise<any> {
     return api.patch(`/patients/${id}`, data);
   }

   // A:
   function updatePatient(
     id: string,
     data: Partial<Patient>
   ): Promise<Patient> {
     return api.patch(`/patients/${id}`, data);
   }
   ```

## Herramientas Automáticas

### Corregir Automáticamente con ESLint

```bash
# Corregir problemas autoarreglables
npx eslint --fix src/

# Corregir archivos específicos
npx eslint --fix src/services/emr/implementations/ClinicCloudAdapter.ts
```

### Verificar Tipos con TypeScript

```bash
# Verificar tipos en todo el proyecto
npx tsc --noEmit

# Verificar un archivo específico
npx tsc --noEmit src/services/emr/implementations/ClinicCloudAdapter.ts
```

## Mejores Prácticas

1. **Corregir los errores críticos inmediatamente**
2. **Revisar regularmente los errores de menor prioridad**
3. **Incluir la solución de errores de linting como parte del proceso de desarrollo**
4. **Ejecutar linting antes de cada commit**
5. **Documentar patrones de errores recurrentes y sus soluciones**

Recuerda que mantener un código limpio y bien tipado no solo mejora la calidad, sino que también reduce los bugs y facilita el mantenimiento a largo plazo.
