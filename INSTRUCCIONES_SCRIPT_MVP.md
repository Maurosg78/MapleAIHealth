# Instrucciones para la Reorganización del MVP

## Requisitos Previos

1. Asegúrate de tener Node.js instalado en tu sistema.
2. Las dependencias necesarias ya están instaladas en el proyecto.

## Configuración del Token de GitHub

Es necesario configurar un token de acceso personal de GitHub para ejecutar este script:

1. Abre el archivo `.github_token.txt` en la raíz del proyecto.
2. Reemplaza el contenido con tu token personal de GitHub.
   - No incluyas espacios adicionales ni saltos de línea.
   - El token debe tener los permisos: `repo`, `project`, `workflow`.

## Ejecución del Script

Una vez configurado el token, ejecuta el siguiente comando en la terminal:

```bash
node scripts/reorganizeMVPSprint.js
```

## ¿Qué hace el script?

El script realizará las siguientes acciones:

1. **Limpieza de datos existentes**:
   - Elimina milestones anteriores que coincidan con los nuevos sprints.
   - Cierra issues similares que puedan ser duplicados.

2. **Creación de etiquetas**:
   - Configura etiquetas como `high-priority`, `core`, `feature`, etc.

3. **Creación de milestones**:
   - Crea 3 sprints con fechas de vencimiento escalonadas.

4. **Creación de issues**:
   - Genera issues organizados por sprint con descripciones detalladas.

5. **Configuración del proyecto**:
   - Crea un tablero Kanban con las columnas: Backlog, To Do, In Progress, Review, Done.

## Resolución de problemas

Si encuentras errores durante la ejecución:

1. **Error de autenticación**: Verifica que el token sea válido y tenga los permisos necesarios.
2. **Fallo en la creación de issues**: Puede deberse a límites de API; espera unos minutos y vuelve a intentar.
3. **Error de conexión**: Comprueba tu conexión a internet.

## Siguientes pasos después de la ejecución

1. Visita tu repositorio en GitHub para confirmar que los milestones e issues se han creado correctamente.
2. Verifica el proyecto creado en la pestaña "Projects" del repositorio.
3. Asigna los issues a los miembros del equipo según corresponda. 