# Guía de Solución de Problemas

Esta guía proporciona soluciones para los errores más comunes que pueden ocurrir en el proyecto Maple AI Health.

## Errores de TypeScript

### 1. Errores con modificador `readonly`

#### Síntoma
```
TS1042: 'readonly' modifier cannot be used here.
```

#### Causa
El modificador `readonly` se está usando incorrectamente en objetos literales, cuando solo debe usarse en interfaces y tipos.

#### Solución
- **En interfaces (correcto)**:
  ```typescript
  interface Usuario {
    readonly id: string;
    nombre: string;
  }
  ```

- **En objetos literales (incorrecto)**:
  ```typescript
  // Incorrecto
  const usuario = {
    readonly id: '123',  // Error
    nombre: 'Juan'
  };

  // Correcto
  const usuario = {
    id: '123',
    nombre: 'Juan'
  };
  ```

### 2. Incompatibilidad de tipos entre módulos

#### Síntoma
```
Type 'import("path/to/module1").Recommendation' is not assignable to parameter of type 'import("path/to/module2").Recommendation'.
```

#### Causa
Existen múltiples definiciones del mismo tipo en diferentes archivos que no son compatibles entre sí.

#### Solución
1. **Centralizar definiciones de tipos**:
   ```typescript
   // src/types/common.ts
   export interface Recommendation {
     id: string;
     content: string;
     // ...otras propiedades
   }
   ```

2. **Usar aserciones de tipo cuando se conoce la compatibilidad**:
   ```typescript
   const recommendation = someFunction() as Recommendation;
   ```

3. **Crear mappers entre tipos incompatibles**:
   ```typescript
   function mapToCompatibleType(recommendation: TypeA): TypeB {
     return {
       id: recommendation.id,
       // mapear otras propiedades
     };
   }
   ```

### 3. Propiedades obligatorias faltantes

#### Síntoma
```
Property 'createdAt' is missing in type '{ ... }' but required in type 'UnstructuredNote'.
```

#### Causa
Se está creando un objeto sin todas las propiedades requeridas por su tipo.

#### Solución
1. **Asegurarse de incluir todas las propiedades requeridas**:
   ```typescript
   const note: UnstructuredNote = {
     id: 'note-1',
     content: 'Contenido',
     type: 'progress',
     createdAt: new Date()  // Propiedad necesaria
   };
   ```

2. **Hacer la propiedad opcional en la definición del tipo**:
   ```typescript
   interface UnstructuredNote {
     id: string;
     content: string;
     createdAt?: Date;  // Propiedad opcional
   }
   ```

3. **Usar tipos parciales para construcción gradual**:
   ```typescript
   const partialNote: Partial<UnstructuredNote> = {
     id: 'note-1'
   };
   // Completar más tarde
   ```

### 4. Operaciones con tipos no numéricos

#### Síntoma
```
Operator '>' cannot be applied to types '{}' and 'number'.
```

#### Causa
Se están realizando operaciones aritméticas o comparaciones con variables que no son numéricas.

#### Solución
1. **Convertir explícitamente a número**:
   ```typescript
   if (Number(totalItems) > 0) {
     // código
   }
   ```

2. **Validar el tipo antes de operar**:
   ```typescript
   const numericValue = typeof value === 'number' ? value : 0;
   const result = numericValue + 10;
   ```

## Errores de React

### 1. Violación de reglas de hooks

#### Síntoma
```
React Hook "useMemo" cannot be called inside a callback.
```

#### Causa
Los hooks de React deben ser llamados en el nivel superior de los componentes, no dentro de callbacks, condiciones o loops.

#### Solución
1. **Mover hooks al nivel superior**:
   ```typescript
   // Incorrecto
   const Component = () => {
     const handleClick = () => {
       const value = useMemo(() => compute(), []); // Error
     };

     // Correcto
     const Component = () => {
       const memoizedValue = useMemo(() => compute(), []);
       const handleClick = () => {
         // usar memoizedValue aquí
       };
     };
   ```

2. **Usar hooks condicionales de manera segura**:
   ```typescript
   useEffect(() => {
     if (condition) {
       // Esta es la forma correcta de usar condiciones con hooks
     }
   }, [condition]);
   ```

### 2. Dependencias faltantes en useEffect/useMemo/useCallback

#### Síntoma
```
React Hook useEffect has a missing dependency: 'data'.
```

#### Causa
Se está utilizando una variable externa en un hook pero no se incluye en el array de dependencias.

#### Solución
1. **Incluir todas las dependencias necesarias**:
   ```typescript
   useEffect(() => {
     console.log(data);
   }, [data]); // data incluido como dependencia
   ```

2. **Usar el Hook lint plugin**:
   ```bash
   npm install -D eslint-plugin-react-hooks
   ```
   Y añadir a la configuración de ESLint:
   ```json
   "extends": ["plugin:react-hooks/recommended"]
   ```

### 3. Atributos ARIA inválidos

#### Síntoma
```
ARIA attributes must conform to valid values.
```

#### Causa
Los atributos ARIA deben tener valores específicos y muchas veces deben ser strings, no expresiones.

#### Solución
1. **Usar valores string para atributos ARIA**:
   ```jsx
   // Incorrecto
   <button aria-expanded={isExpanded}>Expandir</button>

   // Correcto
   <button aria-expanded={isExpanded ? "true" : "false"}>Expandir</button>
   ```

## Herramientas para prevención

### Script de corrección automatizada

El proyecto incluye un script que puede corregir automáticamente muchos de estos errores:

```bash
node scripts/fix-typescript-errors.cjs
```

### Verificaciones pre-commit

Configurar Husky para verificar tipos y linting antes de cada commit:

1. **Instalar Husky**:
   ```bash
   npx husky-init && npm install
   ```

2. **Configurar hooks pre-commit**:
   ```bash
   npx husky add .husky/pre-commit "npm run lint && npm run type-check"
   ```

## Referencias útiles

- [Documentación oficial de TypeScript](https://www.typescriptlang.org/docs/)
- [Reglas de Hooks de React](https://reactjs.org/docs/hooks-rules.html)
- [Lista completa de atributos ARIA](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Attributes)
