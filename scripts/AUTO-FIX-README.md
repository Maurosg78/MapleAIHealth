# Scripts de Corrección Automática Nocturna

Este conjunto de scripts permite ejecutar un proceso automatizado para corregir errores de TypeScript y ESLint durante la noche, sin necesidad de intervención humana.

## Descripción de los Scripts

1. **night-auto-fix.sh**: Script principal que realiza las correcciones automáticas. Ejecuta una serie de pasos para identificar y corregir errores comunes.

2. **start-night-fix.sh**: Script para iniciar el proceso en segundo plano, permitiendo que continúe incluso después de cerrar la terminal.

3. **check-night-fix.sh**: Script para verificar el progreso del proceso y detenerlo si es necesario.

## Cómo Utilizar los Scripts

### Para iniciar el proceso automático nocturno:

```bash
# Desde la raíz del proyecto
./scripts/start-night-fix.sh
```

Este comando iniciará el proceso en segundo plano y mostrará información sobre cómo monitorear su progreso.

### Para verificar el progreso:

```bash
# Desde la raíz del proyecto
./scripts/check-night-fix.sh
```

Este comando mostrará las últimas líneas del log y te permitirá detener el proceso si es necesario.

## Funcionamiento del Proceso Automático

El script `night-auto-fix.sh` sigue estos pasos:

1. Crea una nueva rama Git para los cambios.
2. Realiza un respaldo inicial del código.
3. Registra el número inicial de errores.
4. Ejecuta iteraciones de corrección aplicando diferentes técnicas:
   - Corrección de espacios y formato.
   - Corrección de imports.
   - Corrección de variables no utilizadas.
   - Corrección de errores comunes.
   - Corrección específica para interfaces y tipos.
   - Corrección automática de ESLint.
5. En cada iteración, verifica si ha habido mejoras en el número de errores.
6. Después de múltiples iteraciones sin mejora, aplica enfoques más específicos para errores persistentes.
7. Finaliza cuando los errores están por debajo de un umbral o cuando no hay más mejoras posibles.
8. Genera un informe final con estadísticas sobre la reducción de errores.

## Resultados

Después de que el proceso termine, encontrarás:

- Una nueva rama Git con todos los cambios aplicados.
- Archivos de log detallados en el directorio `reports/`.
- Respaldos del código original en el directorio `backups/`.

## Recomendaciones

1. **Revisa los cambios**: Aunque el proceso es automático, es recomendable revisar los cambios antes de fusionarlos con la rama principal.

2. **Pruebas**: Ejecuta las pruebas del proyecto para asegurarte de que las correcciones no han introducido nuevos problemas.

3. **Timing**: Inicia el proceso por la noche cuando no haya desarrollo activo en el proyecto.

## Solución de Problemas

Si el proceso se detiene inesperadamente o encuentras errores, verifica:

1. Los archivos de log en el directorio `logs/` para ver detalles sobre el error.
2. Si es necesario, puedes detener manualmente el proceso usando `check-night-fix.sh`.
3. Si hay cambios parciales, puedes decidir si confirmarlos o descartarlos.

## Personalización

El script `night-auto-fix.sh` contiene variables configurables al inicio del archivo que puedes ajustar según tus necesidades:

- `MAX_ITERATIONS`: Número máximo de iteraciones de corrección.
- `ERROR_THRESHOLD`: Umbral de errores para considerar el proceso completado.

Modifica estos valores según la complejidad de tu proyecto y la cantidad de errores.
